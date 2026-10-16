import logging
from pydantic import BaseModel, Field

from app.core.config import settings
from app.models.registry import RegistryRecord
from app.models.schemas import ExplanationBlock, VerdictEnum

logger = logging.getLogger(__name__)


class GemmaExplanationOutput(BaseModel):
    summary: str = Field(description="Clear explanation in plain English")
    pidgin_summary: str = Field(description="Empathetic explanation in authentic Nigerian Pidgin")
    action_recommendation: str = Field(description="Practical recommended next step for the patient")


SYSTEM_INSTRUCTION = """
You are Gemma 4, an open AI model developed by Google DeepMind, assisting patients in Nigeria with medicine verification.
Your job is to explain regulatory evidence from the NAFDAC database in clear English and authentic, warm Nigerian Pidgin.

CRITICAL SAFETY RULES:
1. NEVER overturn or contradict the official verdict provided to you.
2. NEVER give clinical medical advice, dosage instructions, or treatment prescriptions.
3. NEVER claim a medicine is chemically 100% genuine or guaranteed safe—only explain the regulatory record match.
4. For Nigerian Pidgin, use natural, everyday Nigerian phrasing (e.g. "Shine your eye", "E set", "No worry", "Make you double-check with pharmacist").
"""


class GemmaExplainerService:
    def __init__(self) -> None:
        self.api_key = settings.gemini_api_key.get_secret_value() if settings.gemini_api_key else None
        self.model_name = settings.gemma_model or "gemma-4-26b-a4b-it"

    def explain(
        self,
        verdict: VerdictEnum,
        confidence_percentage: int,
        reasons: list[str],
        matched_record: RegistryRecord | None,
        submitted_name: str | None,
        submitted_nrn: str | None,
        language: str = "en",
    ) -> ExplanationBlock:
        """Use Gemma 4 to explain the verification evidence in plain English and Nigerian Pidgin."""
        if not self.api_key:
            return self._fallback_explanation(verdict, matched_record, submitted_name, submitted_nrn, language)

        prompt = f"""
Official Verdict: {verdict.value}
Confidence Score: {confidence_percentage}%
Evidence Reasons: {"; ".join(reasons)}
User Submitted Product: {submitted_name or 'N/A'} (NRN: {submitted_nrn or 'N/A'})
Matched Registry Record: {matched_record.product_name if matched_record else 'No record found'} (NRN: {matched_record.nrn if matched_record else 'N/A'}, Status: {matched_record.status.value if matched_record else 'N/A'})

Explain what this result means to the patient holding this medicine box.
Provide:
1. A clear English explanation (summary).
2. A natural Nigerian Pidgin explanation (pidgin_summary).
3. A clear safety next step (action_recommendation).
"""

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=self.api_key)
            response = client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    response_schema=GemmaExplanationOutput,
                    temperature=0.2,
                ),
            )

            if response.text:
                parsed = GemmaExplanationOutput.model_validate_json(response.text)
                return ExplanationBlock(
                    language=language,
                    summary=parsed.summary,
                    pidgin_summary=parsed.pidgin_summary,
                    action_recommendation=parsed.action_recommendation,
                )

        except Exception as e:
            logger.warning(f"Gemma 4 explanation call failed ({e}). Falling back to deterministic templates.")

        return self._fallback_explanation(verdict, matched_record, submitted_name, submitted_nrn, language)

    def _fallback_explanation(
        self,
        verdict: VerdictEnum,
        matched_record: RegistryRecord | None,
        submitted_name: str | None,
        submitted_nrn: str | None,
        language: str = "en",
    ) -> ExplanationBlock:
        """Deterministic fallback when offline or API key is not configured."""
        if verdict == VerdictEnum.REGISTERED_MATCH:
            name = matched_record.product_name if matched_record else (submitted_name or "this medicine")
            applicant = matched_record.applicant_name if matched_record else None
            applicant_note = f" The listed applicant is '{applicant}'." if applicant else ""
            return ExplanationBlock(
                language=language,
                summary=f"This matches an active NAFDAC record for '{name}'.{applicant_note}",
                pidgin_summary=f"Dis details match an active NAFDAC record for '{name}'.",
                action_recommendation="Inspect physical packaging to ensure safety seals and manufacturer holograms are intact.",
            )
        elif verdict == VerdictEnum.REGISTERED_MISMATCH:
            reg_name = matched_record.product_name if matched_record else "another drug"
            return ExplanationBlock(
                language=language,
                summary=f"Warning (Gemma 4 Flag): NAFDAC number '{submitted_nrn}' belongs to '{reg_name}', not '{submitted_name}'. Suspected cloned registration number.",
                pidgin_summary=f"O boy, shine your eye! Gemma 4 see say di NAFDAC number '{submitted_nrn}' dey for '{reg_name}', no be for '{submitted_name}'. E fit be say dem copy di number.",
                action_recommendation="DO NOT use this medicine until confirmed with a licensed doctor or pharmacist. Report to NAFDAC.",
            )
        elif verdict == VerdictEnum.INACTIVE:
            status = matched_record.status.value if matched_record else "INACTIVE"
            return ExplanationBlock(
                language=language,
                summary=f"Notice: This medicine was found in NAFDAC records but is currently {status}. The registration is no longer active.",
                pidgin_summary=f"Di medicine dey NAFDAC book before, but di permit don {status}. E no dey active again.",
                action_recommendation="Consult a pharmacist for an active, currently registered alternative.",
            )
        elif verdict == VerdictEnum.NOT_FOUND:
            item = submitted_nrn or submitted_name or "This medicine"
            return ExplanationBlock(
                language=language,
                summary=f"'{item}' was not found in our NAFDAC snapshot. This does not automatically prove it is fake, but it is unverified.",
                pidgin_summary=f"We no see '{item}' for our NAFDAC snapshot. Dat one no mean say na fake by force, but we no fit confirm am for now.",
                action_recommendation="Verify directly on the official NAFDAC Green Book database or consult a licensed pharmacist.",
            )
        else:
            return ExplanationBlock(
                language=language,
                summary="Could not read or find sufficient medicine identifiers from your input.",
                pidgin_summary="We no fit see or read any NAFDAC number or medicine name for wetin you send.",
                action_recommendation="Please re-check the medicine package and enter the NAFDAC number or trade name.",
            )


gemma_explainer = GemmaExplainerService()
