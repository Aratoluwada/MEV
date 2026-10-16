"""Load a complete Greenbook snapshot into a separate SQLite source table."""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
DEFAULT_SNAPSHOT = BACKEND_DIR / "data" / "nafdac_greenbook_drugs.json"
DEFAULT_DATABASE = BACKEND_DIR / "data" / "registry.db"


def normalize_nrn(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"[^A-Z0-9]", "", value.upper())


def load_snapshot(snapshot_path: Path, database_path: Path) -> int:
    snapshot = json.loads(snapshot_path.read_text(encoding="utf-8"))
    metadata = snapshot["metadata"]
    records = snapshot["records"]

    if not metadata.get("complete") or len(records) != metadata.get("records_expected"):
        raise ValueError("Refusing to load an incomplete Greenbook snapshot")
    if any(row.get("category_name") != "Drugs" for row in records):
        raise ValueError("Snapshot contains a record outside the Greenbook Drugs category")

    database_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(database_path) as connection:
        connection.execute("PRAGMA journal_mode = WAL")
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS greenbook_drugs (
                product_id INTEGER PRIMARY KEY,
                nrn TEXT,
                normalized_nrn TEXT NOT NULL,
                product_name TEXT NOT NULL,
                ingredient_name TEXT,
                ingredient_synonym TEXT,
                composition TEXT,
                strength TEXT,
                dosage_form TEXT,
                route TEXT,
                applicant_name TEXT,
                manufacturer_id INTEGER,
                pack_size TEXT,
                status TEXT NOT NULL,
                approval_date TEXT,
                expiry_date TEXT,
                category_name TEXT NOT NULL,
                source_url TEXT NOT NULL,
                retrieved_at TEXT NOT NULL,
                raw_record_json TEXT NOT NULL
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_greenbook_drugs_nrn ON greenbook_drugs(normalized_nrn)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_greenbook_drugs_name ON greenbook_drugs(product_name COLLATE NOCASE)"
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS greenbook_snapshot_metadata (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                source TEXT NOT NULL,
                source_url TEXT NOT NULL,
                retrieved_at TEXT NOT NULL,
                records_expected INTEGER NOT NULL,
                records_loaded INTEGER NOT NULL,
                complete INTEGER NOT NULL
            )
            """
        )

        connection.execute("BEGIN")
        connection.execute("DELETE FROM greenbook_drugs")
        connection.executemany(
            """
            INSERT INTO greenbook_drugs (
                product_id, nrn, normalized_nrn, product_name, ingredient_name,
                ingredient_synonym, composition, strength, dosage_form, route,
                applicant_name, manufacturer_id, pack_size, status, approval_date,
                expiry_date, category_name, source_url, retrieved_at, raw_record_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    row["product_id"],
                    row.get("NAFDAC"),
                    normalize_nrn(row.get("NAFDAC")),
                    row.get("product_name") or "",
                    row.get("ingredient_name"),
                    row.get("synonym"),
                    row.get("composition"),
                    row.get("strength"),
                    row.get("form_name"),
                    row.get("route_name"),
                    row.get("applicant_name"),
                    row.get("manufacturer_id"),
                    row.get("pack_size"),
                    row.get("status") or "Unknown",
                    row.get("approval_date"),
                    row.get("expiry_date"),
                    row.get("category_name") or "Drugs",
                    metadata["source_url"],
                    metadata["retrieved_at"],
                    json.dumps(row, ensure_ascii=False, separators=(",", ":")),
                )
                for row in records
            ],
        )
        connection.execute(
            """
            INSERT OR REPLACE INTO greenbook_snapshot_metadata (
                id, source, source_url, retrieved_at, records_expected,
                records_loaded, complete
            ) VALUES (1, ?, ?, ?, ?, ?, ?)
            """,
            (
                metadata["source"],
                metadata["source_url"],
                metadata["retrieved_at"],
                metadata["records_expected"],
                len(records),
                int(metadata["complete"]),
            ),
        )

    return len(records)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--snapshot", type=Path, default=DEFAULT_SNAPSHOT)
    parser.add_argument("--database", type=Path, default=DEFAULT_DATABASE)
    args = parser.parse_args()

    count = load_snapshot(args.snapshot, args.database)
    print(f"Loaded {count:,} Greenbook drug records into {args.database}")


if __name__ == "__main__":
    main()