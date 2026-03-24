# Jyad — Tenders Intelligence Platform

A full-stack web application for KSA (Saudi Arabia) procurement intelligence, built with **FastAPI + React**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, Tailwind CSS v4, Recharts, React Router v7 |
| **Backend** | FastAPI, SQLAlchemy, SQLite |
| **Auth** | JWT tokens (python-jose), bcrypt passwords |
| **Data** | Pandas, mock Etimad/Monafasat JSON data |

---

## Quick Start

### 1. Start the Backend

```powershell
.\start_backend.ps1
```

Or manually:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Backend: http://localhost:8001
API Docs: http://localhost:8001/docs

### 2. Start the Frontend

```powershell
.\start_frontend.ps1
```

Or manually:
```powershell
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

---

## Default Login Credentials

| Username | Password |
|---|---|
| admin | admin123 |
| demo | demo123 |

You can also register a new account at /register.

---

## Pages

| Page | Route | Description |
|---|---|---|
| Login | /login | Authentication page |
| Register | /register | Create new account |
| Dashboard | / | KPI overview, sector/region charts |
| Tenders Listing | /tenders | Searchable, filterable tender browser |
| Opportunity Detail | /opportunity/:id | Deep-dive single tender view |
| Company Intelligence | /company | Vendor profiles and analytics |
| Market Views | /market-views | Top companies, competitive density, pricing |
| Market Insights | /market-insights | Sector and region specialists |

---

## Project Structure

```
Jyad/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── auth.py              # JWT authentication
│   ├── database.py          # SQLAlchemy models + SQLite
│   ├── data_service.py      # Tender data processing (Pandas)
│   ├── schemas.py           # Pydantic schemas
│   ├── config.py            # Settings
│   └── routers/
│       ├── auth.py          # /api/auth/*
│       ├── tenders.py       # /api/tenders/*
│       ├── vendors.py       # /api/vendors/*
│       └── market.py        # /api/market/*
├── frontend/
│   └── src/
│       ├── api/client.js    # Axios API client
│       ├── context/         # Auth context
│       ├── components/      # Layout, Sidebar, KpiCard, ProtectedRoute
│       └── pages/           # All 8 pages
├── mock_tenders_data.json   # Sample KSA tender data
├── start_backend.ps1
└── start_frontend.ps1
```
