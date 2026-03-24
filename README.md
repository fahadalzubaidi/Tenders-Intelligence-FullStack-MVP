# Tenders Intelligence Full-Stack MVP

A comprehensive full-stack intelligence platform for Saudi Arabia (KSA) procurement and tender analytics. Built with **FastAPI** on the backend and **React 18** on the frontend, this platform provides actionable insights into government tenders, vendor performance, and market dynamics.

---

## 🚀 Key Features

- **Tender Analytics Dashboard**: Visualize KPIs, sectors, and regional distributions.
- **Advanced Search & Filtering**: Explore government tenders with detailed filtering by region, status, and value.
- **Market Intelligence**: Analyze top-performing companies and competitive density.
- **Authentication System**: Secure JWT-based access with login and registration.
- **Responsive Web Interface**: Optimized for both desktop and tablet experiences.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, Tailwind CSS v4, Recharts, React Router v7 |
| **Backend** | FastAPI, SQLAlchemy, SQLite, python-jose (JWT) |
| **Data Processing** | Pandas, mock Etimad/Monafasat JSON data |
| **Environment** | PowerShell startup scripts for Windows |

---

## 🏁 Quick Start

### 1. Start the Backend
The backend runs on **FastAPI** and handles all data processing and authentication.

```powershell
# In the root directory
.\start_backend.ps1
```

*Backend API: http://localhost:8001 | API Documentation: http://localhost:8001/docs*

### 2. Start the Frontend
The frontend is a modern **React SPA** built with Vite.

```powershell
# In the root directory
.\start_frontend.ps1
```

*Frontend: http://localhost:5173*

---

## 🔐 Authentication
Use the following credentials to explore the platform:

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `admin123` |
| **Demo User** | `demo` | `demo123` |

*New accounts can also be created via the /register page.*

---

## 📁 Project Structure

```text
Jyad/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── auth.py              # JWT authentication logic
│   ├── database.py          # SQLAlchemy models & SQLite setup
│   ├── data_service.py      # Core data processing (Pandas)
│   ├── schemas.py           # Pydantic data validation
│   └── routers/             # API routes (Auth, Tenders, Vendors, Market)
├── frontend/
│   └── src/
│       ├── api/client.js    # Centralized Axios API client
│       ├── context/         # Auth & Global state management
│       ├── components/      # Reusable UI components (Sidebar, KpiCard, etc.)
│       └── pages/           # Platform pages (8 distinct views)
├── mock_tenders_data.json   # Sample KSA procurement dataset
├── start_backend.ps1        # One-click backend startup script
└── start_frontend.ps1       # One-click frontend startup script
```

---

## 📊 Sample Data
The project includes a substantial `mock_tenders_data.json` file (~19MB) that simulates real-world KSA procurement data, including:
- Tender values and release dates
- Regional classifications (Riyadh, Jeddah, etc.)
- Industry sector categorization
- Vendor participation and bidding history

---

## 📜 Repository
This project has been updated and migrated to its own dedicated repository:
**[Tenders-Intelligence-FullStack-MVP](https://github.com/fahadalzubaidi/Tenders-Intelligence-FullStack-MVP.git)**
