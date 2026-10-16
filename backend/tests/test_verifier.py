from fastapi.testclient import TestClient

from app.db.repository import normalize_nrn, registry_repository
from app.main import app
from app.models.schemas import ConfidenceTier, VerdictEnum
from app.services.extractor import ExtractedLabel, label_extractor

client = TestClient(app)


def test_nrn_normalization():
    assert normalize_nrn("A4-6238") == "A46238"
    assert normalize_nrn("NAFDAC Reg. No: A4-6238") == "A46238"
    assert normalize_nrn("nafdac  a4 - 6238 ") == "A46238"
    assert normalize_nrn("") == ""
    assert normalize_nrn(None) == ""


def test_verify_exact_match_real_greenbook():
    """Verify an active medicine from the 7,460 official Greenbook records."""
    payload = {
        "nrn": "A4-6238",
        "product_name": "Artheget EZ",
        "active_ingredients": ["Artemether", "Lumefantrine"],
        "strength": "80 mg; 480 mg",
        "dosage_form": "Tablet",
        "language": "en",
    }
    response = client.post("/api/v1/check", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["verdict"] == VerdictEnum.REGISTERED_MATCH.value
    assert data["confidence_percentage"] == 100
    assert data["confidence_tier"] == ConfidenceTier.HIGH.value
    assert data["comparison"]["nrn"]["matches"] is True
    assert data["comparison"]["product_name"]["matches"] is True
    assert data["comparison"]["strength"]["matches"] is True
    assert data["comparison"]["dosage_form"]["matches"] is True
    assert data["matched_record"]["nrn"] == "A4-6238"
    assert data["matched_record"]["manufacturer"] is None
    assert data["matched_record"]["applicant_name"]
    assert data["dataset_metadata"]["records_loaded"] == 7460
    assert "NAFDAC Greenbook" in data["dataset_metadata"]["source"]


