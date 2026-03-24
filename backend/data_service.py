"""
Data service: loads mock_tenders_data.json and exposes query helpers.
All heavy lifting is done once at startup and cached in memory.
"""
import json
import os
import math
from typing import Optional, List, Dict, Any
import pandas as pd

_DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "mock_tenders_data.json")

# ── Module-level cache ────────────────────────────────────────────────────────
_df_tenders: Optional[pd.DataFrame] = None
_df_proposals: Optional[pd.DataFrame] = None


def _safe_get(obj, *keys, default=None):
    for k in keys:
        if isinstance(obj, dict):
            obj = obj.get(k, default)
        else:
            return default
    return obj if obj is not None else default


def _load():
    global _df_tenders, _df_proposals
    if _df_tenders is not None:
        return

    with open(_DATA_FILE, "r", encoding="utf-8") as f:
        raw = json.load(f)

    tenders_rows = []
    proposal_rows = []

    for t in raw:
        tid = t.get("id")
        name = t.get("tenderName", "")
        agency = _safe_get(t, "agency", "en", default=_safe_get(t, "agency", "name", default="Unknown"))
        sector = _safe_get(t, "agency", "sector_en", default=_safe_get(t, "agency", "sector", default="Unknown"))
        region = _safe_get(t, "region", "en", default=_safe_get(t, "region", "name", default="Unknown"))
        city = _safe_get(t, "city", "en", default=_safe_get(t, "city", "name", default="Unknown"))
        status_obj = _safe_get(t, "tender_status", default={})
        status = _safe_get(status_obj, "en", default=_safe_get(status_obj, "name", default="Unknown"))

        # Bucket status
        sl = status.lower() if status else ""
        if "award" in sl or "منح" in sl:
            bucket = "Awarded"
        elif "active" in sl or "open" in sl or "فعال" in sl or "مفتوح" in sl:
            bucket = "Active"
        else:
            bucket = "Other"

        deadline = t.get("lastOfferPresentationDate")
        contract_days = t.get("contractPeriodInDays")
        doc_fees = t.get("buyingCost") or t.get("conditionalBookletPrice")

        proposals = t.get("proposals", []) or []
        awarded = t.get("awarded_proposals", []) or []

        prices = [p.get("price") for p in proposals if p.get("price") is not None]
        bid_count = len(proposals)
        min_bid = min(prices) if prices else None
        max_bid = max(prices) if prices else None
        avg_bid = sum(prices) / len(prices) if prices else None

        awarded_value = None
        winner = None
        if awarded:
            awarded_value = awarded[0].get("awarding_value") or awarded[0].get("price")
            winner = awarded[0].get("vendor_name")

        tenders_rows.append({
            "id": tid,
            "tenderName": name,
            "agency": agency,
            "sector": sector,
            "region": region,
            "city": city,
            "status": status,
            "status_bucket": bucket,
            "deadline": deadline,
            "contract_days": contract_days,
            "doc_fees": doc_fees,
            "bid_count": bid_count,
            "min_bid": min_bid,
            "max_bid": max_bid,
            "avg_bid": avg_bid,
            "awarded_value": awarded_value,
            "winner": winner,
            "proposals_raw": proposals,
        })

        winner_ids = {a.get("tender_vendor_id") for a in awarded}
        for p in proposals:
            proposal_rows.append({
                "tender_id": tid,
                "tenderName": name,
                "agency": agency,
                "sector": sector,
                "region": region,
                "vendor_name": p.get("vendor_name", "Unknown"),
                "price": p.get("price"),
                "technical_match": bool(p.get("technical_match")),
                "is_winner": p.get("tender_vendor_id") in winner_ids,
            })

    _df_tenders = pd.DataFrame(tenders_rows)
    _df_proposals = pd.DataFrame(proposal_rows) if proposal_rows else pd.DataFrame(
        columns=["tender_id", "tenderName", "agency", "sector", "region",
                 "vendor_name", "price", "technical_match", "is_winner"]
    )


def get_tenders_df() -> pd.DataFrame:
    _load()
    return _df_tenders


def get_proposals_df() -> pd.DataFrame:
    _load()
    return _df_proposals


