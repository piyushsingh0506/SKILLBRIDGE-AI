from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.database.session import get_db
from app.models.models import (
    User, IndustryProfile, Internship, Job, Course, Notification
)
from app.schemas.opportunity import (
    InternshipCreate, InternshipResponse, JobCreate, JobResponse
)
from app.core.security import get_current_user, require_role
from app.ai.matcher import calculate_compatibility

router = APIRouter(prefix="/api", tags=["Opportunities (Internships, Jobs & Courses)"])

@router.get("/internships", response_model=List[InternshipResponse])
def get_internships(
    search: Optional[str] = None,
    work_mode: Optional[str] = None,
    location: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Internship).filter(Internship.is_active == True)
    
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Internship.title.ilike(s)) |
            (Internship.description.ilike(s)) |
            (Internship.required_skills.ilike(s))
        )
    if work_mode and work_mode != "All":
        query = query.filter(Internship.work_mode == work_mode)
    if location and location != "All":
        query = query.filter(Internship.location.ilike(f"%{location}%"))
        
    internships = query.order_by(Internship.created_at.desc()).all()
    
    # Prepare student profile for matching if user is student
    student_profile_dict = None
    if current_user and current_user.student_profile:
        sp = current_user.student_profile
        student_profile_dict = {
            "skills": [{"name": s.skill.name, "score": s.score} for s in sp.skills if s.skill],
            "soft_score": sp.soft_score,
            "cgpa": sp.cgpa,
            "certifications": sp.certifications,
            "projects": sp.projects,
            "career_interest": sp.career_interest,
            "preferred_locations": sp.preferred_locations
        }

    results = []
    for item in internships:
        match_score = 80.0
        match_reasons = []
        if student_profile_dict:
            opp_dict = {
                "title": item.title,
                "description": item.description,
                "required_skills": item.required_skills,
                "preferred_skills": item.preferred_skills,
                "location": item.location,
                "work_mode": item.work_mode
            }
            compat = calculate_compatibility(student_profile_dict, opp_dict)
            match_score = compat["compatibility_score"]
            match_reasons = compat["reasons"]

        results.append({
            "id": item.id,
            "industry_id": item.industry_id,
            "company_name": item.industry.company_name if item.industry else "Industry Partner",
            "company_logo": item.industry.logo_url if item.industry else None,
            "title": item.title,
            "description": item.description,
            "required_skills": item.required_skills,
            "preferred_skills": item.preferred_skills,
            "stipend": item.stipend,
            "duration_months": item.duration_months,
            "location": item.location,
            "work_mode": item.work_mode,
            "openings": item.openings,
            "deadline": item.deadline,
            "is_active": item.is_active,
            "created_at": item.created_at,
            "match_score": match_score,
            "match_reasons": match_reasons
        })
        
    # Sort by match score if student
    if student_profile_dict:
        results.sort(key=lambda x: x["match_score"] or 0, reverse=True)

    return results

@router.post("/internships", response_model=InternshipResponse)
def create_internship(
    req: InternshipCreate,
    current_user: User = Depends(require_role(["industry", "admin"])),
    db: Session = Depends(get_db)
):
    if not current_user.industry_profile and current_user.role != "admin":
        raise HTTPException(status_code=400, detail="Industry profile required")
        
    industry_id = current_user.industry_profile.id if current_user.industry_profile else 1
    
    internship = Internship(
        industry_id=industry_id,
        title=req.title,
        description=req.description,
        required_skills=req.required_skills,
        preferred_skills=req.preferred_skills or "",
        stipend=req.stipend or "₹20,000/month",
        duration_months=req.duration_months or 3,
        location=req.location or "New Delhi / Remote",
        work_mode=req.work_mode or "Hybrid",
        openings=req.openings or 2,
        deadline=req.deadline or "2026-10-30",
        is_active=True
    )
    db.add(internship)
    db.commit()
    db.refresh(internship)
    
    return {
        "id": internship.id,
        "industry_id": internship.industry_id,
        "company_name": current_user.full_name,
        "company_logo": current_user.avatar,
        "title": internship.title,
        "description": internship.description,
        "required_skills": internship.required_skills,
        "preferred_skills": internship.preferred_skills,
        "stipend": internship.stipend,
        "duration_months": internship.duration_months,
        "location": internship.location,
        "work_mode": internship.work_mode,
        "openings": internship.openings,
        "deadline": internship.deadline,
        "is_active": internship.is_active,
        "created_at": internship.created_at,
        "match_score": 100.0,
        "match_reasons": ["Newly posted opportunity"]
    }

