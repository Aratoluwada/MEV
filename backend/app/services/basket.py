import re
from collections import defaultdict

from app.db.repository import registry_repository
from app.models.schemas import (
    BasketCheckRequest,
    BasketCheckResponse,
    DuplicateIngredientAlert,
)


def _normalize_ingredient(ing: str) -> str:
    cleaned = ing.lower()
    cleaned = re.sub(r"\b(bp|usp|bpc|hydrochloride|hcl|sodium|potassium|maleate|sulfate)\b", "", cleaned)
    cleaned = re.sub(r"[^a-z0-9\s]", "", cleaned)
    return " ".join(cleaned.split())


class BasketChecker:
    def check_basket(self, request: BasketCheckRequest) -> BasketCheckResponse:
        total = 0
        ingredient_to_products: dict[str, set[str]] = defaultdict(set)

        # 1. Process by NRN
        for nrn in request.nrns:
            if not nrn.strip():
                continue
            total += 1
            record = registry_repository.get_by_nrn(nrn)
            if record:
                prod_label = f"{record.product_name} (NRN: {record.nrn})"
                for ing in record.active_ingredients:
                    norm = _normalize_ingredient(ing)
                    if norm:
                        ingredient_to_products[norm].add(prod_label)

        # 2. Process by Product Name
        for name in request.product_names:
            if not name.strip():
                continue
            total += 1
            candidates = registry_repository.search_by_name(name, limit=1)
            if candidates:
                record = candidates[0]
                prod_label = f"{record.product_name} (NRN: {record.nrn})"
                for ing in record.active_ingredients:
                    norm = _normalize_ingredient(ing)
                    if norm:
                        ingredient_to_products[norm].add(prod_label)
            else:
                # If unlisted, add the raw name if it contains recognizable ingredient
                pass

        alerts: list[DuplicateIngredientAlert] = []
        for norm_ing, prods in ingredient_to_products.items():
            if len(prods) > 1:
                display_ing = norm_ing.title()
                alerts.append(
                    DuplicateIngredientAlert(
                        ingredient=display_ing,
                        conflicting_products=sorted(prods),
                        warning=(
                            f"Multiple medicines in your basket contain '{display_ing}'. "
                            f"Taking them simultaneously can lead to accidental toxic overdose. "
                            f"Check with a pharmacist before taking both products together."
                        ),
                    )
                )

        return BasketCheckResponse(
            total_medicines_checked=total,
            has_duplicate_ingredients=len(alerts) > 0,
            alerts=alerts,
        )


basket_checker = BasketChecker()
