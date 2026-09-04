from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.database.models import (
    User,
    Student,
    Skill,
    StudentSkill,
    CareerRequiredSkill
)
from app.routers.auth import get_current_user
from app.schemas.skill_gap import SkillGapResponse


router = APIRouter(
    prefix="/skill-gap",
    tags=["Skill Gap Analysis"]
)


@router.get("/analysis", response_model=SkillGapResponse)
def skill_gap_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Only students can use this API
    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Only students can access skill gap analysis"
        )

    # Find student
    student = db.query(Student).filter(
        Student.user_id == current_user.id
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    # Career goal
    career_goal = student.career_goal

    if not career_goal:
        raise HTTPException(
            status_code=400,
            detail="Please set your career goal first"
        )

    # Find required skills
    required_skills = db.query(
    CareerRequiredSkill
    ).filter(
    func.lower(func.trim(CareerRequiredSkill.career_goal))
    == func.lower(func.trim(career_goal))
    ).all()
    strong_skills = []
    skill_gaps = []

    total_score = 0

    for required in required_skills:

        skill = db.query(Skill).filter(
            Skill.id == required.skill_id
        ).first()

        if not skill:
            continue

        student_skill = db.query(StudentSkill).filter(
            StudentSkill.student_id == student.id,
            StudentSkill.skill_id == required.skill_id
        ).first()

        if student_skill:
            student_score = student_skill.score
        else:
            student_score = 0

        required_score = required.required_level

        gap = max(required_score - student_score, 0)

        total_score += min(
            student_score / required_score * 100,
            100
        )

        if student_score >= required_score:
            status = "Strong"
            strong_skills.append({
                "skill_id": skill.id,
                "skill_name": skill.name,
                "student_score": student_score,
                "required_score": required_score,
                "gap": 0,
                "status": status
            })

        else:
            status = "Needs Improvement"
            skill_gaps.append({
                "skill_id": skill.id,
                "skill_name": skill.name,
                "student_score": student_score,
                "required_score": required_score,
                "gap": gap,
                "status": status
            })

    total_required = len(required_skills)

    if total_required > 0:
        match_score = total_score / total_required
    else:
        match_score = 0

    # Recommendations
    recommendations = []

    for gap in skill_gaps:
        recommendations.append(
            f"Improve {gap['skill_name']} from "
            f"{gap['student_score']}% to "
            f"{gap['required_score']}%"
        )

    return {
        "career_goal": career_goal,
        "match_score": round(match_score, 2),
        "total_required_skills": total_required,
        "strong_skills": strong_skills,
        "skill_gaps": skill_gaps,
        "recommendations": recommendations
    }