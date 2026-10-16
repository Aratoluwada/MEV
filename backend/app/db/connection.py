import logging
import sqlite3
from collections.abc import Generator
from contextlib import contextmanager
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)


def get_db_path() -> Path:
    db_path = settings.sqlite_db_path
    db_path.parent.mkdir(parents=True, exist_ok=True)
    return db_path


@contextmanager
def get_db_connection() -> Generator[sqlite3.Connection, None, None]:
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_database() -> None:
    db_path = get_db_path()
    with get_db_connection() as conn:
        cursor = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='greenbook_drugs';"
        )
        if cursor.fetchone():
            count = conn.execute("SELECT COUNT(*) FROM greenbook_drugs;").fetchone()[0]
            if count > 0:
                return

    # If greenbook_drugs does not exist or is empty, load from snapshot JSON
    snapshot_json = db_path.parent / "nafdac_greenbook_drugs.json"
    if snapshot_json.exists():
        try:
            from scripts.load_greenbook_snapshot import load_snapshot

            loaded = load_snapshot(snapshot_json, db_path)
            logger.info(f"Loaded {loaded:,} Greenbook records from snapshot.")
        except Exception as e:
            logger.error(f"Failed to load Greenbook snapshot: {e}")
