import re
from app.db.repository import normalize_nrn, registry_repository
from app.models.registry import RecordStatus, RegistryRecord
from app.models.schemas import CheckRequest, CheckResponse, ComparisonBreakdown, ConfidenceTier, ExplanationBlock, FieldComparison, VerdictEnum

def _clean_text(text: str | None) -> str:
    if not text:
        return ""
    cleaned = text.rstrip("#").strip().lower()
    return re.sub(r"[^a-zA-Z0-9\s]", "", cleaned)

def _compare_names(submitted: str | None, registered: str) -> tuple[bool | None, str | None]:
    if not submitted or not submitted.strip():
        return None, "Not submitted"
    clean_sub = _clean_text(submitted)
    clean_reg = _clean_text(registered)
    if not clean_sub:
        return None, "Not submitted"
    if clean_sub == clean_reg:
        return True, "Exact name match"
    sub_tokens = set(clean_sub.split())
    reg_tokens = set(clean_reg.split())
    overlap = sub_tokens.intersection(reg_tokens)
    significant_overlap = [t for t in overlap if len(t) >= 3 and t not in {"tablet", "tablets", "capsule", "capsules", "syrup"}]
    if significant_overlap or len(overlap) >= 2:
        return True, f"Name aligns (matched: {', '.join(overlap)})"
    return False, f"Name mismatch ('{submitted}' vs registered '{registered}')"
