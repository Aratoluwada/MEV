import re
from datetime import date

from app.db.repository import normalize_nrn, registry_repository
from app.models.registry import RecordStatus, RegistryRecord
from app.models.schemas import (
    CheckRequest,
    CheckResponse,
    ComparisonBreakdown,
    ConfidenceTier,
    ExplanationBlock,
    FieldComparison,
    VerdictEnum,
)
from app.services.explainer import gemma_explainer


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
    # If key brand tokens overlap (at least 1 significant token longer than 3 chars)
    significant_overlap = [t for t in overlap if len(t) >= 3 and t not in {"tablet", "tablets", "capsule", "capsules", "syrup"}]

    if significant_overlap or len(overlap) >= 2:
        return True, f"Name aligns (matched: {', '.join(overlap)})"

    return False, f"Name mismatch ('{submitted}' vs registered '{registered}')"


def _compare_ingredients(
    submitted: list[str] | None, registered: list[str]
) -> tuple[bool | None, str | None]:
    if not submitted or len(submitted) == 0:
        return None, "Not submitted"

    clean_sub = {_clean_text(i) for i in submitted if i and _clean_text(i)}
    clean_reg = {_clean_text(i) for i in registered if i and _clean_text(i)}

    if not clean_sub:
        return None, "Not submitted"
    if not clean_reg:
        return None, "Registry record has no active ingredients listed"

    if clean_sub == clean_reg:
        return True, f"Active ingredients match ({', '.join(sorted(clean_sub))})"

    return False, f"Active ingredients do not exactly match registered formulation (submitted: {submitted}, registry: {registered})"


def _normalize_strength_tokens(text: str) -> set[str]:
    # Extract numbers with units: e.g. "80mg", "480mg", "500mg", "25mg"
    text_clean = re.sub(r"\s+", "", text.lower())
    matches = re.findall(r"(\d+(?:\.\d+)?(?:mg|g|mcg|ml|%)?)", text_clean)
    return set(matches) if matches else {_clean_text(text)}


def _compare_strength(submitted: str | None, registered: str) -> tuple[bool | None, str | None]:
    if not submitted or not submitted.strip():
        return None, "Not submitted"
    if not registered or not registered.strip():
        return None, "Registry record has no strength listed"

    sub_tokens = _normalize_strength_tokens(submitted)
    reg_tokens = _normalize_strength_tokens(registered)

    if sub_tokens == reg_tokens:
        return True, f"Strength matches ({', '.join(sorted(sub_tokens))})"

    return False, f"Strength conflict ('{submitted}' vs registered '{registered}')"


def _compare_dosage_form(submitted: str | None, registered: str) -> tuple[bool | None, str | None]:
    if not submitted or not submitted.strip():
        return None, "Not submitted"
    if not registered or not registered.strip():
        return None, "Registry record has no dosage form listed"

    clean_sub = _clean_text(submitted)
    clean_reg = _clean_text(registered)

    forms = ["tablet", "capsule", "syrup", "suspension", "cream", "gel", "injection", "inhaler", "drops", "ointment"]
    sub_form = next((f for f in forms if f in clean_sub), clean_sub)
    reg_form = next((f for f in forms if f in clean_reg), clean_reg)

    if sub_form == reg_form or sub_form in clean_reg or reg_form in clean_sub:
        return True, f"Dosage form matches ({registered})"

    return False, f"Dosage form conflict ('{submitted}' vs registered '{registered}')"


