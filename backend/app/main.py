import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.core.config import settings
from app.database.session import Base, engine
from app.database.seed_data import seed_database

# Create all tables on startup
Base.metadata.create_all(bind=engine)

# Auto seed database if needed
try:
    seed_database()
except Exception as e:
    print(f"[*] Note during startup DB init: {e}")

# Routers
from app.routes.auth import router as auth_router
from app.routes.students import router as students_router
from app.routes.assessments import router as assessments_router
from app.routes.ai import router as ai_router
from app.routes.opportunities import router as opportunities_router
from app.routes.applications import router as applications_router
from app.routes.industry import router as industry_router
from app.routes.collaborations import router as collaborations_router
from app.routes.institution import router as institution_router
from app.routes.notifications import router as notifications_router
from app.routes.admin import router as admin_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "**Smart India Hackathon Problem Statement 26044**\n\n"
        "Ministry of Ayush | All India Institute of Ayurveda\n\n"
        "Centralized AI-powered ecosystem connecting Students, Institutions, "
        "Academicians, and Industries for Skill Mapping, Assessments, Internships, "
        "Placements, and Research Collaboration."
    ),
    version=settings.PROJECT_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(assessments_router)
app.include_router(ai_router)
app.include_router(opportunities_router)
app.include_router(applications_router)
app.include_router(industry_router)
app.include_router(collaborations_router)
app.include_router(institution_router)
app.include_router(notifications_router)
app.include_router(admin_router)

@app.get("/health", tags=["System Health"])
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "version": settings.PROJECT_VERSION,
        "ai_engine": "online",
        "database": "connected"
    }

# Check frontend build directory or static files
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
root_dir = os.path.dirname(backend_dir)
frontend_dist = os.path.join(root_dir, "frontend", "dist")
frontend_static = os.path.join(root_dir, "frontend")

if os.path.exists(frontend_dist):
    app.mount("/static", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="static")
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
elif os.path.exists(frontend_static) and os.path.exists(os.path.join(frontend_static, "index.html")):
    app.mount("/static", StaticFiles(directory=frontend_static), name="static")
    @app.get("/")
    def root_spa():
        return FileResponse(os.path.join(frontend_static, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "message": "Academia–Industry Connect API is running",
            "tagline": settings.PROJECT_TAGLINE,
            "docs_url": "/docs",
            "health_check": "/health"
        }
