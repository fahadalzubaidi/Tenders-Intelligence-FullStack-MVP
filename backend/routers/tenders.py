from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from auth import get_current_user
from database import User
import data_service as ds

router = APIRouter(prefix="/api/tenders", tags=["tenders"])


@router.get("/kpi")
def kpi(current_user: User = Depends(get_current_user)):
    return ds.get_kpi_stats()


@router.get("/filters")
def filters(current_user: User = Depends(get_current_user)):
    return ds.get_filter_options()


@router.get("/smart-filters")
def smart_filters(
    search: Optional[str] = Query(None),
    agency: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    status_bucket: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
):
    return ds.get_smart_filter_options(
        search=search,
        agency=agency,
        sector=sector,
        region=region,
        city=city,
        status_bucket=status_bucket,
    )


@router.get("")
def list_tenders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    agency: Optional[str] = Query(None),
    sector: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    status_bucket: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
):
    return ds.get_tenders(
        page=page,
        page_size=page_size,
        search=search,
        agency=agency,
        sector=sector,
        region=region,
        city=city,
        status_bucket=status_bucket,
    )


@router.get("/sector-breakdown")
def sector_breakdown(current_user: User = Depends(get_current_user)):
    return ds.get_sector_breakdown()


@router.get("/region-breakdown")
def region_breakdown(current_user: User = Depends(get_current_user)):
    return ds.get_region_breakdown()


@router.get("/top-agencies")
def top_agencies(top_n: int = Query(10), current_user: User = Depends(get_current_user)):
    return ds.get_top_agencies(top_n)


@router.get("/top-vendors")
def top_vendors(top_n: int = Query(10), current_user: User = Depends(get_current_user)):
    return ds.get_top_vendors(top_n)


@router.get("/{tender_id}")
def tender_detail(tender_id: int, current_user: User = Depends(get_current_user)):
    detail = ds.get_tender_detail(tender_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Tender not found")
    return detail
