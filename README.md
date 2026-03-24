# 🇸🇦 Jyad — Tenders Intelligence Platform

Jyad is a sophisticated full-stack data intelligence platform designed for the Saudi Arabian (KSA) procurement market. It provides deep insights into Etimad and Monafasat tender data, enabling businesses to make data-driven decisions through advanced analytics and visualizations.

---

## 🚀 Key Features

*   **📊 Executive Dashboard**: High-level KPIs including total tender value, sector distribution, and regional analysis.
*   **🔍 Tender Discovery**: Searchable and filterable interface for browsing current and past procurement opportunities.
*   **🏢 Company Intelligence**: In-depth profiles of vendors and competitors with historical tender performance.
*   **📈 Market Views**: Comparative analysis of top companies, competitive density, and pricing trends.
*   **💡 Market Insights**: Specialized views highlighting sector leaders and regional market experts.
*   **🔒 Secure Auth**: Full authentication system with JWT-based sessions and role-based access.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **API Client**: Axios

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [SQLite](https://www.sqlite.org/) with [SQLAlchemy ORM](https://www.sqlalchemy.org/)
- **Data Processing**: [Pandas](https://pandas.pydata.org/)
- **Authentication**: JWT (python-jose) & Bcrypt

---

## ⚙️ Quick Start

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### 2. Backend Setup
```powershell
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```
*   **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup
```powershell
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Launch the development server
npm run dev
```
*   **Web App**: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Default Credentials

| Role | Username | Password |
|---|---|---|
| **Administrator** | `admin` | `admin123` |
| **Demo User** | `demo` | `demo123` |

*New accounts can be registered via the `/register` page.*

---

## 📁 Project Overview

```text
Jyad/
├── backend/
│   ├── main.py              # Application entry & API routes
│   ├── auth.py              # Security & JWT logic
│   ├── database.py          # Database models & session management
│   ├── data_service.py      # Core data processing engine (Pandas)
│   ├── schemas.py           # Pydantic data validation
│   └── routers/             # Modular API endpoint definitions
├── frontend/
│   └── src/
│       ├── api/             # API client & services
│       ├── components/      # Reusable UI components (Sidebar, KpiCard)
│       ├── context/         # Auth & global state management
│       └── pages/           # High-level route components
└── mock_tenders_data.json   # ~20MB of curated KSA procurement data
```

---

## 🏛️ Architecture

Jyad uses a **Decoupled Architecture** where the FastAPI backend serves as a stateless REST API, and the React frontend handles UI rendering and state management.

1.  **Data Layer**: A large dataset of tenders in JSON format is processed by Pandas for complex analytical queries.
2.  **API Layer**: FastAPI handles routing, authentication, and serves processed data as JSON.
3.  **UI Layer**: React renders dynamic charts and filterable tables, communicating with the backend via Axios.

---

*Built for the future of KSA Procurement Intelligence.*