@router.get("/jobs", response_model=List[JobResponse])
def get_jobs(
    search: Optional[str] = None,
    work_mode: Optional[str] = None,
    location: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(Job.is_active == True)
    
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Job.title.ilike(s)) |
            (Job.description.ilike(s)) |
            (Job.required_skills.ilike(s))
        )
    if work_mode and work_mode != "All":
        query = query.filter(Job.work_mode == work_mode)
    if location and location != "All":
        query = query.filter(Job.location.ilike(f"%{location}%"))
        
    jobs = query.order_by(Job.created_at.desc()).all()
    
    student_profile_dict = None
    if current_user and current_user.student_profile:
        sp = current_user.student_profile
        student_profile_dict = {
            "skills": [{"name": s.skill.name, "score": s.score} for s in sp.skills if s.skill],
            "soft_score": sp.soft_score,
            "cgpa": sp.cgpa,
            "certifications": sp.certifications,
            "projects": sp.projects,
            "career_interest": sp.career_interest,
            "preferred_locations": sp.preferred_locations
        }

    results = []
    for item in jobs:
        match_score = 78.0
        match_reasons = []
        if student_profile_dict:
            opp_dict = {
                "title": item.title,
                "description": item.description,
                "required_skills": item.required_skills,
                "preferred_skills": item.preferred_skills,
                "location": item.location,
                "work_mode": item.work_mode
            }
            compat = calculate_compatibility(student_profile_dict, opp_dict)
            match_score = compat["compatibility_score"]
            match_reasons = compat["reasons"]

        results.append({
            "id": item.id,
            "industry_id": item.industry_id,
            "company_name": item.industry.company_name if item.industry else "Industry Partner",
            "company_logo": item.industry.logo_url if item.industry else None,
            "title": item.title,
            "description": item.description,
            "required_skills": item.required_skills,
            "preferred_skills": item.preferred_skills,
            "salary_range": item.salary_range,
            "experience_years": item.experience_years,
            "qualification": item.qualification,
            "location": item.location,
            "job_type": item.job_type,
            "work_mode": item.work_mode,
            "openings": item.openings,
            "deadline": item.deadline,
            "is_active": item.is_active,
            "created_at": item.created_at,
            "match_score": match_score,
            "match_reasons": match_reasons
        })
        
    if student_profile_dict:
        results.sort(key=lambda x: x["match_score"] or 0, reverse=True)

    return results

@router.post("/jobs", response_model=JobResponse)
def create_job(
    req: JobCreate,
    current_user: User = Depends(require_role(["industry", "admin"])),
    db: Session = Depends(get_db)
):
    if not current_user.industry_profile and current_user.role != "admin":
        raise HTTPException(status_code=400, detail="Industry profile required")
        
    industry_id = current_user.industry_profile.id if current_user.industry_profile else 1
    
    job = Job(
        industry_id=industry_id,
        title=req.title,
        description=req.description,
        required_skills=req.required_skills,
        preferred_skills=req.preferred_skills or "",
        salary_range=req.salary_range or "₹8 - 14 LPA",
        experience_years=req.experience_years or "0-2 Years",
        qualification=req.qualification or "B.Tech / BAMS / MCA",
        location=req.location or "Bengaluru / Remote",
        job_type=req.job_type or "Full-time",
        work_mode=req.work_mode or "Hybrid",
        openings=req.openings or 2,
        deadline=req.deadline or "2026-11-15",
        is_active=True
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    return {
        "id": job.id,
        "industry_id": job.industry_id,
        "company_name": current_user.full_name,
        "company_logo": current_user.avatar,
        "title": job.title,
        "description": job.description,
        "required_skills": job.required_skills,
        "preferred_skills": job.preferred_skills,
        "salary_range": job.salary_range,
        "experience_years": job.experience_years,
        "qualification": job.qualification,
        "location": job.location,
        "job_type": job.job_type,
        "work_mode": job.work_mode,
        "openings": job.openings,
        "deadline": job.deadline,
        "is_active": job.is_active,
        "created_at": job.created_at,
        "match_score": 100.0,
        "match_reasons": ["Newly posted job"]
    }

@router.get("/courses")
def get_courses(skill: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Course)
    if skill:
        query = query.filter((Course.mapped_skill.ilike(f"%{skill}%")) | (Course.title.ilike(f"%{skill}%")))
    return query.all()
