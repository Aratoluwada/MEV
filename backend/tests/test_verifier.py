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


def test_verify_critical_conflict_name_mismatch():
    """Scenario: Cloned NRN - NRN belongs to antimalarial, but packaging claims Paracetamol."""
    payload = {
        "nrn": "A4-6238",
        "product_name": "Paracetamol Tablets",
        "active_ingredients": ["Paracetamol"],
    }
    response = client.post("/api/v1/check", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["verdict"] == VerdictEnum.REGISTERED_MISMATCH.value
    assert data["confidence_percentage"] == 0
    assert data["confidence_tier"] == ConfidenceTier.CONFLICT.value
    assert "CRITICAL CONFLICT" in data["reasons"][0]


def test_verify_critical_conflict_strength_mismatch():
    """Scenario: Strength conflict alone MUST trigger REGISTERED_MISMATCH and zero score."""
    payload = {
        "nrn": "A4-6238",
        "product_name": "Artheget EZ",
        "strength": "1000 mg",  # Registered is 80 mg; 480 mg
    }
    response = client.post("/api/v1/check", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["verdict"] == VerdictEnum.REGISTERED_MISMATCH.value
    assert data["confidence_percentage"] == 0
    assert data["confidence_tier"] == ConfidenceTier.CONFLICT.value
    assert any("Strength" in r for r in data["reasons"])


def test_verify_critical_conflict_dosage_form_mismatch():
    """Scenario: Dosage form conflict alone MUST trigger REGISTERED_MISMATCH and zero score."""
    payload = {
        "nrn": "A4-6238",
        "product_name": "Artheget EZ",
        "dosage_form": "Syrup",  # Registered is Tablet
    }
    response = client.post("/api/v1/check", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["verdict"] == VerdictEnum.REGISTERED_MISMATCH.value
    assert data["confidence_percentage"] == 0
    assert data["confidence_tier"] == ConfidenceTier.CONFLICT.value
    assert any("Dosage form" in r for r in data["reasons"])


def test_verify_inactive_medicine_real_greenbook():
    """Scenario: Checking an inactive/expired registration from official Greenbook (Marley Paracetamol C4-1496)."""
    payload = {
        "nrn": "C4-1496",
        "product_name": "Marley Paracetamol Injection",
    }
    response = client.post("/api/v1/check", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["verdict"] == VerdictEnum.INACTIVE.value
    assert data["confidence_percentage"] == 0
    assert data["confidence_tier"] == ConfidenceTier.CONFLICT.value
    assert data["matched_record"]["status"] == "INACTIVE"


def test_active_status_with_past_expiry_is_inactive(monkeypatch):
    record = registry_repository.get_by_nrn("A4-6238")
    assert record is not None
    expired_record = record.model_copy(update={"expiry_date": "2020-01-01"})
    monkeypatch.setattr(registry_repository, "get_by_nrn", lambda nrn: expired_record)

    response = client.post("/api/v1/check", json={"nrn": "A4-6238", "product_name": "Artheget EZ"})
    assert response.status_code == 200
    data = response.json()

    assert data["verdict"] == VerdictEnum.INACTIVE.value
    assert data["confidence_percentage"] == 0
    assert data["comparison"]["status"]["registry"] == "EXPIRED"
    assert any("expiry date" in reason.lower() for reason in data["reasons"])


def test_verify_not_found():
    """Scenario: An unlisted NRN in the 7,460 records."""
    payload = {
        "nrn": "99-9999",
        "product_name": "Unregistered Miracle Tonic",
    }
    response = client.post("/api/v1/check", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["verdict"] == VerdictEnum.NOT_FOUND.value
    assert data["confidence_percentage"] == 0
    assert data["confidence_tier"] == ConfidenceTier.LOW.value
    assert data["matched_record"] is None


