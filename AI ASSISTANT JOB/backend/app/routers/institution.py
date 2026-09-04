from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.database.models import (
    User,
    Institution,
    Student,
    StudentSkill,
    Skill,
    Partnership,
    CampusDrive
)
from app.schemas.connect import (
    InstitutionProfileUpdate,
    InstitutionAnalyticsResponse,
    StudentRosterItem
)
from app.routers.auth import get_current_user


router = APIRouter(
    prefix="/institutions",
    tags=["Institutions"]
)


def get_current_institution(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Institution:
    if current_user.role not in ["institution", "academician"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only institutions or academicians can access this portal"
        )
    inst = db.query(Institution).filter(Institution.user_id == current_user.id).first()
    if not inst:
        # Auto-create fallback profile if missing
        inst = Institution(
            user_id=current_user.id,
            institution_name=current_user.name or "Partner Institution",
            location="India"
        )
        db.add(inst)
        db.commit()
        db.refresh(inst)
    return inst


@router.get("/profile")
def get_institution_profile(
    inst: Institution = Depends(get_current_institution),
    db: Session = Depends(get_db)
):
    return {
        "id": inst.id,
        "user_id": inst.user_id,
        "institution_name": inst.institution_name,
        "location": inst.location,
        "website": inst.website,
        "contact_email": inst.contact_email or (inst.user.email if inst.user else None),
        "accreditation": inst.accreditation or "AICTE / UGC Recognized",
        "code": inst.code or "INST-2026"
    }


@router.put("/profile")
def update_institution_profile(
    data: InstitutionProfileUpdate,
    inst: Institution = Depends(get_current_institution),
    db: Session = Depends(get_db)
):
    if data.institution_name:
        inst.institution_name = data.institution_name
    if data.location:
        inst.location = data.location
    if data.website:
        inst.website = data.website
    if data.contact_email:
        inst.contact_email = data.contact_email
    if data.accreditation:
        inst.accreditation = data.accreditation
    if data.code:
        inst.code = data.code

    db.commit()
    db.refresh(inst)
    return {"message": "Institution profile updated successfully", "institution": inst.institution_name}


@router.get("/analytics", response_model=InstitutionAnalyticsResponse)
def get_institution_analytics(
    inst: Institution = Depends(get_current_institution),
    db: Session = Depends(get_db)
):
    # Match students by college name (case-insensitive or partial match)
    students = db.query(Student).all()
    inst_name_lower = (inst.institution_name or "").lower().strip()

    cohort_students = [
        s for s in students
        if s.college and (inst_name_lower in s.college.lower() or s.college.lower() in inst_name_lower or inst_name_lower == "")
    ]
    if not cohort_students and students:
        # Fallback to all students if single institution demo
        cohort_students = students

    total_students = len(cohort_students)
    student_ids = [s.id for s in cohort_students]

    # Calculate average skill score
    if student_ids:
        all_skills = db.query(StudentSkill).filter(StudentSkill.student_id.in_(student_ids)).all()
        avg_score = (sum(sk.score for sk in all_skills) / len(all_skills)) if all_skills else 0.0
    else:
        all_skills = []
        avg_score = 0.0

    # Career goal distribution
    goal_counts: Dict[str, int] = {}
    for s in cohort_students:
        goal = s.career_goal or "AI Engineer"
        goal_counts[goal] = goal_counts.get(goal, 0) + 1

    top_goals = [
        {"career_goal": k, "count": v, "percentage": round((v / total_students) * 100, 1) if total_students else 0}
        for k, v in sorted(goal_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    # Skill score distribution
    skill_totals: Dict[str, List[float]] = {}
    for sk in all_skills:
        skill_obj = db.query(Skill).filter(Skill.id == sk.skill_id).first()
        if skill_obj:
            skill_totals.setdefault(skill_obj.name, []).append(sk.score)

    skill_averages = [
        {"skill_name": k, "average_score": round(sum(v) / len(v), 1), "students_count": len(v)}
        for k, v in skill_totals.items()
    ]
    skill_averages.sort(key=lambda x: x["average_score"], reverse=True)

    # Partnerships & Drives count
    active_mous = db.query(Partnership).filter(
        Partnership.institution_id == inst.id,
        Partnership.status == "Active"
    ).count()

    upcoming_drives = db.query(CampusDrive).filter(
        (CampusDrive.institution_id == inst.id) | (CampusDrive.institution_id == None)
    ).count()

    return InstitutionAnalyticsResponse(
        institution_name=inst.institution_name or "Partner Institution",
        total_students=total_students,
        avg_readiness_score=round(avg_score, 1),
        active_mous=active_mous,
        upcoming_drives=upcoming_drives,
        top_career_goals=top_goals,
        skill_averages=skill_averages[:6]
    )


@router.get("/students", response_model=List[StudentRosterItem])
def get_institution_students(
    inst: Institution = Depends(get_current_institution),
    db: Session = Depends(get_db)
):
    students = db.query(Student).all()
    inst_name_lower = (inst.institution_name or "").lower().strip()

    cohort_students = [
        s for s in students
        if s.college and (inst_name_lower in s.college.lower() or s.college.lower() in inst_name_lower or inst_name_lower == "")
    ]
    if not cohort_students and students:
        cohort_students = students

    roster = []
    for s in cohort_students:
        user = db.query(User).filter(User.id == s.user_id).first()
        skills = db.query(StudentSkill).filter(StudentSkill.student_id == s.id).all()
        avg_score = (sum(sk.score for sk in skills) / len(skills)) if skills else 0.0

        roster.append(StudentRosterItem(
            id=s.id,
            name=user.name if user else "Student",
            email=user.email if user else "",
            branch=s.branch or "Computer Science",
            graduation_year=s.graduation_year or 2026,
            career_goal=s.career_goal or "AI Engineer",
            avg_score=round(avg_score, 1),
            skills_count=len(skills)
        ))

    return roster
