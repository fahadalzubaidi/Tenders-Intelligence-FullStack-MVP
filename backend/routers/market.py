from fastapi import APIRouter, Depends, Query
from typing import Optional
from auth import get_current_user
from database import User
import data_service as ds

router = APIRouter(prefix="/api/market", tags=["market"])


@router.get("/smart-filters")
def market_smart_filters(
    sector: Optional[str] = Query(None),
    agency: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
):
    return ds.get_market_smart_filter_options(sector=sector, agency=agency)


@router.get("/top-companies")
def top_companies(
    sector: Optional[str] = Query(None),
    agency: Optional[str] = Query(None),
    top_n: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    return ds.get_top_companies(sector=sector, agency=agency, top_n=top_n)


@router.get("/competitive-density")
def competitive_density(
    sector: Optional[str] = Query(None),
    agency: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
):
    return ds.get_competitive_density(sector=sector, agency=agency)


@router.get("/pricing-analysis")
def pricing_analysis(
    sector: Optional[str] = Query(None),
    agency: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
):
    return ds.get_pricing_analysis(sector=sector, agency=agency)


@router.get("/sector-specialists")
def sector_specialists(
    min_wins: int = Query(2, ge=1),
    current_user: User = Depends(get_current_user),
):
    return ds.get_sector_specialists(min_wins=min_wins)


@router.get("/region-specialists")
def region_specialists(
    min_wins: int = Query(2, ge=1),
    current_user: User = Depends(get_current_user),
):
    return ds.get_region_specialists(min_wins=min_wins)
