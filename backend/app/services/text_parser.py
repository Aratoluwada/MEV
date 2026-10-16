import logging
import re
from pydantic import BaseModel, Field

from app.core.config import settings

logger = logging.getLogger(__name__)


class ParsedMedicineText(BaseModel):
    nrn: str | None = Field(default=None, description="Extracted NAFDAC number if present")
    product_name: str | None = Field(default=None, description="Extracted brand/product name")
    active_ingredients: list[str] = Field(default_factory=list, description="Extracted active chemical ingredients")
    strength: str | None = Field(default=None, description="Extracted strength e.g. 500mg, 80/480mg")
    dosage_form: str | None = Field(default=None, description="Extracted dosage form: Tablet, Capsule, Syrup, etc.")
    user_intent: str | None = Field(default=None, description="Summary of user's query intent")


TEXT_PARSER_PROMPT = """
You are Gemma 4, an open AI model developed by Google DeepMind.
Your task is to parse free-form text entered by a user searching for or checking a medicine in Nigeria.
Extract all relevant pharmaceutical entities:
- NAFDAC Registration Number (NRN): Look for numbers like 04-1234, A4-0199, B4-9999, etc.
- Product / Brand Name: e.g. "Emzor Paracetamol", "Lonart DS", "Augmentin".
- Active Ingredients: e.g. ["Paracetamol"], ["Artemether", "Lumefantrine"].
- Strength: e.g. "500 mg", "80mg/480mg".
- Dosage Form: e.g. "Tablet", "Capsule", "Suspension", "Syrup".

Output valid JSON matching the requested schema. If a field is not present in the user text, set it to null or empty list.
"""


class GemmaTextParser:
    def __init__(self) -> None:
        self.api_key = settings.gemini_api_key.get_secret_value() if settings.gemini_api_key else None
        self.model_name = settings.gemma_model or "gemma-4-26b-a4b-it"

    def parse_user_text(self, text: str) -> ParsedMedicineText:
        if not text or not text.strip():
            return ParsedMedicineText()

        if not self.api_key:
            return self._heuristic_fallback_parser(text)

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=self.api_key)
            response = client.models.generate_content(
                model=self.model_name,
                contents=f"User Text: \"{text.strip()}\"\n\nExtract the medicine entities according to instructions.",
                config=types.GenerateContentConfig(
                    system_instruction=TEXT_PARSER_PROMPT,
                    response_mime_type="application/json",
                    response_schema=ParsedMedicineText,
                    temperature=0.1,
                ),
            )

            if response.text:
                return ParsedMedicineText.model_validate_json(response.text)

        except Exception as e:
            logger.warning(f"Gemma 4 text parsing failed ({e}). Using regex/heuristic parser.")

        return self._heuristic_fallback_parser(text)

    def _heuristic_fallback_parser(self, text: str) -> ParsedMedicineText:
        nrn_match = re.search(r"\b([A-Z0-9]{2}\s*-\s*[0-9]{4}[A-Z]?)\b", text, re.IGNORECASE)
        nrn = nrn_match.group(1).replace(" ", "") if nrn_match else None

        strength_match = re.search(r"\b(\d+\s*(?:mg|g|mcg|ml))\b", text, re.IGNORECASE)
        strength = strength_match.group(1) if strength_match else None

        dosage_match = re.search(r"\b(tablet|capsule|syrup|suspension|inhaler|cream|gel|injection)s?\b", text, re.IGNORECASE)
        dosage_form = dosage_match.group(1).capitalize() if dosage_match else None

        # Clean up text to find potential product name
        cleaned = text
        if nrn:
            cleaned = cleaned.replace(nrn, "")
        if strength:
            cleaned = cleaned.replace(strength, "")
        cleaned = re.sub(r"\b(nafdac|reg|no|number|check|is|my|this|medicine|tablet|capsule)\b", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", cleaned).strip()
        product_name = " ".join(cleaned.split()) if cleaned else None

        return ParsedMedicineText(
            nrn=nrn,
            product_name=product_name or text.strip(),
            active_ingredients=[],
            strength=strength,
            dosage_form=dosage_form,
            user_intent="Text inquiry parsed via fallback heuristic",
        )


gemma_text_parser = GemmaTextParser()
