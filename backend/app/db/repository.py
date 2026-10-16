import re

def normalize_nrn(nrn: str | None) -> str:
    """Clean and normalize NAFDAC Registration Number for canonical lookup."""
    if not nrn:
        return ""
    cleaned = re.sub(r"(?i)nafdac\s*(?:reg(?:istration)?\.?\s*(?:no\.?|number)?)?:?", "", nrn)
    return re.sub(r"[^A-Za-z0-9]", "", cleaned).upper()

import sqlite3
from app.core.config import settings

class RegistryRepository:
    def __init__(self, db_path=None) -> None:
        self.db_path = db_path or settings.sqlite_db_path

    def _create_tables(self, conn: sqlite3.Connection) -> None:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS registry (
                nrn TEXT PRIMARY KEY,
                product_name TEXT NOT NULL,
                generic_name TEXT,
                active_ingredients TEXT,
                strength TEXT,
                dosage_form TEXT,
                manufacturer TEXT,
                country_of_origin TEXT,
                status TEXT NOT NULL,
                expiry_date TEXT,
                dataset_source TEXT,
                dataset_date TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS greenbook_snapshot_metadata (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                source TEXT NOT NULL,
                retrieved_at TEXT NOT NULL,
                records_loaded INTEGER NOT NULL,
                disclaimer TEXT NOT NULL
            )
        """)
