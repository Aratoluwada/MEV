import pytest

from app.models.schemas import ExplanationBlock
from app.services.explainer import gemma_explainer
from app.services.extractor import ExtractedLabel, label_extractor
from app.services.text_parser import gemma_text_parser


@pytest.fixture(autouse=True)
def stub_external_model_calls(monkeypatch: pytest.MonkeyPatch) -> None:
    def explain_without_model(
        verdict,
        confidence_percentage,
        reasons,
        matched_record,
        submitted_name,
        submitted_nrn,
        language="en",
    ) -> ExplanationBlock:
        return gemma_explainer._fallback_explanation(
            verdict=verdict,
            matched_record=matched_record,
            submitted_name=submitted_name,
            submitted_nrn=submitted_nrn,
            language=language,
        )

    def extract_without_model(image_bytes: bytes, mime_type: str = "image/jpeg") -> ExtractedLabel:
        return ExtractedLabel(
            extraction_confidence=0.0,
            confidence_notes="Model extraction stubbed during tests.",
        )

    monkeypatch.setattr(gemma_explainer, "explain", explain_without_model)
    monkeypatch.setattr(label_extractor, "extract_from_bytes", extract_without_model)
    monkeypatch.setattr(
        gemma_text_parser,
        "parse_user_text",
        gemma_text_parser._heuristic_fallback_parser,
    )
