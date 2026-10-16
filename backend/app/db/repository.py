import re
import sqlite3

from app.db.connection import get_db_connection, init_database
from app.models.registry import RecordStatus, RegistryRecord
from app.models.schemas import DatasetMetadata


def normalize_nrn(value: str | None) -> str:
    """Normalize NAFDAC Registration Number matching Greenbook indexing."""
    if not value:
        return ""
    cleaned = value.upper()
    cleaned = re.sub(r"\b(NAFDAC|REG|REGISTRATION|NO|NUMBER)\b", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"[^A-Z0-9]", "", cleaned)
    return cleaned.strip()


def _clean_product_name(raw_name: str | None) -> str:
    if not raw_name:
        return ""
    return raw_name.rstrip("#").strip()


def _parse_ingredients(ingredient_str: str | None) -> list[str]:
    if not ingredient_str:
        return []
    # Ingredients in Greenbook are separated by semicolons (e.g., "Artemether; Lumefantrine")
    parts = re.split(r"[;,]", ingredient_str)
    return [p.strip() for p in parts if p.strip()]


class RegistryRepository:
    def __init__(self) -> None:
        init_database()

    def _row_to_model(self, row: sqlite3.Row) -> RegistryRecord:
        ingredients = _parse_ingredients(row["ingredient_name"])
        raw_status = (row["status"] or "Unknown").strip()
        is_active = raw_status.lower() == "active"

        return RegistryRecord(
            id=row["product_id"],
            nrn=row["nrn"] or "",
            normalized_nrn=row["normalized_nrn"],
            product_name=_clean_product_name(row["product_name"]),
            generic_name=row["ingredient_name"] or row["ingredient_synonym"] or "",
            active_ingredients=ingredients,
            strength=row["strength"] or "",
            dosage_form=row["dosage_form"] or "",
            manufacturer=None,
            applicant_name=row["applicant_name"],
            country_of_origin="Nigeria",
            status=RecordStatus.ACTIVE if is_active else RecordStatus.INACTIVE,
            status_reason=None if is_active else f"Registration status in Greenbook is {raw_status}",
            approval_date=row["approval_date"],
            expiry_date=row["expiry_date"],
            dataset_source="NAFDAC Greenbook",
            dataset_date=row["retrieved_at"] or "2026-10-16T13:48:56+00:00",
        )

    def get_by_nrn(self, nrn: str) -> RegistryRecord | None:
        normalized = normalize_nrn(nrn)
        if not normalized:
            return None

        with get_db_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM greenbook_drugs WHERE normalized_nrn = ? LIMIT 1;",
                (normalized,),
            )
            row = cursor.fetchone()
            if row:
                return self._row_to_model(row)
        return None

    def search_by_name(self, query: str, limit: int = 10) -> list[RegistryRecord]:
        trimmed = query.strip()
        if not trimmed:
            return []

        search_pattern = f"%{trimmed}%"
        with get_db_connection() as conn:
            cursor = conn.execute(
                """
                SELECT * FROM greenbook_drugs
                WHERE product_name LIKE ? OR ingredient_name LIKE ?
                ORDER BY
                    CASE
                        WHEN product_name LIKE ? THEN 1
                        WHEN ingredient_name LIKE ? THEN 2
                        ELSE 3
                    END
                LIMIT ?;
                """,
                (search_pattern, search_pattern, f"{trimmed}%", f"{trimmed}%", limit),
            )
            rows = cursor.fetchall()
            return [self._row_to_model(r) for r in rows]

    def get_all(self, limit: int = 50) -> list[RegistryRecord]:
        with get_db_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM greenbook_drugs ORDER BY product_name ASC LIMIT ?;",
                (limit,),
            )
            rows = cursor.fetchall()
            return [self._row_to_model(r) for r in rows]

    def get_metadata(self) -> DatasetMetadata:
        with get_db_connection() as conn:
            cursor = conn.execute("SELECT * FROM greenbook_snapshot_metadata WHERE id = 1;")
            row = cursor.fetchone()
            if row:
                return DatasetMetadata(
                    source=f"{row['source']} ({row['records_loaded']:,} drug records)",
                    snapshot_date=row["retrieved_at"],
                    records_loaded=row["records_loaded"],
                    disclaimer=(
                        "This tool provides a registry cross-check against the official NAFDAC Greenbook snapshot, "
                        "not clinical proof of physical medicine authenticity, chemical composition, or safety."
                    ),
                )
        return DatasetMetadata()


registry_repository = RegistryRepository()
