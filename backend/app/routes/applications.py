from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.database.session import get_db
from app.models.models import (
    User, StudentProfile, Internship, Job, Application, Notification
)
from app.schemas.opportunity import (
    ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse
)
from app.core.security import get_current_user, require_role
from app.ai.matcher import calculate_compatibility

router = APIRouter(prefix="/api/applications", tags=["Application Pipeline"])

@router.post("", response_model=ApplicationResponse)
def submit_application(
    req: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Only students can apply for opportunities")
        
    sp = current_user.student_profile
    
    # Check if already applied
    existing = db.query(Application).filter(
        Application.student_id == sp.id,
        Application.opportunity_type == req.opportunity_type,
        Application.opportunity_id == req.opportunity_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this opportunity")

    # Fetch opportunity details
    opp_title = ""
    company_name = ""
    company_logo = None
    opp_dict = {}
    
    if req.opportunity_type == "internship":
        intern = db.query(Internship).filter(Internship.id == req.opportunity_id).first()
        if not intern:
            raise HTTPException(status_code=404, detail="Internship not found")
        opp_title = intern.title
        company_name = intern.industry.company_name if intern.industry else "Industry Partner"
        company_logo = intern.industry.logo_url if intern.industry else None
        opp_dict = {
            "title": intern.title,
            "description": intern.description,
            "required_skills": intern.required_skills,
            "preferred_skills": intern.preferred_skills,
            "location": intern.location,
            "work_mode": intern.work_mode
        }
    else:
        jb = db.query(Job).filter(Job.id == req.opportunity_id).first()
        if not jb:
            raise HTTPException(status_code=404, detail="Job not found")
        opp_title = jb.title
        company_name = jb.industry.company_name if jb.industry else "Industry Partner"
        company_logo = jb.industry.logo_url if jb.industry else None
        opp_dict = {
            "title": jb.title,
            "description": jb.description,
            "required_skills": jb.required_skills,
            "preferred_skills": jb.preferred_skills,
            "location": jb.location,
            "work_mode": jb.work_mode
        }

    # Calculate real-time compatibility score
    student_profile_dict = {
        "skills": [{"name": s.skill.name, "score": s.score} for s in sp.skills if s.skill],
        "soft_score": sp.soft_score,
        "cgpa": sp.cgpa,
        "certifications": sp.certifications,
        "projects": sp.projects,
        "career_interest": sp.career_interest,
        "preferred_locations": sp.preferred_locations
    }
    compat = calculate_compatibility(student_profile_dict, opp_dict)
    
    application = Application(
        opportunity_type=req.opportunity_type,
        opportunity_id=req.opportunity_id,
        student_id=sp.id,
        match_score=compat["compatibility_score"],
        status="Applied",
        cover_note=req.cover_note or f"Enthusiastic candidate applying with {compat['compatibility_score']}% skill alignment.",
        resume_snapshot=f"{current_user.full_name} | {sp.college} | {sp.cgpa} CGPA | Skills: {', '.join([s.skill.name for s in sp.skills if s.skill][:4])}"
    )
    db.add(application)
    
    # Notify student
    notif = Notification(
        user_id=current_user.id,
        title="Application Submitted Successfully!",
        message=f"Your application for {opp_title} at {company_name} ({compat['compatibility_score']}% Match) has been received.",
        type="application"
    )
    db.add(notif)
    db.commit()
    db.refresh(application)
    
    return {
        "id": application.id,
        "opportunity_type": application.opportunity_type,
        "opportunity_id": application.opportunity_id,
        "opportunity_title": opp_title,
        "company_name": company_name,
        "company_logo": company_logo,
        "student_id": sp.id,
        "student_name": current_user.full_name,
        "student_email": current_user.email,
        "student_college": sp.college,
        "student_branch": sp.branch,
        "match_score": application.match_score,
        "status": application.status,
        "cover_note": application.cover_note,
        "interview_date": None,
        "interview_link": None,
        "feedback": None,
        "applied_at": application.applied_at,
        "updated_at": application.updated_at
    }

@router.get("/my-applications", response_model=List[ApplicationResponse])
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.student_profile:
        return []
    sp = current_user.student_profile
    apps = db.query(Application).filter(Application.student_id == sp.id).order_by(Application.applied_at.desc()).all()
    
    results = []
    for a in apps:
        opp_title = ""
        comp_name = "Industry Partner"
        comp_logo = None
        if a.opportunity_type == "internship":
            intern = db.query(Internship).filter(Internship.id == a.opportunity_id).first()
            if intern:
                opp_title = intern.title
                comp_name = intern.industry.company_name if intern.industry else comp_name
                comp_logo = intern.industry.logo_url if intern.industry else None
        else:
            jb = db.query(Job).filter(Job.id == a.opportunity_id).first()
            if jb:
                opp_title = jb.title
                comp_name = jb.industry.company_name if jb.industry else comp_name
                comp_logo = jb.industry.logo_url if jb.industry else None
                
        results.append({
            "id": a.id,
            "opportunity_type": a.opportunity_type,
            "opportunity_id": a.opportunity_id,
            "opportunity_title": opp_title or f"{a.opportunity_type.title()} #{a.opportunity_id}",
            "company_name": comp_name,
            "company_logo": comp_logo,
            "student_id": sp.id,
            "student_name": current_user.full_name,
            "student_email": current_user.email,
            "student_college": sp.college,
            "student_branch": sp.branch,
            "match_score": a.match_score,
            "status": a.status,
            "cover_note": a.cover_note,
            "interview_date": a.interview_date,
            "interview_link": a.interview_link,
            "feedback": a.feedback,
            "applied_at": a.applied_at,
            "updated_at": a.updated_at
        })
    return results

@router.get("/industry/all", response_model=List[ApplicationResponse])
def get_industry_applications(
    current_user: User = Depends(require_role(["industry", "admin"])),
    db: Session = Depends(get_db)
):
    apps = db.query(Application).order_by(Application.applied_at.desc()).all()
    results = []
    for a in apps:
        opp_title = ""
        comp_name = "Industry Partner"
        comp_logo = None
        if a.opportunity_type == "internship":
            intern = db.query(Internship).filter(Internship.id == a.opportunity_id).first()
            if intern:
                opp_title = intern.title
                comp_name = intern.industry.company_name if intern.industry else comp_name
                comp_logo = intern.industry.logo_url if intern.industry else None
        else:
            jb = db.query(Job).filter(Job.id == a.opportunity_id).first()
            if jb:
                opp_title = jb.title
                comp_name = jb.industry.company_name if jb.industry else comp_name
                comp_logo = jb.industry.logo_url if jb.industry else None
                
        sp = a.student
        user = sp.user if sp else None
        results.append({
            "id": a.id,
            "opportunity_type": a.opportunity_type,
            "opportunity_id": a.opportunity_id,
            "opportunity_title": opp_title or f"{a.opportunity_type.title()} #{a.opportunity_id}",
            "company_name": comp_name,
            "company_logo": comp_logo,
            "student_id": a.student_id,
            "student_name": user.full_name if user else "Candidate",
            "student_email": user.email if user else "",
            "student_college": sp.college if sp else "",
            "student_branch": sp.branch if sp else "",
            "match_score": a.match_score,
            "status": a.status,
            "cover_note": a.cover_note,
            "interview_date": a.interview_date,
            "interview_link": a.interview_link,
            "feedback": a.feedback,
            "applied_at": a.applied_at,
            "updated_at": a.updated_at
        })
    return results

@router.put("/{id}/status")
def update_application_status(
    id: int,
    req: ApplicationStatusUpdate,
    current_user: User = Depends(require_role(["industry", "admin"])),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    app.status = req.status
    if req.interview_date is not None:
        app.interview_date = req.interview_date
    if req.interview_link is not None:
        app.interview_link = req.interview_link
    if req.feedback is not None:
        app.feedback = req.feedback
        
    # Notify student
    if app.student and app.student.user:
        notif = Notification(
            user_id=app.student.user.id,
            title=f"Application Update: {req.status}",
            message=f"Your application status has been updated to '{req.status}'. {req.feedback or ''}",
            type="application"
        )
        db.add(notif)
        
    db.commit()
    return {"message": "Application status updated successfully", "status": app.status}
