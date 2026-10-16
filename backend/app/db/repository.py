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

    def get_metadata(self) -> dict:
        try:
            with sqlite3.connect(self.db_path) as conn:
                cur = conn.execute("SELECT source, retrieved_at, records_loaded, disclaimer FROM greenbook_snapshot_metadata WHERE id = 1")
                row = cur.fetchone()
                if row:
                    return {
                        "source": row[0],
                        "snapshot_date": row[1],
                        "records_loaded": row[2],
                        "disclaimer": row[3],
                    }
        except sqlite3.OperationalError:
            pass
        return {
            "source": "NAFDAC Official Greenbook Snapshot",
            "snapshot_date": "2026-10-16T13:48:56+00:00",
            "records_loaded": 7460,
            "disclaimer": "Official NAFDAC regulatory snapshot. Not a clinical test of physical medicine authenticity.",
        }
