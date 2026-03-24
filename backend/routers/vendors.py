from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from auth import get_current_user
from database import User
import data_service as ds

router = APIRouter(prefix="/api/vendors", tags=["vendors"])


@router.get("")
def list_vendors(
    sector: Optional[str] = Query(None),
    agency: Optional[str] = Query(None),
    min_wins: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
):
    return ds.get_vendors(sector=sector, agency=agency, min_wins=min_wins)


@router.get("/{vendor_name}")
def vendor_profile(vendor_name: str, current_user: User = Depends(get_current_user)):
    profile = ds.get_vendor_profile(vendor_name)
    if not profile:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return profile
