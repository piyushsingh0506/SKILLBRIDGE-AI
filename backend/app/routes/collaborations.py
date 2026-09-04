from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.models import (
    User, AcademicianProfile, IndustryProfile, ResearchCollaboration, Mentorship, Notification
)
from app.schemas.collaboration import (
    ResearchCollaborationCreate, ResearchCollaborationResponse,
    MentorshipCreate, MentorshipResponse
)
from app.core.security import get_current_user, require_role

router = APIRouter(prefix="/api/collaborations", tags=["Industry-Academia Collaboration & Mentorship"])

@router.get("/research", response_model=List[ResearchCollaborationResponse])
def get_research_collaborations(db: Session = Depends(get_db)):
    collabs = db.query(ResearchCollaboration).order_by(ResearchCollaboration.created_at.desc()).all()
    results = []
    for c in collabs:
        results.append({
            "id": c.id,
            "industry_id": c.industry_id,
            "industry_name": c.industry.company_name if c.industry else "Industry Partner",
            "academician_id": c.academician_id,
            "academician_name": c.academician.user.full_name if c.academician and c.academician.user else "Faculty Lead",
            "title": c.title,
            "description": c.description,
            "domain": c.domain,
            "budget": c.budget,
            "status": c.status,
            "duration_months": c.duration_months,
            "created_at": c.created_at
        })
    return results

@router.post("/research", response_model=ResearchCollaborationResponse)
def create_research_collaboration(
    req: ResearchCollaborationCreate,
    current_user: User = Depends(require_role(["industry", "academician", "admin"])),
    db: Session = Depends(get_db)
):
    industry_id = 1
    if current_user.industry_profile:
        industry_id = current_user.industry_profile.id
        
    academician_id = req.academician_id or 1
    
    collab = ResearchCollaboration(
        industry_id=industry_id,
        academician_id=academician_id,
        title=req.title,
        description=req.description,
        domain=req.domain,
        budget=req.budget or "₹15,00,000",
        duration_months=req.duration_months or 12,
        status="Open"
    )
    db.add(collab)
    db.commit()
    db.refresh(collab)
    
    return {
        "id": collab.id,
        "industry_id": collab.industry_id,
        "industry_name": current_user.full_name,
        "academician_id": collab.academician_id,
        "academician_name": "Faculty Research Lead",
        "title": collab.title,
        "description": collab.description,
        "domain": collab.domain,
        "budget": collab.budget,
        "status": collab.status,
        "duration_months": collab.duration_months,
        "created_at": collab.created_at
    }

@router.get("/mentorships", response_model=List[MentorshipResponse])
def get_mentorships(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Mentorship)
    if current_user.role == "student":
        query = query.filter(Mentorship.mentee_id == current_user.id)
    elif current_user.role in ["academician", "industry"]:
        query = query.filter(Mentorship.mentor_id == current_user.id)
        
    mentorships = query.order_by(Mentorship.created_at.desc()).all()
    results = []
    for m in mentorships:
        mentor = db.query(User).filter(User.id == m.mentor_id).first()
        mentee = db.query(User).filter(User.id == m.mentee_id).first()
        results.append({
            "id": m.id,
            "mentor_id": m.mentor_id,
            "mentor_name": mentor.full_name if mentor else "Mentor",
            "mentor_role": mentor.role if mentor else "academician",
            "mentee_id": m.mentee_id,
            "mentee_name": mentee.full_name if mentee else "Student",
            "topic": m.topic,
            "status": m.status,
            "scheduled_time": m.scheduled_time,
            "meeting_link": m.meeting_link,
            "notes": m.notes,
            "created_at": m.created_at
        })
    return results

@router.post("/mentorships", response_model=MentorshipResponse)
def request_mentorship(
    req: MentorshipCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mentor = db.query(User).filter(User.id == req.mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor user not found")
        
    mentorship = Mentorship(
        mentor_id=req.mentor_id,
        mentee_id=current_user.id,
        topic=req.topic,
        status="Pending",
        scheduled_time="2026-09-20 16:00 IST",
        meeting_link="https://meet.google.com/connect-mentor-session",
        notes=req.notes or ""
    )
    db.add(mentorship)
    
    # Notify mentor
    notif = Notification(
        user_id=mentor.id,
        title="New Mentorship Request",
        message=f"{current_user.full_name} has requested a mentorship session on '{req.topic}'.",
        type="mentorship"
    )
    db.add(notif)
    db.commit()
    db.refresh(mentorship)
    
    return {
        "id": mentorship.id,
        "mentor_id": mentorship.mentor_id,
        "mentor_name": mentor.full_name,
        "mentor_role": mentor.role,
        "mentee_id": current_user.id,
        "mentee_name": current_user.full_name,
        "topic": mentorship.topic,
        "status": mentorship.status,
        "scheduled_time": mentorship.scheduled_time,
        "meeting_link": mentorship.meeting_link,
        "notes": mentorship.notes,
        "created_at": mentorship.created_at
    }

@router.put("/mentorships/{id}/status")
def update_mentorship_status(
    id: int,
    status_val: str, # "Accepted", "Completed", "Rejected"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    m = db.query(Mentorship).filter(Mentorship.id == id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mentorship session not found")
    m.status = status_val
    db.commit()
    return {"message": "Mentorship status updated successfully", "status": m.status}
