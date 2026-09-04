import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.database.database import (
    Base,
    engine
)

from app.database import models

from app.routers.auth import (
    router as auth_router
)

from app.routers.student import (
    router as student_router
)

from app.routers.assessment import (
    router as assessment_router
)

from app.routers.skill_gap import router as skill_gap_router
from app.routers.opportunity import router as opportunity_router
from app.routers.connect import router as connect_router
from app.routers.institution import router as institution_router
from app.routers.industry import router as industry_router

# Create tables
Base.metadata.create_all(
    bind=engine
)

app = FastAPI(
    title="SkillBridge AI",
    description=(
        "AI-Powered Academia-Industry "
        "Skill Mapping, Internship and "
        "Placement Platform"
    ),
    version="1.0.0"
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(student_router)
app.include_router(assessment_router)
app.include_router(skill_gap_router)
app.include_router(opportunity_router)
app.include_router(connect_router)
app.include_router(institution_router)
app.include_router(industry_router)

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }

# Resolve Frontend path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
ai_job_dir = os.path.dirname(backend_dir)
frontend_dir = os.path.join(ai_job_dir, "frontend")
if not os.path.exists(frontend_dir):
    frontend_dir = os.path.join(backend_dir, "frontend")

if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
else:
    @app.get("/")
    def root():
        return {
            "message": "SkillBridge AI API is running",
            "status": "success",
            "docs_url": "/docs"
        }