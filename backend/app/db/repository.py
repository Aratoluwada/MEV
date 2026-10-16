import re

def normalize_nrn(nrn: str | None) -> str:
    """Clean and normalize NAFDAC Registration Number for canonical lookup."""
    if not nrn:
        return ""
    cleaned = re.sub(r"(?i)nafdac\s*(?:reg(?:istration)?\.?\s*(?:no\.?|number)?)?:?", "", nrn)
    return re.sub(r"[^A-Za-z0-9]", "", cleaned).upper()
