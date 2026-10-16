import logging
from pydantic import BaseModel, Field

from app.core.config import settings

logger = logging.getLogger(__name__)


class ExtractedLabel(BaseModel):
    extraction_confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Confidence that the extracted medicine fields were read correctly, from 0 to 1",
    )
    nrn: str | None = Field(default=None, description="NAFDAC Registration Number (e.g., 04-1234, A4-0199)")
    product_name: str | None = Field(default=None, description="Trade or brand name on package")
    active_ingredients: list[str] = Field(default_factory=list, description="List of active chemical ingredients")
    strength: str | None = Field(default=None, description="Dosage strength (e.g. 500mg, 80/480mg)")
    dosage_form: str | None = Field(default=None, description="Dosage form: Tablet, Capsule, Syrup, Cream, etc.")
    manufacturer: str | None = Field(default=None, description="Pharmaceutical company or manufacturer name")
    confidence_notes: str | None = Field(default=None, description="Observation on image clarity, blurriness, or debossed stamp")
    raw_text: str | None = Field(default=None, description="All visible text transcribed from packaging")


EXTRACTION_PROMPT = """
You are an expert pharmaceutical packaging OCR reader specializing in Nigerian medicine labels.
Examine this image of a medicine package, carton, or blister pack.
Extract the following information accurately:
1. NAFDAC Registration Number (NRN): Look for labels like "NAFDAC Reg. No.", "NRN:", "Reg No", or codes matching patterns like 04-1234, A4-0199, B4-5678, etc. Be extremely careful distinguishing '0' vs 'O' and '1' vs 'I' or 'l'.
2. Product Brand / Trade Name: e.g. "Emzor Paracetamol", "Lonart DS", "Coartem".
3. Active Pharmaceutical Ingredients: e.g. ["Paracetamol"] or ["Artemether", "Lumefantrine"].
4. Strength: e.g. "500 mg", "80mg/480mg", "20/120".
5. Dosage Form: e.g. "Tablet", "Capsule", "Suspension", "Syrup", "Cream".
6. Manufacturer: The authorized manufacturing company.
7. Any notes on packaging readability or blurred sections.
8. Overall extraction_confidence from 0.0 to 1.0 for the fields you extracted. Use a low score when text is blurry, obstructed, ambiguous, or inferred rather than clearly readable.

Output strictly valid JSON matching the requested schema. If a field cannot be read or is missing, leave it as null or empty list.
"""


class LabelExtractor:
    def __init__(self) -> None:
        self.api_key = settings.gemini_api_key.get_secret_value() if settings.gemini_api_key else None
        self.model_name = settings.gemini_vision_model or settings.gemma_model or "gemini-2.5-flash"

    def extract_from_bytes(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> ExtractedLabel:
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is not configured on the server.")
            return ExtractedLabel(
                extraction_confidence=0.0,
                confidence_notes="Gemini API key is not configured on the server. Label extraction unavailable."
            )

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=self.api_key)
            response = client.models.generate_content(
                model=self.model_name,
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                    EXTRACTION_PROMPT,
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ExtractedLabel,
                    temperature=0.1,
                ),
            )

            if response.text:
                return ExtractedLabel.model_validate_json(response.text)
            return ExtractedLabel(
                extraction_confidence=0.0,
                confidence_notes="Model returned empty extraction from image.",
            )

        except Exception as e:
            logger.error(f"Gemini Vision extraction failed: {e}")
            return ExtractedLabel(
                extraction_confidence=0.0,
                confidence_notes=f"Extraction service error: {str(e)}. Please enter details manually."
            )


label_extractor = LabelExtractor()
