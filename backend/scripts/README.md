# Registry Data Scripts

The Greenbook Drugs snapshot is pulled from NAFDAC's public table at <https://greenbook.nafdac.gov.ng/>. The pull uses the same paginated JSON response as the public table, requests 100 rows at a time, checks that every row belongs to the Drugs category, and records the retrieval time and expected/received counts.

From the workspace root, use the existing backend virtual environment:

```bash
backend/.venv/bin/python backend/scripts/import_greenbook.py
backend/.venv/bin/python backend/scripts/load_greenbook_snapshot.py
```

The first command writes `backend/data/nafdac_greenbook_drugs.json`; the second loads it into the separate `greenbook_drugs` table in `backend/data/registry.db`. The loader refuses incomplete or mixed-category snapshots and does not overwrite the app's `registry` table. Applicant name and manufacturer ID are kept as separate source fields; do not treat the applicant as the manufacturer. Raw source rows are retained in the JSON snapshot column so field mappings can be revisited.

The `backend/data/` directory is git-ignored. The JSON records the source URL, capture timestamp, and completeness count; Greenbook is a changing registry, so the snapshot should not be represented as live data or as proof of product safety.