# ── KPI ───────────────────────────────────────────────────────────────────────
def get_kpi_stats() -> Dict[str, Any]:
    df = get_tenders_df()
    props = get_proposals_df()
    total = len(df)
    awarded = int((df["status_bucket"] == "Awarded").sum())
    unique_vendors = int(props["vendor_name"].nunique()) if not props.empty else 0
    total_awarded = float(df["awarded_value"].sum(skipna=True))
    avg_bidders = float(df["bid_count"].mean()) if total > 0 else 0.0
    return {
        "total_tenders": total,
        "awarded_tenders": awarded,
        "unique_vendors": unique_vendors,
        "total_awarded_value": round(total_awarded, 2),
        "avg_bidders": round(avg_bidders, 2),
    }


# ── Filter options ────────────────────────────────────────────────────────────
def get_filter_options() -> Dict[str, List[str]]:
    df = get_tenders_df()
    return {
        "agencies": sorted(df["agency"].dropna().unique().tolist()),
        "sectors": sorted(df["sector"].dropna().unique().tolist()),
        "regions": sorted(df["region"].dropna().unique().tolist()),
        "cities": sorted(df["city"].dropna().unique().tolist()),
        "statuses": sorted(df["status_bucket"].dropna().unique().tolist()),
    }


def _base_filter(
    df: pd.DataFrame,
    search: Optional[str] = None,
    agency: Optional[str] = None,
    sector: Optional[str] = None,
    region: Optional[str] = None,
    city: Optional[str] = None,
    status_bucket: Optional[str] = None,
) -> pd.DataFrame:
    """Apply all provided filters to df and return the result."""
    if search:
        mask = df["tenderName"].str.contains(search, case=False, na=False) | \
               df["id"].astype(str).str.contains(search, na=False)
        df = df[mask]
    if agency:
        df = df[df["agency"] == agency]
    if sector:
        df = df[df["sector"] == sector]
    if region:
        df = df[df["region"] == region]
    if city:
        df = df[df["city"] == city]
    if status_bucket:
        df = df[df["status_bucket"] == status_bucket]
    return df


def get_smart_filter_options(
    search: Optional[str] = None,
    agency: Optional[str] = None,
    sector: Optional[str] = None,
    region: Optional[str] = None,
    city: Optional[str] = None,
    status_bucket: Optional[str] = None,
) -> Dict[str, List[str]]:
    """
    Return valid options for each filter dimension given the current selections.
    For each dimension, we apply ALL other active filters (skip self) so the
    returned options are only those that would yield results.
    """
    full = get_tenders_df()

    # Agencies: apply every filter EXCEPT agency
    df_ag = _base_filter(full, search=search, sector=sector, region=region, city=city, status_bucket=status_bucket)
    # Sectors: apply every filter EXCEPT sector
    df_sec = _base_filter(full, search=search, agency=agency, region=region, city=city, status_bucket=status_bucket)
    # Regions: apply every filter EXCEPT region
    df_reg = _base_filter(full, search=search, agency=agency, sector=sector, city=city, status_bucket=status_bucket)
    # Cities: apply every filter EXCEPT city
    df_city = _base_filter(full, search=search, agency=agency, sector=sector, region=region, status_bucket=status_bucket)
    # Statuses: apply every filter EXCEPT status_bucket
    df_stat = _base_filter(full, search=search, agency=agency, sector=sector, region=region, city=city)

    return {
        "agencies": sorted(df_ag["agency"].dropna().unique().tolist()),
        "sectors": sorted(df_sec["sector"].dropna().unique().tolist()),
        "regions": sorted(df_reg["region"].dropna().unique().tolist()),
        "cities": sorted(df_city["city"].dropna().unique().tolist()),
        "statuses": sorted(df_stat["status_bucket"].dropna().unique().tolist()),
    }