class MedicineVerifier:
    def verify(self, request: CheckRequest) -> CheckResponse:
        metadata = registry_repository.get_metadata()

        # 1. Unreadable / Empty check
        has_nrn = bool(request.nrn and request.nrn.strip())
        has_name = bool(request.product_name and request.product_name.strip())
        has_ingredients = bool(request.active_ingredients and len(request.active_ingredients) > 0)

        if not (has_nrn or has_name or has_ingredients):
            return CheckResponse(
                verdict=VerdictEnum.UNREADABLE,
                confidence_percentage=0,
                confidence_tier=ConfidenceTier.LOW,
                reasons=["No readable NAFDAC number, product name, or active ingredients provided."],
                comparison=ComparisonBreakdown(),
                matched_record=None,
                explanation=ExplanationBlock(
                    language=request.language,
                    summary="Could not read or find any medicine identifiers from the input.",
                    pidgin_summary="We no fit see or read any NAFDAC number or medicine name for wetin you send.",
                    action_recommendation="Please re-check the medicine package and enter the NAFDAC number or trade name.",
                ),
                dataset_metadata=metadata,
            )

        # 2. Database Lookup
        matched_record: RegistryRecord | None = None
        matched_via_nrn = False

        if has_nrn:
            matched_record = registry_repository.get_by_nrn(request.nrn or "")
            if matched_record:
                matched_via_nrn = True

        # Name-only lookup fallback
        if not matched_record and has_name and not has_nrn:
            candidates = registry_repository.search_by_name(request.product_name or "", limit=10)
            for cand in candidates:
                # If ingredients or strength were submitted, candidate must not contradict
                ing_test, _ = _compare_ingredients(request.active_ingredients, cand.active_ingredients)
                str_test, _ = _compare_strength(request.strength, cand.strength)
                if ing_test is not False and str_test is not False:
                    matched_record = cand
                    break

        # 3. Not Found
        if not matched_record:
            searched_id = f"NAFDAC number '{request.nrn}'" if has_nrn else f"Product '{request.product_name}'"
            return CheckResponse(
                verdict=VerdictEnum.NOT_FOUND,
                confidence_percentage=0,
                confidence_tier=ConfidenceTier.LOW,
                reasons=[
                    f"{searched_id} was not found in the official NAFDAC Greenbook snapshot ({metadata.records_loaded:,} records).",
                    "A missing record means 'not found in this local regulatory dataset', not physical proof of counterfeiting.",
                ],
                comparison=ComparisonBreakdown(
                    nrn=FieldComparison(submitted=request.nrn, registry=None, matches=False, notes="Not found in Greenbook"),
                    product_name=FieldComparison(submitted=request.product_name, registry=None, matches=False),
                ),
                matched_record=None,
                explanation=ExplanationBlock(
                    language=request.language,
                    summary=f"{searched_id} does not appear in our NAFDAC Greenbook snapshot. It cannot be verified against official records.",
                    pidgin_summary=f"We no see {searched_id} for our NAFDAC Greenbook record. Dat one no mean say na fake by force, but we no fit confirm am for now.",
                    action_recommendation="Verify directly on the official NAFDAC Green Book portal or consult a certified pharmacist.",
                ),
                dataset_metadata=metadata,
            )

        # 4. Field Comparisons
        name_match, name_notes = _compare_names(request.product_name, matched_record.product_name)
        ing_match, ing_notes = _compare_ingredients(request.active_ingredients, matched_record.active_ingredients)
        str_match, str_notes = _compare_strength(request.strength, matched_record.strength)
        form_match, form_notes = _compare_dosage_form(request.dosage_form, matched_record.dosage_form)

        nrn_match = True if matched_via_nrn else (None if not has_nrn else False)
        nrn_notes = "Exact NRN match in Greenbook" if matched_via_nrn else ("Not submitted" if not has_nrn else "NRN mismatch")
        expiry_date = None
        if matched_record.expiry_date:
            try:
                expiry_date = date.fromisoformat(matched_record.expiry_date[:10])
            except ValueError:
                expiry_date = None
        is_expired = expiry_date is not None and expiry_date < date.today()
        is_active = matched_record.status == RecordStatus.ACTIVE and not is_expired
        effective_status = RecordStatus.EXPIRED if is_expired else matched_record.status

        comparison = ComparisonBreakdown(
            nrn=FieldComparison(submitted=request.nrn, registry=matched_record.nrn, matches=nrn_match, notes=nrn_notes),
            product_name=FieldComparison(submitted=request.product_name, registry=matched_record.product_name, matches=name_match, notes=name_notes),
            active_ingredients=FieldComparison(submitted=request.active_ingredients, registry=matched_record.active_ingredients, matches=ing_match, notes=ing_notes),
            strength=FieldComparison(submitted=request.strength, registry=matched_record.strength, matches=str_match, notes=str_notes),
            dosage_form=FieldComparison(submitted=request.dosage_form, registry=matched_record.dosage_form, matches=form_match, notes=form_notes),
            status=FieldComparison(
                submitted="ACTIVE" if is_active else "UNKNOWN",
                registry=effective_status.value,
                matches=is_active,
                notes=(
                    f"Greenbook expiry date passed on {matched_record.expiry_date}"
                    if is_expired
                    else matched_record.status_reason
                    or ("Active registration in Greenbook" if is_active else "Registration not active")
                ),
            ),
        )

        # 5. Collect Critical Conflicts
        conflicts: list[str] = []
        if name_match is False:
            conflicts.append(f"Product name '{request.product_name}' contradicts registered '{matched_record.product_name}'.")
        if ing_match is False:
            conflicts.append(f"Active ingredients {request.active_ingredients} contradict registered {matched_record.active_ingredients}.")
        if str_match is False:
            conflicts.append(f"Strength '{request.strength}' contradicts registered '{matched_record.strength}'.")
        if form_match is False:
            conflicts.append(f"Dosage form '{request.dosage_form}' contradicts registered '{matched_record.dosage_form}'.")

        reasons: list[str] = []

        # RULE A: CRITICAL MISMATCH (Conflicts must never survive into a positive verdict)
        if conflicts:
            verdict = VerdictEnum.REGISTERED_MISMATCH
            confidence = 0
            tier = ConfidenceTier.CONFLICT
            reasons.append("CRITICAL CONFLICT: Submitted package details contradict the official NAFDAC record for this registration:")
            reasons.extend(conflicts)
            reasons.append("This is a major indicator of potential packaging mislabeling or a cloned registration number.")

        # RULE B: INACTIVE / EXPIRED
        elif not is_active:
            verdict = VerdictEnum.INACTIVE
            confidence = 0
            tier = ConfidenceTier.CONFLICT
            if is_expired:
                reasons.append(
                    f"Greenbook registration expiry date ({matched_record.expiry_date}) has passed."
                )
            else:
                reasons.append(f"Registration status in official Greenbook is {matched_record.status.value}: {matched_record.status_reason or 'No longer active.'}")
            if matched_record.expiry_date:
                reasons.append(f"Regulatory registration expired on {matched_record.expiry_date}.")

        # RULE C: REGISTERED MATCH (deterministic score of matching evidence, not safety probability)
        else:
            verdict = VerdictEnum.REGISTERED_MATCH
            if matched_via_nrn:
                reasons.append(f"NAFDAC number '{matched_record.nrn}' matches an ACTIVE record in the official Greenbook.")
                full_identity_match = (
                    name_match is True
                    and ing_match is True
                    and str_match is True
                    and bool(request.product_name and request.active_ingredients and request.strength)
                )
                has_corroborated_name = name_match is True
                has_corroborated_formulation = ing_match is True or str_match is True

                if full_identity_match:
                    confidence = 100
                    tier = ConfidenceTier.HIGH
                    reasons.append(f"NRN, product name, active ingredients, and strength align with registered '{matched_record.product_name}'.")
                elif has_corroborated_name and has_corroborated_formulation:
                    confidence = 85
                    tier = ConfidenceTier.MEDIUM
                    reasons.append(f"Product name and some submitted formulation evidence align with registered '{matched_record.product_name}', but evidence is incomplete.")
                elif has_corroborated_name:
                    confidence = 70
                    tier = ConfidenceTier.MEDIUM
                    reasons.append(f"Product name matches registered '{matched_record.product_name}', but formulation evidence is incomplete.")
                else:
                    confidence = 50
                    tier = ConfidenceTier.MEDIUM
                    reasons.append("NRN is active, but product name and formulation were not sufficiently corroborated.")
            else:
                # Name-only lookup (NO NRN provided)
                if name_match is True and ing_match is True and str_match is True:
                    confidence = 60
                    tier = ConfidenceTier.MEDIUM
                    reasons.append(f"Product name, ingredients, and strength match registered '{matched_record.product_name}' (NRN: {matched_record.nrn}).")
                    reasons.append("No NAFDAC number was provided; verified against formulation profile only.")
                else:
                    confidence = 25
                    tier = ConfidenceTier.LOW
                    reasons.append(f"Product name appears in Greenbook as '{matched_record.product_name}' (NRN: {matched_record.nrn}).")
                    reasons.append("Evidence incomplete: Without an NRN, ingredients, or strength, specific registration cannot be confirmed.")

        explanation = gemma_explainer.explain(
            verdict=verdict,
            confidence_percentage=confidence,
            reasons=reasons,
            matched_record=matched_record,
            submitted_name=request.product_name,
            submitted_nrn=request.nrn,
            language=request.language,
        )

        return CheckResponse(
            verdict=verdict,
            confidence_percentage=confidence,
            confidence_tier=tier,
            reasons=reasons,
            comparison=comparison,
            matched_record=matched_record,
            explanation=explanation,
            dataset_metadata=metadata,
        )


verifier = MedicineVerifier()
