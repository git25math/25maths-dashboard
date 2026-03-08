#!/usr/bin/env python3
"""Generate dashboard Payhip seed data from the website repo."""

from __future__ import annotations

import csv
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WEBSITE_ROOT = ROOT.parent / "25maths-website"
MASTER_CSV = WEBSITE_ROOT / "payhip/presale/kahoot-payhip-listings-master.csv"
LINKS_JSON = WEBSITE_ROOT / "_data/kahoot_subtopic_links.json"
OUT_FILE = ROOT / "src/constants-payhip.ts"


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def to_int(value: str) -> int | None:
    text = str(value or "").strip()
    return int(text) if text else None


def split_tags(value: str) -> list[str]:
    return [tag.strip() for tag in str(value or "").split(",") if tag.strip()]


def join_notes(*parts: str) -> str:
    cleaned: list[str] = []
    seen: set[str] = set()
    for part in parts:
        text = str(part or "").strip()
        if not text or text in seen:
            continue
        seen.add(text)
        cleaned.append(text)
    return "\n".join(cleaned)


def is_final_payhip_url(url: str) -> bool:
    return "payhip.com/b/" in str(url or "").lower()


def is_sellable_status(status: str) -> bool:
    return status in {"presale", "live", "free_sample_live"}


def derive_pipeline(item: dict[str, object]) -> dict[str, bool]:
    payhip_url = str(item.get("payhip_url") or "")
    status = str(item.get("status") or "planned")
    final_product = is_final_payhip_url(payhip_url)

    return {
        "matrix_ready": True,
        "copy_ready": bool(
            item.get("listing_title")
            and item.get("deliver_now")
            and item.get("deliver_on_release")
            and item.get("release_date")
        ),
        "payhip_created": final_product,
        "url_backfilled": final_product,
        "qa_verified": final_product and is_sellable_status(status),
        "site_synced": is_sellable_status(status),
    }


def choose_status(row: dict[str, str], link: dict[str, str]) -> str:
    link_status = str(link.get("status") or "").strip()
    if link_status:
        return link_status

    fallback = str(row.get("status") or "planned").strip() or "planned"
    payhip_url = str(row.get("payhip_url") or "").strip()
    return fallback if is_final_payhip_url(payhip_url) else "planned"


def build_items() -> list[dict[str, object]]:
    rows = read_csv_rows(MASTER_CSV)
    links = read_json(LINKS_JSON)
    timestamp = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    items: list[dict[str, object]] = []

    for row in rows:
        level = str(row.get("level") or "").strip()
        subtopic_id = str(row.get("subtopic_id") or "").strip()
        link = links.get(subtopic_id, {}) if level == "L1" and subtopic_id else {}
        if not isinstance(link, dict):
            link = {}

        payhip_url = (
            str(link.get("worksheet_payhip_url") or "").strip()
            or str(row.get("payhip_url") or "").strip()
        )
        worksheet_url = (
            str(link.get("worksheet_payhip_url") or "").strip()
            or str(row.get("worksheet_url") or "").strip()
        )
        section_bundle_url = (
            str(link.get("section_bundle_payhip_url") or "").strip()
            or str(row.get("section_bundle_url") or "").strip()
        )
        unit_bundle_url = (
            str(link.get("unit_bundle_payhip_url") or "").strip()
            or str(row.get("unit_bundle_url") or "").strip()
        )
        status = choose_status(row, link)

        item: dict[str, object] = {
            "id": str(row["sku"]).strip(),
            "sku": str(row["sku"]).strip(),
            "level": level,
            "board": str(row.get("board") or "").strip(),
            "board_label": str(row.get("board_label") or "").strip(),
            "tier_scope": str(row.get("tier_scope") or "").strip(),
            "status": status,
            "listing_title": str(row.get("listing_title") or "").strip(),
            "slug_candidate": str(row.get("slug_candidate") or "").strip(),
            "price_early_bird": str(row.get("price_early_bird") or "").strip(),
            "price_regular": str(row.get("price_regular") or "").strip(),
            "early_bird_end_date": str(link.get("presale_early_bird_end_date") or row.get("early_bird_end_date") or "").strip(),
            "release_date": str(link.get("presale_release_date") or row.get("release_date") or "").strip(),
            "payhip_url": payhip_url,
            "source_param": str(row.get("source_param") or "").strip(),
            "unit_key": str(row.get("unit_key") or "").strip(),
            "unit_code": str(row.get("unit_code") or "").strip(),
            "unit_title": str(row.get("unit_title") or "").strip(),
            "section_key": str(row.get("section_key") or "").strip(),
            "section_code": str(row.get("section_code") or "").strip(),
            "section_title": str(row.get("section_title") or "").strip(),
            "subtopic_id": subtopic_id,
            "subtopic_code": str(row.get("subtopic_code") or "").strip(),
            "subtopic_title": str(row.get("subtopic_title") or "").strip(),
            "subtopic_count": to_int(str(row.get("subtopic_count") or "")),
            "section_count": to_int(str(row.get("section_count") or "")),
            "unit_count": to_int(str(row.get("unit_count") or "")),
            "kahoot_url": str(link.get("kahoot_url") or row.get("kahoot_url") or "").strip(),
            "worksheet_url": worksheet_url,
            "section_bundle_url": section_bundle_url,
            "unit_bundle_url": unit_bundle_url,
            "deliver_now": str(row.get("deliver_now") or "").strip(),
            "deliver_on_release": str(row.get("deliver_on_release") or "").strip(),
            "bonus": str(row.get("bonus") or "").strip(),
            "presale_notes": str(link.get("presale_notes") or row.get("presale_notes") or "").strip(),
            "terms_pdf_url": str(row.get("terms_pdf_url") or "").strip(),
            "tags": split_tags(str(row.get("tags") or "")),
            "notes": join_notes(str(row.get("notes") or ""), str(link.get("notes") or "")),
            "sync_source": "website:_data/kahoot_subtopic_links.json" if link else "website:payhip/presale/kahoot-payhip-listings-master.csv",
            "created_at": timestamp,
            "updated_at": timestamp,
        }
        item["pipeline"] = derive_pipeline(item)
        items.append(item)

    return items


def main() -> int:
    items = build_items()
    content = (
        "import type { PayhipItem } from './types';\n\n"
        "export const MOCK_PAYHIP_ITEMS: PayhipItem[] = "
        + json.dumps(items, ensure_ascii=False, indent=2)
        + ";\n"
    )
    OUT_FILE.write_text(content, encoding="utf-8")
    print(f"Wrote {len(items)} Payhip items -> {OUT_FILE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
