from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database.session import get_db
from app.models.models import (
    User, StudentProfile, IndustryProfile, AcademicianProfile, InstitutionProfile,
    Skill, Internship, Job, Application
)
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/api/admin", tags=["Super Admin Portal"])

@router.get("/overview")
def get_admin_overview(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    return {
        "total_users": db.query(User).count(),
        "total_students": db.query(StudentProfile).count(),
        "total_industries": db.query(IndustryProfile).count(),
        "total_academicians": db.query(AcademicianProfile).count(),
        "total_institutions": db.query(InstitutionProfile).count(),
        "total_skills": db.query(Skill).count(),
        "total_internships": db.query(Internship).count(),
        "total_jobs": db.query(Job).count(),
        "total_applications": db.query(Application).count(),
        "system_status": "Healthy & Operational",
        "ai_engine_status": "Scikit-Learn & NLP Online"
    }

@router.get("/users")
def get_all_users(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at
        }
        for u in users
    ]

@router.put("/users/{id}/toggle-active")
def toggle_user_active(
    id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'} successfully", "is_active": user.is_active}

@router.get("/skills")
def get_admin_skills(db: Session = Depends(get_db)):
    return db.query(Skill).all()

@router.post("/skills")
def add_admin_skill(
    name: str,
    category: str = "Technical",
    demand_level: str = "High",
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    existing = db.query(Skill).filter(Skill.name.ilike(name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Skill already exists")
    sk = Skill(name=name, category=category, demand_level=demand_level)
    db.add(sk)
    db.commit()
    db.refresh(sk)
    return sk