# ── Tenders list ──────────────────────────────────────────────────────────────
def get_tenders(
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    agency: Optional[str] = None,
    sector: Optional[str] = None,
    region: Optional[str] = None,
    city: Optional[str] = None,
    status_bucket: Optional[str] = None,
) -> Dict[str, Any]:
    df = get_tenders_df().copy()

    if search:
        mask = df["tenderName"].str.contains(search, case=False, na=False) | \
               df["id"].astype(str).str.contains(search, na=False)
        df = df[mask]
    if agency:
        df = df[df["agency"] == agency]
    if sector:
        df = df[df["sector"] == sector]
    if region:
        df = df[df["region"] == region]
    if city:
        df = df[df["city"] == city]
    if status_bucket:
        df = df[df["status_bucket"] == status_bucket]

    total = len(df)
    total_pages = max(1, math.ceil(total / page_size))
    start = (page - 1) * page_size
    end = start + page_size
    page_df = df.iloc[start:end]

    items = []
    for _, row in page_df.iterrows():
        items.append({
            "id": row["id"],
            "tenderName": row["tenderName"],
            "agency": row["agency"],
            "sector": row["sector"],
            "region": row["region"],
            "city": row["city"],
            "status": row["status"],
            "status_bucket": row["status_bucket"],
            "deadline": row["deadline"],
            "contract_days": None if pd.isna(row["contract_days"]) else int(row["contract_days"]),
            "doc_fees": None if pd.isna(row["doc_fees"]) else float(row["doc_fees"]),
            "bid_count": int(row["bid_count"]),
            "min_bid": None if pd.isna(row["min_bid"]) else float(row["min_bid"]),
            "max_bid": None if pd.isna(row["max_bid"]) else float(row["max_bid"]),
            "avg_bid": None if pd.isna(row["avg_bid"]) else float(row["avg_bid"]),
            "awarded_value": None if pd.isna(row["awarded_value"]) else float(row["awarded_value"]),
            "winner": row["winner"],
        })

    return {"items": items, "total": total, "page": page, "page_size": page_size, "total_pages": total_pages}


# ── Tender detail ─────────────────────────────────────────────────────────────
def get_tender_detail(tender_id: int) -> Optional[Dict[str, Any]]:
    df = get_tenders_df()
    rows = df[df["id"] == tender_id]
    if rows.empty:
        return None
    row = rows.iloc[0]

    proposals = []
    for p in (row["proposals_raw"] or []):
        proposals.append({
            "vendor_name": p.get("vendor_name", "Unknown"),
            "price": p.get("price"),
            "technical_match": bool(p.get("technical_match")),
            "is_winner": False,  # will be set below
        })

    # Mark winners
    props_df = get_proposals_df()
    winners = set(props_df[(props_df["tender_id"] == tender_id) & (props_df["is_winner"])]["vendor_name"].tolist())
    for p in proposals:
        p["is_winner"] = p["vendor_name"] in winners

    proposals.sort(key=lambda x: (x["price"] or float("inf")))

    return {
        "id": int(row["id"]),
        "tenderName": row["tenderName"],
        "agency": row["agency"],
        "sector": row["sector"],
        "region": row["region"],
        "city": row["city"],
        "status": row["status"],
        "status_bucket": row["status_bucket"],
        "deadline": row["deadline"],
        "contract_days": None if pd.isna(row["contract_days"]) else int(row["contract_days"]),
        "doc_fees": None if pd.isna(row["doc_fees"]) else float(row["doc_fees"]),
        "bid_count": int(row["bid_count"]),
        "min_bid": None if pd.isna(row["min_bid"]) else float(row["min_bid"]),
        "max_bid": None if pd.isna(row["max_bid"]) else float(row["max_bid"]),
        "avg_bid": None if pd.isna(row["avg_bid"]) else float(row["avg_bid"]),
        "awarded_value": None if pd.isna(row["awarded_value"]) else float(row["awarded_value"]),
        "winner": row["winner"],
        "proposals": proposals,
    }


# ── Vendors ───────────────────────────────────────────────────────────────────
def get_vendors(
    sector: Optional[str] = None,
    agency: Optional[str] = None,
    min_wins: int = 1,
) -> List[Dict[str, Any]]:
    props = get_proposals_df().copy()
    if sector:
        props = props[props["sector"] == sector]
    if agency:
        props = props[props["agency"] == agency]

    grouped = props.groupby("vendor_name")
    results = []
    for vendor, grp in grouped:
        wins = int(grp["is_winner"].sum())
        if wins < min_wins:
            continue
        participations = len(grp)
        win_rate = wins / participations if participations > 0 else 0
        prices = grp["price"].dropna()
        avg_bid = float(prices.mean()) if not prices.empty else None
        tenders_df = get_tenders_df()
        won_tenders = tenders_df[tenders_df["winner"] == vendor]
        total_awarded = float(won_tenders["awarded_value"].sum(skipna=True))
        sectors = grp["sector"].dropna().unique().tolist()
        regions = grp["region"].dropna().unique().tolist()
        deadlines = get_tenders_df()[get_tenders_df()["id"].isin(grp["tender_id"])]["deadline"].dropna()
        last_activity = deadlines.max() if not deadlines.empty else None

        results.append({
            "vendor_name": vendor,
            "participations": participations,
            "wins": wins,
            "win_rate": round(win_rate * 100, 1),
            "avg_bid": round(avg_bid, 2) if avg_bid else None,
            "total_awarded": round(total_awarded, 2),
            "sectors": sectors,
            "regions": regions,
            "last_activity": str(last_activity) if last_activity else None,
        })

    results.sort(key=lambda x: x["participations"], reverse=True)
    return results


