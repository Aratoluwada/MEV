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


