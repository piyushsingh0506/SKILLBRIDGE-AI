from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import (
    User,
    Industry,
    Opportunity,
    OpportunitySkill,
    Skill
)
from app.schemas.opportunity import (
    OpportunityCreate,
    OpportunityResponse,
    OpportunitySkillCreate
)
from app.routers.auth import get_current_user


router = APIRouter(
    prefix="/opportunities",
    tags=["Opportunities"]
)


# ------------------------------------------------
# INDUSTRY: CREATE OPPORTUNITY
# ------------------------------------------------

@router.post("/", response_model=OpportunityResponse)
def create_opportunity(
    data: OpportunityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "industry":
        raise HTTPException(
            status_code=403,
            detail="Only industries can create opportunities"
        )

    industry = db.query(Industry).filter(
        Industry.user_id == current_user.id
    ).first()

    if not industry:
        raise HTTPException(
            status_code=404,
            detail="Industry profile not found"
        )

    opportunity = Opportunity(
        industry_id=industry.id,
        title=data.title,
        description=data.description,
        location=data.location,
        opportunity_type=data.opportunity_type
    )

    db.add(opportunity)
    db.commit()
    db.refresh(opportunity)

    return opportunity


# ------------------------------------------------
# ADD REQUIRED SKILL
# ------------------------------------------------

@router.post("/{opportunity_id}/skills")
def add_opportunity_skill(
    opportunity_id: int,
    data: OpportunitySkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "industry":
        raise HTTPException(
            status_code=403,
            detail="Only industries can add opportunity skills"
        )

    industry = db.query(Industry).filter(
        Industry.user_id == current_user.id
    ).first()

    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id,
        Opportunity.industry_id == industry.id
    ).first()

    if not opportunity:
        raise HTTPException(
            status_code=404,
            detail="Opportunity not found"
        )

    skill = db.query(Skill).filter(
        Skill.id == data.skill_id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    if data.required_level < 0 or data.required_level > 100:
        raise HTTPException(
            status_code=400,
            detail="Required level must be between 0 and 100"
        )

    opportunity_skill = OpportunitySkill(
        opportunity_id=opportunity_id,
        skill_id=data.skill_id,
        required_level=data.required_level
    )

    db.add(opportunity_skill)
    db.commit()
    db.refresh(opportunity_skill)

    return {
        "message": "Required skill added",
        "skill_id": data.skill_id,
        "skill_name": skill.name,
        "required_level": data.required_level
    }


# ------------------------------------------------
# AI JOB RECOMMENDATIONS FOR STUDENTS
# ------------------------------------------------

@router.get("/ai/recommendations")
def get_ai_recommended_opportunities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI-powered job & internship recommendation engine:
    Matches student's verified skills against active industry openings,
    computes fit score %, identifies missing skills, and highlights top matches.
    """
    from app.database.models import Student, StudentSkill, Application

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    student_skills_map = {}
    applied_opp_ids = set()

    if student:
        st_skills = db.query(StudentSkill).filter(StudentSkill.student_id == student.id).all()
        student_skills_map = {ss.skill_id: ss.score for ss in st_skills}

        apps = db.query(Application).filter(Application.student_id == student.id).all()
        applied_opp_ids = {a.opportunity_id for a in apps}

    opportunities = db.query(Opportunity).all()
    recommendations = []

    for opp in opportunities:
        ind = db.query(Industry).filter(Industry.id == opp.industry_id).first()
        opp_skills = db.query(OpportunitySkill).filter(OpportunitySkill.opportunity_id == opp.id).all()

        matching_skills = []
        missing_skills = []
        scores = []

        for req in opp_skills:
            sk = db.query(Skill).filter(Skill.id == req.skill_id).first()
            sk_name = sk.name if sk else "Technical Skill"
            st_score = student_skills_map.get(req.skill_id, 0.0)

            if st_score >= (req.required_level * 0.75):
                matching_skills.append({
                    "skill_name": sk_name,
                    "student_score": st_score,
                    "required_level": req.required_level
                })
            else:
                missing_skills.append({
                    "skill_name": sk_name,
                    "current_score": st_score,
                    "target_level": req.required_level,
                    "gap": max(0.0, req.required_level - st_score)
                })

            if req.required_level > 0:
                scores.append(min((st_score / req.required_level) * 100, 100))
            else:
                scores.append(100.0)

        if scores:
            match_score = round(sum(scores) / len(scores), 1)
        else:
            match_score = 80.0

        if match_score >= 80:
            fit_badge = "🌟 Top AI Match"
            fit_tier = "high"
        elif match_score >= 60:
            fit_badge = "⚡ Good Match"
            fit_tier = "medium"
        else:
            fit_badge = "📈 Skill Growth Opportunity"
            fit_tier = "growth"

        recommendations.append({
            "id": opp.id,
            "title": opp.title,
            "description": opp.description,
            "location": opp.location or "Hybrid / Remote",
            "opportunity_type": opp.opportunity_type or "Full-time",
            "company_name": ind.company_name if ind else "Industry Partner",
            "match_score": match_score,
            "fit_badge": fit_badge,
            "fit_tier": fit_tier,
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "has_applied": opp.id in applied_opp_ids,
            "required_skills_count": len(opp_skills)
        })

    # Sort opportunities by highest AI match score first
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations


# ------------------------------------------------
# STUDENT 1-CLICK APPLY
# ------------------------------------------------

@router.post("/{opportunity_id}/apply")
def apply_to_opportunity(
    opportunity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows student to apply to an industry opportunity in 1-click"""
    from app.database.models import Student, Application

    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can apply to opportunities"
        )

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    existing_app = db.query(Application).filter(
        Application.student_id == student.id,
        Application.opportunity_id == opportunity_id
    ).first()

    if existing_app:
        return {
            "message": "You have already applied for this position",
            "status": existing_app.status,
            "application_id": existing_app.id
        }

    new_app = Application(
        student_id=student.id,
        opportunity_id=opportunity_id,
        status="Applied"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    return {
        "message": f"Successfully applied for {opp.title}!",
        "status": "Applied",
        "application_id": new_app.id
    }


# ------------------------------------------------
# VIEW ALL OPPORTUNITIES
# ------------------------------------------------

@router.get("/", response_model=list[OpportunityResponse])
def get_opportunities(
    db: Session = Depends(get_db)
):

    opportunities = db.query(
        Opportunity
    ).order_by(
        Opportunity.id.desc()
    ).all()

    return opportunities


# ------------------------------------------------
# VIEW SINGLE OPPORTUNITY
# ------------------------------------------------

@router.get("/{opportunity_id}")
def get_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db)
):

    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id
    ).first()

    if not opportunity:
        raise HTTPException(
            status_code=404,
            detail="Opportunity not found"
        )

    skills = db.query(
        OpportunitySkill
    ).filter(
        OpportunitySkill.opportunity_id == opportunity_id
    ).all()

    return {
        "id": opportunity.id,
        "industry_id": opportunity.industry_id,
        "title": opportunity.title,
        "description": opportunity.description,
        "location": opportunity.location,
        "opportunity_type": opportunity.opportunity_type,
        "required_skills": [
            {
                "skill_id": item.skill_id,
                "required_level": item.required_level
            }
            for item in skills
        ]
    }