def get_vendor_profile(vendor_name: str) -> Optional[Dict[str, Any]]:
    vendors = get_vendors(min_wins=0)
    for v in vendors:
        if v["vendor_name"] == vendor_name:
            # Add bid history
            props = get_proposals_df()
            vp = props[props["vendor_name"] == vendor_name]
            bid_history = []
            for _, row in vp.iterrows():
                bid_history.append({
                    "tender_id": int(row["tender_id"]),
                    "tenderName": row["tenderName"],
                    "price": float(row["price"]) if pd.notna(row["price"]) else None,
                    "is_winner": bool(row["is_winner"]),
                    "sector": row["sector"],
                    "agency": row["agency"],
                })
            v["bid_history"] = bid_history
            return v
    return None


# ── Market smart filter options ───────────────────────────────────────────────
def get_market_smart_filter_options(
    sector: Optional[str] = None,
    agency: Optional[str] = None,
) -> Dict[str, List[str]]:
    """
    Return valid sector/agency options for Market Views & Company Intelligence.
    Each dimension's options are computed by applying only the OTHER active filter,
    so impossible combinations are never shown.
    """
    df = get_tenders_df()

    # Sectors: apply agency filter only
    df_sec = df[df["agency"] == agency] if agency else df
    available_sectors = sorted(df_sec["sector"].dropna().unique().tolist())

    # Agencies: apply sector filter only
    df_ag = df[df["sector"] == sector] if sector else df
    available_agencies = sorted(df_ag["agency"].dropna().unique().tolist())

    return {
        "sectors": available_sectors,
        "agencies": available_agencies,
    }


# ── Market views ──────────────────────────────────────────────────────────────
def get_top_companies(
    sector: Optional[str] = None,
    agency: Optional[str] = None,
    top_n: int = 25,
) -> List[Dict[str, Any]]:
    vendors = get_vendors(sector=sector, agency=agency, min_wins=1)
    vendors.sort(key=lambda x: x["wins"], reverse=True)
    return vendors[:top_n]


def get_competitive_density(
    sector: Optional[str] = None,
    agency: Optional[str] = None,
) -> List[Dict[str, Any]]:
    df = get_tenders_df().copy()
    if sector:
        df = df[df["sector"] == sector]
    if agency:
        df = df[df["agency"] == agency]

    results = []
    for _, row in df.iterrows():
        bc = int(row["bid_count"])
        if bc >= 5:
            density = "High"
        elif bc >= 3:
            density = "Medium"
        elif bc == 2:
            density = "Low"
        else:
            density = "Single"
        results.append({
            "id": int(row["id"]),
            "tenderName": row["tenderName"],
            "agency": row["agency"],
            "sector": row["sector"],
            "bid_count": bc,
            "density": density,
            "awarded_value": None if pd.isna(row["awarded_value"]) else float(row["awarded_value"]),
        })
    results.sort(key=lambda x: x["bid_count"], reverse=True)
    return results


def get_pricing_analysis(
    sector: Optional[str] = None,
    agency: Optional[str] = None,
) -> List[Dict[str, Any]]:
    df = get_tenders_df().copy()
    if sector:
        df = df[df["sector"] == sector]
    if agency:
        df = df[df["agency"] == agency]

    results = []
    for _, row in df.iterrows():
        if row["bid_count"] == 0:
            continue
        spread = None
        if row["min_bid"] is not None and row["max_bid"] is not None:
            spread = float(row["max_bid"]) - float(row["min_bid"])
        results.append({
            "id": int(row["id"]),
            "tenderName": row["tenderName"],
            "agency": row["agency"],
            "sector": row["sector"],
            "min_bid": None if pd.isna(row["min_bid"]) else float(row["min_bid"]),
            "max_bid": None if pd.isna(row["max_bid"]) else float(row["max_bid"]),
            "avg_bid": None if pd.isna(row["avg_bid"]) else float(row["avg_bid"]),
            "awarded_value": None if pd.isna(row["awarded_value"]) else float(row["awarded_value"]),
            "bid_spread": round(spread, 2) if spread is not None else None,
        })
    return results


