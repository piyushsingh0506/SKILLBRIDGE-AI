from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database.session import get_db
from app.models.models import (
    User, StudentProfile, StudentSkill, Skill, Project, Certification, AssessmentResult
)
from app.schemas.student import (
    StudentProfileUpdate, StudentProfileResponse, StudentSkillCreate,
    ProjectCreate, ProjectResponse, CertificationCreate, CertificationResponse, SkillItem
)
from app.core.security import get_current_user, require_role
from app.ai.skill_extractor import normalize_skill

router = APIRouter(prefix="/api/students", tags=["Student Portal"])

@router.get("/profile", response_model=StudentProfileResponse)
def get_student_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.student_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    sp = current_user.student_profile
    
    # Map skills
    skills_data = []
    for s in sp.skills:
        skills_data.append({
            "id": s.id,
            "name": s.skill.name if s.skill else "Skill",
            "category": s.skill.category if s.skill else "Technical",
            "proficiency_level": s.proficiency_level,
            "score": s.score,
            "verified": s.verified,
            "source": s.source
        })
        
    return {
        "id": sp.id,
        "user_id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "avatar": current_user.avatar,
        "college": sp.college,
        "course": sp.course,
        "branch": sp.branch,
        "graduation_year": sp.graduation_year,
        "career_interest": sp.career_interest,
        "preferred_roles": sp.preferred_roles or "",
        "preferred_locations": sp.preferred_locations or "",
        "bio": sp.bio or "",
        "cgpa": sp.cgpa,
        "placement_ready": sp.placement_ready,
        "profile_completion": sp.profile_completion,
        "overall_skill_score": sp.overall_skill_score,
        "technical_score": sp.technical_score,
        "soft_score": sp.soft_score,
        "placement_readiness_score": sp.placement_readiness_score,
        "target_career_role_id": sp.target_career_role_id,
        "skills": skills_data,
        "projects": sp.projects,
        "certifications": sp.certifications
    }

