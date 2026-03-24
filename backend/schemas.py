from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class LoginRequest(BaseModel):
    username: str
    password: str


# ── Tenders ───────────────────────────────────────────────────────────────────
class TenderSummary(BaseModel):
    id: int
    tenderName: str
    agency: str
    sector: str
    region: str
    city: str
    status: str
    status_bucket: str
    deadline: Optional[str]
    contract_days: Optional[int]
    doc_fees: Optional[float]
    bid_count: int
    min_bid: Optional[float]
    max_bid: Optional[float]
    avg_bid: Optional[float]
    awarded_value: Optional[float]
    winner: Optional[str]


class ProposalOut(BaseModel):
    vendor_name: str
    price: Optional[float]
    technical_match: bool
    is_winner: bool
    tender_id: int
    tenderName: str
    agency: str
    sector: str


class TenderDetail(BaseModel):
    id: int
    tenderName: str
    agency: str
    sector: str
    region: str
    city: str
    status: str
    status_bucket: str
    deadline: Optional[str]
    contract_days: Optional[int]
    doc_fees: Optional[float]
    bid_count: int
    min_bid: Optional[float]
    max_bid: Optional[float]
    avg_bid: Optional[float]
    awarded_value: Optional[float]
    winner: Optional[str]
    proposals: List[dict]


class KPIStats(BaseModel):
    total_tenders: int
    awarded_tenders: int
    unique_vendors: int
    total_awarded_value: float
    avg_bidders: float


class FilterOptions(BaseModel):
    agencies: List[str]
    sectors: List[str]
    regions: List[str]
    cities: List[str]
    statuses: List[str]


class VendorProfile(BaseModel):
    vendor_name: str
    participations: int
    wins: int
    win_rate: float
    avg_bid: Optional[float]
    total_awarded: float
    sectors: List[str]
    regions: List[str]
    last_activity: Optional[str]


class PaginatedTenders(BaseModel):
    items: List[TenderSummary]
    total: int
    page: int
    page_size: int
    total_pages: int