# ── Market insights ───────────────────────────────────────────────────────────
def get_sector_specialists(min_wins: int = 2) -> List[Dict[str, Any]]:
    props = get_proposals_df()
    winners = props[props["is_winner"]].copy()
    if winners.empty:
        return []

    grouped = winners.groupby("vendor_name")
    results = []
    for vendor, grp in grouped:
        total_wins = len(grp)
        if total_wins < min_wins:
            continue
        sector_counts = grp["sector"].value_counts()
        top_sector = sector_counts.index[0]
        top_count = int(sector_counts.iloc[0])
        concentration = round(top_count / total_wins * 100, 1)
        if concentration >= 80:
            results.append({
                "vendor_name": vendor,
                "top_sector": top_sector,
                "wins_in_sector": top_count,
                "total_wins": total_wins,
                "concentration_pct": concentration,
            })
    results.sort(key=lambda x: x["concentration_pct"], reverse=True)
    return results


def get_region_specialists(min_wins: int = 2) -> List[Dict[str, Any]]:
    props = get_proposals_df()
    winners = props[props["is_winner"]].copy()
    if winners.empty:
        return []

    grouped = winners.groupby("vendor_name")
    results = []
    for vendor, grp in grouped:
        total_wins = len(grp)
        if total_wins < min_wins:
            continue
        region_counts = grp["region"].value_counts()
        top_region = region_counts.index[0]
        top_count = int(region_counts.iloc[0])
        concentration = round(top_count / total_wins * 100, 1)
        if concentration >= 90:
            results.append({
                "vendor_name": vendor,
                "top_region": top_region,
                "wins_in_region": top_count,
                "total_wins": total_wins,
                "concentration_pct": concentration,
            })
    results.sort(key=lambda x: x["concentration_pct"], reverse=True)
    return results


def get_sector_breakdown() -> List[Dict[str, Any]]:
    df = get_tenders_df()
    sector_counts = df.groupby("sector").agg(
        total=("id", "count"),
        awarded=("awarded_value", lambda x: x.notna().sum()),
        total_value=("awarded_value", "sum"),
    ).reset_index()
    results = []
    for _, row in sector_counts.iterrows():
        results.append({
            "sector": row["sector"],
            "total_tenders": int(row["total"]),
            "awarded_count": int(row["awarded"]),
            "total_value": round(float(row["total_value"]), 2) if not pd.isna(row["total_value"]) else 0,
        })
    results.sort(key=lambda x: x["total_tenders"], reverse=True)
    return results


def get_region_breakdown() -> List[Dict[str, Any]]:
    df = get_tenders_df()
    region_counts = df.groupby("region").agg(
        total=("id", "count"),
        total_value=("awarded_value", "sum"),
    ).reset_index()
    results = []
    for _, row in region_counts.iterrows():
        results.append({
            "region": row["region"],
            "total_tenders": int(row["total"]),
            "total_value": round(float(row["total_value"]), 2) if not pd.isna(row["total_value"]) else 0,
        })
    results.sort(key=lambda x: x["total_tenders"], reverse=True)
    return results


def get_top_agencies(top_n: int = 10) -> List[Dict[str, Any]]:
    df = get_tenders_df()
    agency_stats = df.groupby("agency").agg(
        total_tenders=("id", "count"),
        total_value=("awarded_value", "sum"),
    ).reset_index()
    agency_stats = agency_stats.sort_values("total_value", ascending=False).head(top_n)
    results = []
    for _, row in agency_stats.iterrows():
        results.append({
            "agency": row["agency"],
            "total_tenders": int(row["total_tenders"]),
            "total_value": round(float(row["total_value"]), 2) if not pd.isna(row["total_value"]) else 0,
        })
    return results


def get_top_vendors(top_n: int = 10) -> List[Dict[str, Any]]:
    vendors = get_vendors(min_wins=1)
    vendors.sort(key=lambda x: x["total_awarded"], reverse=True)
    return vendors[:top_n]
