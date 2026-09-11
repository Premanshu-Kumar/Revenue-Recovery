import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.session import engine, Base
from app.database.seed import run_seed
from app.api.routes import (
    dashboard, cases, customers, payments, invoices,
    receivables, campaigns, analytics, audit, simulation, demo, ai
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables exist
    Base.metadata.create_all(bind=engine)
    # Check if database is populated, if not seed it automatically
    from app.database.session import SessionLocal
    from app.models.entities import RecoveryCase
    db = SessionLocal()
    try:
        case_count = db.query(RecoveryCase).count()
        if case_count < 100:
            print("🌱 Initializing empty database with realistic seed dataset...")
            run_seed(reset=True)
    except Exception as e:
        print(f"Startup check exception: {e}")
    finally:
        db.close()
    yield

app = FastAPI(
    title="RecoverAI — Autonomous AI Revenue Recovery API",
    description="Backend intelligence, ML recovery probability models, policy engines, and simulation workflows for RecoverAI.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(cases.router, prefix=settings.API_V1_STR)
app.include_router(customers.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(invoices.router, prefix=settings.API_V1_STR)
app.include_router(receivables.router, prefix=settings.API_V1_STR)
app.include_router(campaigns.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)
app.include_router(demo.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": "RecoverAI",
        "tagline": "Detect revenue at risk. Decide the right intervention. Recover money automatically.",
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "version": "1.0.0"
    }
