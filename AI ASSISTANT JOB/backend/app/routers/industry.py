from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.database.models import (
    User,
    Industry,
    Opportunity,
    OpportunitySkill,
    Application,
    Student,
    StudentSkill,
    Skill
)
from app.schemas.connect import (
    CandidateApplicationResponse,
    ApplicationStatusUpdate
)
from app.routers.auth import get_current_user


router = APIRouter(
    prefix="/industry",
    tags=["Industry Management"]
)


def get_current_industry(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Industry:
    if current_user.role != "industry":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only industry partners can access this portal"
        )
    ind = db.query(Industry).filter(Industry.user_id == current_user.id).first()
    if not ind:
        ind = Industry(
            user_id=current_user.id,
            company_name=current_user.name or "Corporate Partner",
            industry_type="Technology",
            location="India"
        )
        db.add(ind)
        db.commit()
        db.refresh(ind)
    return ind


@router.get("/profile")
def get_industry_profile(
    ind: Industry = Depends(get_current_industry),
    db: Session = Depends(get_db)
):
    opp_count = db.query(Opportunity).filter(Opportunity.industry_id == ind.id).count()
    return {
        "id": ind.id,
        "user_id": ind.user_id,
        "company_name": ind.company_name,
        "industry_type": ind.industry_type,
        "location": ind.location,
        "website": ind.website,
        "contact_email": ind.contact_email or (ind.user.email if ind.user else None),
        "company_size": ind.company_size or "50-250 employees",
        "total_opportunities": opp_count
    }


@router.get("/applications", response_model=List[CandidateApplicationResponse])
def get_industry_applications(
    ind: Industry = Depends(get_current_industry),
    db: Session = Depends(get_db)
):
    """Retrieve all student applications received across all postings by this industry company"""
    opportunities = db.query(Opportunity).filter(Opportunity.industry_id == ind.id).all()
    opp_ids = [o.id for o in opportunities]

    if not opp_ids:
        return []

    applications = db.query(Application).filter(Application.opportunity_id.in_(opp_ids)).all()
    result = []

    for app in applications:
        student = db.query(Student).filter(Student.id == app.student_id).first()
        if not student:
            continue
        user = db.query(User).filter(User.id == student.user_id).first()
        opp = db.query(Opportunity).filter(Opportunity.id == app.opportunity_id).first()

        # Calculate matching score against opportunity required skills
        opp_skills = db.query(OpportunitySkill).filter(OpportunitySkill.opportunity_id == opp.id).all()
        student_skills = db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()

        st_skill_map = {ss.skill_id: ss.score for ss in student_skills}
        skill_details = []

        if opp_skills:
            scores = []
            for os_item in opp_skills:
                sk = db.query(Skill).filter(Skill.id == os_item.skill_id).first()
                st_score = st_skill_map.get(os_item.skill_id, 0.0)
                scores.append(min((st_score / os_item.required_level) * 100, 100) if os_item.required_level else 100)
                skill_details.append({
                    "skill_name": sk.name if sk else "Skill",
                    "student_score": st_score,
                    "required_level": os_item.required_level
                })
            match_score = round(sum(scores) / len(scores), 1)
        else:
            match_score = 80.0
            for ss in student_skills[:4]:
                sk = db.query(Skill).filter(Skill.id == ss.skill_id).first()
                skill_details.append({
                    "skill_name": sk.name if sk else "Skill",
                    "student_score": ss.score,
                    "required_level": 75.0
                })

        result.append(CandidateApplicationResponse(
            id=app.id,
            student_id=student.id,
            student_name=user.name if user else "Candidate",
            student_email=user.email if user else "",
            college=student.college,
            career_goal=student.career_goal,
            opportunity_id=opp.id if opp else 0,
            opportunity_title=opp.title if opp else "Opportunity",
            status=app.status or "Applied",
            match_score=match_score,
            student_skills=skill_details
        ))

    return result


@router.put("/applications/{application_id}/status")
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    ind: Industry = Depends(get_current_industry),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    opp = db.query(Opportunity).filter(Opportunity.id == app.opportunity_id).first()
    if not opp or opp.industry_id != ind.id:
        raise HTTPException(status_code=403, detail="You do not own this opportunity")

    app.status = data.status
    db.commit()
    return {"message": f"Candidate status updated to {data.status}", "status": data.status}


@router.get("/talent-pool")
def search_talent_pool(
    career_goal: Optional[str] = None,
    college: Optional[str] = None,
    min_score: Optional[float] = 0.0,
    ind: Industry = Depends(get_current_industry),
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if career_goal:
        query = query.filter(func.lower(Student.career_goal) == func.lower(career_goal))
    if college:
        query = query.filter(func.lower(Student.college).contains(func.lower(college)))

    students = query.all()
    result = []
    for s in students:
        user = db.query(User).filter(User.id == s.user_id).first()
        skills = db.query(StudentSkill).filter(StudentSkill.student_id == s.id).all()
        avg = (sum(sk.score for sk in skills) / len(skills)) if skills else 0.0

        if avg >= min_score:
            top_skills = []
            for sk in skills[:5]:
                skill_obj = db.query(Skill).filter(Skill.id == sk.skill_id).first()
                if skill_obj:
                    top_skills.append({"name": skill_obj.name, "score": sk.score})

            result.append({
                "student_id": s.id,
                "name": user.name if user else "Candidate",
                "email": user.email if user else "",
                "college": s.college or "University",
                "career_goal": s.career_goal or "AI Engineer",
                "graduation_year": s.graduation_year or 2026,
                "avg_score": round(avg, 1),
                "skills": top_skills
            })

    return result
