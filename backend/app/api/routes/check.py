import asyncio
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile

from app.db.repository import registry_repository
from app.models.registry import RegistryRecord
from app.models.schemas import (
    BasketCheckRequest,
    BasketCheckResponse,
    CheckRequest,
    CheckResponse,
    ComparisonBreakdown,
    ConfidenceTier,
    ExplanationBlock,
    TextCheckRequest,
    VerdictEnum,
)
from app.services.basket import basket_checker
from app.services.extractor import ExtractedLabel, label_extractor
from app.services.text_parser import ParsedMedicineText, gemma_text_parser
from app.services.verifier import verifier

router = APIRouter(prefix="/api/v1", tags=["Medicine Verification"])

MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
MIN_EXTRACTION_CONFIDENCE = 0.7


async def _read_and_validate_image(file: UploadFile) -> tuple[bytes, str]:
    """Read upload with strict size limit and validate magic bytes."""
    contents = bytearray()
    while chunk := await file.read(64 * 1024):
        contents.extend(chunk)
        if len(contents) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(status_code=413, detail="Uploaded image exceeds 10 MB size limit.")

    if len(contents) < 12:
        raise HTTPException(status_code=400, detail="Invalid image file (file is too small or empty).")

    # Magic byte verification
    header = bytes(contents[:12])
    if header.startswith(b"\xff\xd8\xff"):
        mime_type = "image/jpeg"
    elif header.startswith(b"\x89PNG\r\n\x1a\n"):
        mime_type = "image/png"
    elif header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        mime_type = "image/webp"
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Upload must be a valid JPEG, PNG, or WebP image.",
        )

    return bytes(contents), mime_type


@router.post("/check", response_model=CheckResponse, summary="Verify medicine details against registry")
def check_medicine(request: CheckRequest) -> CheckResponse:
    """Perform a deterministic verification check on submitted medicine details.
    
    Accepts:
    - nrn: NAFDAC Registration Number (e.g., 'A4-6238')
    - product_name: Brand/Trade name (e.g., 'Artheget EZ')
    - active_ingredients: List of ingredients (e.g., ['Artemether', 'Lumefantrine'])
    - strength: Dosage strength (e.g., '80 mg; 480 mg')
    - dosage_form: Form of medicine (e.g., 'Tablet')
    - language: 'en' (English) or 'pcm' (Nigerian Pidgin)
    """
    return verifier.verify(request)


@router.post("/scan-label", response_model=ExtractedLabel, summary="Extract medicine label fields from package photo")
async def scan_label(file: UploadFile = File(..., description="Medicine package or blister pack image")) -> ExtractedLabel:
    """Scan a medicine package image using Gemini/Gemma Vision to extract NRN, name, ingredients, and strength.
    
    Runs asynchronously off the main event loop and fails closed if extraction is unavailable.
    """
    data_bytes, mime_type = await _read_and_validate_image(file)
    return await asyncio.to_thread(label_extractor.extract_from_bytes, data_bytes, mime_type)


@router.post("/verify-image", response_model=CheckResponse, summary="1-Click image upload to full verification")
async def verify_image(
    file: UploadFile = File(..., description="Medicine package photo"),
    language: str = Form(default="en", description="'en' for English or 'pcm' for Nigerian Pidgin"),
) -> CheckResponse:
    """One-click workflow: Upload an image, extract label details, and run verification immediately.
    
    Fails closed as UNREADABLE if the image cannot be read or extraction service is unavailable.
    """
    data_bytes, mime_type = await _read_and_validate_image(file)
    extracted = await asyncio.to_thread(label_extractor.extract_from_bytes, data_bytes, mime_type)

    # Fail closed when the model could not read enough of the label reliably.
    if (
        extracted.extraction_confidence < MIN_EXTRACTION_CONFIDENCE
        or not (extracted.nrn or extracted.product_name or extracted.active_ingredients)
    ):
        metadata = registry_repository.get_metadata()
        reason = (
            "Image extraction confidence was below the minimum required for a registry check "
            f"({extracted.extraction_confidence:.0%}; minimum {MIN_EXTRACTION_CONFIDENCE:.0%})."
        )
        if extracted.confidence_notes:
            reason += f" ({extracted.confidence_notes})"

        return CheckResponse(
            verdict=VerdictEnum.UNREADABLE,
            confidence_percentage=0,
            confidence_tier=ConfidenceTier.LOW,
            reasons=[reason],
            comparison=ComparisonBreakdown(),
            matched_record=None,
            explanation=ExplanationBlock(
                language=language,
                summary="The label could not be read with enough confidence to verify. Please check the extracted details manually or upload a clearer photo.",
                pidgin_summary="We no fit read any medicine detail from dis picture. Make you try type am or snap clearer picture.",
                action_recommendation="Take a well-lit photo showing the NAFDAC number clearly or enter details manually.",
            ),
            dataset_metadata=metadata,
        )

    check_req = CheckRequest(
        nrn=extracted.nrn,
        product_name=extracted.product_name,
        active_ingredients=extracted.active_ingredients,
        strength=extracted.strength,
        dosage_form=extracted.dosage_form,
        language=language,
    )
    return verifier.verify(check_req)


@router.post("/parse-text", response_model=ParsedMedicineText, summary="Gemma 4 text entity extraction")
def parse_text(request: TextCheckRequest) -> ParsedMedicineText:
    """Parse unstructured text or transcribed speech into structured medicine entities using Gemma 4."""
    return gemma_text_parser.parse_user_text(request.query)


@router.post("/check-text", response_model=CheckResponse, summary="Gemma 4 end-to-end natural text verification")
def check_by_text(request: TextCheckRequest) -> CheckResponse:
    """End-to-end natural language check: Parse user text with Gemma 4 and run verification immediately."""
    parsed = gemma_text_parser.parse_user_text(request.query)
    check_req = CheckRequest(
        nrn=parsed.nrn,
        product_name=parsed.product_name,
        active_ingredients=parsed.active_ingredients,
        strength=parsed.strength,
        dosage_form=parsed.dosage_form,
        language=request.language,
    )
    return verifier.verify(check_req)


@router.post("/basket-check", response_model=BasketCheckResponse, summary="Detect duplicate active ingredients in basket")
def check_basket(request: BasketCheckRequest) -> BasketCheckResponse:
    """Check a patient's medicine basket for duplicate active ingredients to prevent accidental toxic overdose."""
    return basket_checker.check_basket(request)


@router.get("/product/{nrn}", response_model=RegistryRecord, summary="Lookup official Greenbook record by NRN")
def get_product(nrn: str) -> RegistryRecord:
    """Retrieve official NAFDAC record by registration number."""
    record = registry_repository.get_by_nrn(nrn)
    if not record:
        raise HTTPException(status_code=404, detail=f"No record found for NRN '{nrn}' in official Greenbook snapshot.")
    return record


@router.get("/registry/{nrn}", response_model=RegistryRecord, include_in_schema=False)
def get_by_nrn_alias(nrn: str) -> RegistryRecord:
    """Alias for /product/{nrn}."""
    return get_product(nrn)


@router.get("/registry/search", response_model=list[RegistryRecord], summary="Search Greenbook registry by name")
def search_registry(q: str = Query(..., min_length=2, description="Search term")) -> list[RegistryRecord]:
    """Search for medicine records by product or generic name across 7,460 official records."""
    return registry_repository.search_by_name(q)


@router.get("/registry", response_model=list[RegistryRecord], summary="List snapshot sample records")
def list_registry(limit: int = 20) -> list[RegistryRecord]:
    """List sample records from the official Greenbook snapshot."""
    return registry_repository.get_all(limit=limit)