@router.put("/profile")
def update_student_profile(
    req: StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.student_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    sp = current_user.student_profile
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.phone is not None:
        current_user.phone = req.phone
    if req.college is not None:
        sp.college = req.college
    if req.course is not None:
        sp.course = req.course
    if req.branch is not None:
        sp.branch = req.branch
    if req.graduation_year is not None:
        sp.graduation_year = req.graduation_year
    if req.career_interest is not None:
        sp.career_interest = req.career_interest
    if req.preferred_roles is not None:
        sp.preferred_roles = req.preferred_roles
    if req.preferred_locations is not None:
        sp.preferred_locations = req.preferred_locations
    if req.bio is not None:
        sp.bio = req.bio
    if req.cgpa is not None:
        sp.cgpa = req.cgpa
    if req.target_career_role_id is not None:
        sp.target_career_role_id = req.target_career_role_id
        
    # Recalculate profile completion
    fields = [sp.college, sp.course, sp.branch, sp.career_interest, sp.bio, current_user.phone]
    completed_fields = sum(1 for f in fields if f) + (2 if len(sp.skills) > 0 else 0) + (1 if len(sp.projects) > 0 else 0)
    sp.profile_completion = min(100.0, round((completed_fields / 9.0) * 100, 1))
    
    db.commit()
    return {"message": "Profile updated successfully", "profile_completion": sp.profile_completion}

@router.get("/skills")
def get_student_skills(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.student_profile:
        return []
    sp = current_user.student_profile
    return [
        {
            "id": s.id,
            "skill_id": s.skill_id,
            "name": s.skill.name,
            "category": s.skill.category,
            "proficiency_level": s.proficiency_level,
            "score": s.score,
            "verified": s.verified,
            "source": s.source
        }
        for s in sp.skills
    ]

@router.post("/skills")
def add_student_skill(
    req: StudentSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.student_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    sp = current_user.student_profile
    norm_name = normalize_skill(req.skill_name)
    
    # Check if skill exists in global skill ontology, else create
    skill = db.query(Skill).filter(Skill.name == norm_name).first()
    if not skill:
        skill = Skill(name=norm_name, category=req.category or "Technical", demand_level="High")
        db.add(skill)
        db.commit()
        db.refresh(skill)
        
    # Check if student already has this skill
    existing = db.query(StudentSkill).filter(
        StudentSkill.student_id == sp.id,
        StudentSkill.skill_id == skill.id
    ).first()
    
    if existing:
        existing.proficiency_level = req.proficiency_level or existing.proficiency_level
        existing.score = req.score or existing.score
        existing.source = req.source or existing.source
    else:
        new_skill = StudentSkill(
            student_id=sp.id,
            skill_id=skill.id,
            proficiency_level=req.proficiency_level or "Intermediate",
            score=req.score or 75.0,
            verified=False,
            source=req.source or "Self"
        )
        db.add(new_skill)
        
    # Recalculate average skill scores
    db.commit()
    all_skills = db.query(StudentSkill).filter(StudentSkill.student_id == sp.id).all()
    if all_skills:
        sp.overall_skill_score = round(sum(s.score for s in all_skills) / len(all_skills), 1)
        sp.placement_readiness_score = round(sp.overall_skill_score * 0.7 + (sp.cgpa * 10) * 0.3, 1)
        db.commit()
        
    return {"message": "Skill added successfully", "skill": norm_name}

@router.delete("/skills/{id}")
def delete_student_skill(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.student_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    sp = current_user.student_profile
    sk = db.query(StudentSkill).filter(StudentSkill.id == id, StudentSkill.student_id == sp.id).first()
    if not sk:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(sk)
    db.commit()
    return {"message": "Skill deleted successfully"}

@router.get("/projects", response_model=List[ProjectResponse])
def get_student_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.student_profile:
        return []
    return current_user.student_profile.projects

@router.post("/projects", response_model=ProjectResponse)
def add_student_project(
    req: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.student_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    sp = current_user.student_profile
    
    project = Project(
        student_id=sp.id,
        title=req.title,
        description=req.description,
        tech_stack=req.tech_stack,
        github_url=req.github_url or "",
        live_url=req.live_url or "",
        start_date=req.start_date or "",
        end_date=req.end_date or ""
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/projects/{id}")
def delete_student_project(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.student_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    sp = current_user.student_profile
    proj = db.query(Project).filter(Project.id == id, Project.student_id == sp.id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(proj)
    db.commit()
    return {"message": "Project deleted successfully"}

@router.get("/certifications", response_model=List[CertificationResponse])
def get_student_certifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.student_profile:
        return []
    return current_user.student_profile.certifications

@router.post("/certifications", response_model=CertificationResponse)
def add_student_certification(
    req: CertificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.student_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    sp = current_user.student_profile
    
    cert = Certification(
        student_id=sp.id,
        title=req.title,
        issuer=req.issuer,
        issue_date=req.issue_date,
        expiry_date=req.expiry_date or "",
        credential_url=req.credential_url or "",
        verified=True
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

@router.delete("/certifications/{id}")
def delete_student_certification(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.student_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    sp = current_user.student_profile
    cert = db.query(Certification).filter(Certification.id == id, Certification.student_id == sp.id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    db.delete(cert)
    db.commit()
    return {"message": "Certification deleted successfully"}

@router.get("/public-portfolio/{user_id}")
def get_public_portfolio(user_id: int, db: Session = Depends(get_db)):
    """Public shareable Digital Skill Portfolio."""
    user = db.query(User).filter(User.id == user_id, User.role == "student").first()
    if not user or not user.student_profile:
        raise HTTPException(status_code=404, detail="Public portfolio not found")
        
    sp = user.student_profile
    return {
        "full_name": user.full_name,
        "avatar": user.avatar,
        "college": sp.college,
        "course": sp.course,
        "branch": sp.branch,
        "graduation_year": sp.graduation_year,
        "career_interest": sp.career_interest,
        "bio": sp.bio,
        "overall_skill_score": sp.overall_skill_score,
        "placement_readiness_score": sp.placement_readiness_score,
        "verified_badge": True,
        "skills": [
            {
                "name": s.skill.name,
                "category": s.skill.category,
                "score": s.score,
                "level": s.proficiency_level,
                "verified": s.verified
            }
            for s in sp.skills
        ],
        "projects": [
            {
                "title": p.title,
                "description": p.description,
                "tech_stack": p.tech_stack,
                "github_url": p.github_url,
                "live_url": p.live_url
            }
            for p in sp.projects
        ],
        "certifications": [
            {
                "title": c.title,
                "issuer": c.issuer,
                "issue_date": c.issue_date,
                "credential_url": c.credential_url
            }
            for c in sp.certifications
        ]
    }
