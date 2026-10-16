"""Download a dated local snapshot of NAFDAC Greenbook drug records."""

from __future__ import annotations

import argparse
import json
import tempfile
import time
from datetime import UTC, datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


BACKEND_DIR = Path(__file__).resolve().parents[1]
SOURCE_URL = "https://greenbook.nafdac.gov.ng/"
OUTPUT_PATH = BACKEND_DIR / "data" / "nafdac_greenbook_drugs.json"
PAGE_SIZE = 100
CATEGORY_ID = "1"
COLUMNS = (
    "product_name",
    "ingredient.ingredient_name",
    "product_category.name",
    "product_category_id",
    "ingredient.synonym",
    "NAFDAC",
    "form.name",
    "route.name",
    "strength",
    "applicant.name",
    "approval_date",
    "status",
)


def build_params(draw: int, start: int, length: int) -> list[tuple[str, str]]:
    params: list[tuple[str, str]] = [("draw", str(draw))]
    for index, column in enumerate(COLUMNS):
        params.extend(
            [
                (f"columns[{index}][data]", column),
                (f"columns[{index}][name]", column),
                (f"columns[{index}][searchable]", "true"),
                (f"columns[{index}][orderable]", "false" if index == 2 else "true"),
                (
                    f"columns[{index}][search][value]",
                    CATEGORY_ID if index == 3 else "",
                ),
                (f"columns[{index}][search][regex]", "false"),
            ]
        )
    params.extend(
        [
            ("order[0][column]", "0"),
            ("order[0][dir]", "asc"),
            ("start", str(start)),
            ("length", str(length)),
            ("search[value]", ""),
            ("search[regex]", "false"),
            ("search_ingredient", ""),
        ]
    )
    return params


def fetch_page(draw: int, start: int, length: int) -> dict:
    query = urlencode(build_params(draw, start, length))
    request = Request(
        f"{SOURCE_URL}?{query}",
        headers={
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "User-Agent": "MedicineRegistryChecker/0.1 (public registry snapshot)",
            "X-Requested-With": "XMLHttpRequest",
        },
    )

    for attempt in range(3):
        try:
            with urlopen(request, timeout=30) as response:
                payload = json.loads(response.read())
            if not isinstance(payload.get("data"), list):
                raise ValueError("Greenbook response did not contain a data list")
            return payload
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
            if attempt == 2:
                raise RuntimeError(f"Greenbook request failed at row {start}: {error}") from error
            time.sleep(1.5 * (attempt + 1))

    raise RuntimeError(f"Greenbook request failed at row {start}")


def download_records(limit: int | None = None) -> tuple[list[dict], int]:
    records: list[dict] = []
    expected_count: int | None = None
    start = 0
    draw = 1

    while expected_count is None or start < expected_count:
        length = min(PAGE_SIZE, limit - len(records)) if limit is not None else PAGE_SIZE
        if length <= 0:
            break

        payload = fetch_page(draw, start, length)
        filtered_count = int(payload["recordsFiltered"])
        expected_count = filtered_count if expected_count is None else expected_count
        if int(payload["recordsFiltered"]) != expected_count:
            raise RuntimeError("Greenbook result count changed during download; retry the snapshot")

        page_records = payload["data"]
        if not page_records:
            break
        if any(str(row.get("product_category_id")) != CATEGORY_ID for row in page_records):
            raise RuntimeError("Greenbook returned a non-drug record for the Drugs filter")

        records.extend(page_records)
        start += len(page_records)
        draw += 1
        print(f"Downloaded {len(records):,} of {expected_count:,} drug records", flush=True)
        if start < expected_count and (limit is None or len(records) < limit):
            time.sleep(0.15)

    return records, expected_count or 0


def write_snapshot(records: list[dict], expected_count: int, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    retrieved_at = datetime.now(UTC).isoformat(timespec="seconds")
    snapshot = {
        "metadata": {
            "source": "NAFDAC Greenbook",
            "source_url": SOURCE_URL,
            "source_interface": "Public Greenbook server-side product table, Drugs category",
            "category_id": CATEGORY_ID,
            "retrieved_at": retrieved_at,
            "records_expected": expected_count,
            "records_retrieved": len(records),
            "complete": len(records) == expected_count,
        },
        "records": records,
    }

    with tempfile.NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        dir=output_path.parent,
        delete=False,
        suffix=".tmp",
    ) as temporary_file:
        json.dump(snapshot, temporary_file, ensure_ascii=False, indent=2)
        temporary_file.write("\n")
        temporary_path = Path(temporary_file.name)

    temporary_path.replace(output_path)
    print(f"Saved {len(records):,} source records to {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--limit",
        type=int,
        help="Download only the first N records for a connectivity test.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=OUTPUT_PATH,
        help=f"Snapshot destination (default: {OUTPUT_PATH}).",
    )
    args = parser.parse_args()
    if args.limit is not None and args.limit < 1:
        parser.error("--limit must be positive")

    records, expected_count = download_records(args.limit)
    if args.limit is None and len(records) != expected_count:
        raise RuntimeError(
            f"Incomplete Greenbook download: received {len(records)} of {expected_count} records"
        )
    write_snapshot(records, expected_count, args.output)


if __name__ == "__main__":
    main()