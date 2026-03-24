from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, SessionLocal, User
from auth import get_password_hash
from routers import auth, tenders, vendors, market

app = FastAPI(title="Jyad Tenders Intelligence API", version="1.0.0")

# CORS – allow the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(tenders.router)
app.include_router(vendors.router)
app.include_router(market.router)


@app.on_event("startup")
def startup():
    init_db()
    # Seed a default admin user if none exists
    db = SessionLocal()
    try:
        if not db.query(User).first():
            admin = User(
                username="admin",
                email="admin@jyad.sa",
                full_name="Admin User",
                hashed_password=get_password_hash("admin123"),
            )
            db.add(admin)
            demo = User(
                username="demo",
                email="demo@jyad.sa",
                full_name="Demo User",
                hashed_password=get_password_hash("demo123"),
            )
            db.add(demo)
            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Jyad Tenders Intelligence API", "docs": "/docs"}
