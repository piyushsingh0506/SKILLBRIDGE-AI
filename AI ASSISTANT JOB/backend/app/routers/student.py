from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.database.models import (
    User,
    Student,
    Skill,
    StudentSkill,
    Application
)

from app.schemas.student import (
    StudentProfileCreate,
    StudentProfileUpdate,
    StudentProfileResponse,
    StudentSkillCreate,
    StudentSkillUpdate,
    StudentSkillResponse,
    SkillResponse,
    StudentDashboardResponse
)

from app.routers.auth import get_current_user


router = APIRouter(
    prefix="/students",
    tags=["Students"]
)


# =========================================================
# HELPER FUNCTION
# =========================================================

def check_student(
    current_user: User
):

    if current_user.role != "student":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this API"
        )


# =========================================================
# 1. CREATE STUDENT PROFILE
# =========================================================

@router.post(
    "/profile",
    response_model=StudentProfileResponse
)
def create_student_profile(

    data: StudentProfileCreate,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    check_student(current_user)


    # Check existing profile

    existing = (
        db.query(Student)
        .filter(
            Student.user_id == current_user.id
        )
        .first()
    )


    if existing:

        raise HTTPException(
            status_code=400,
            detail="Student profile already exists"
        )


    # Create student

    student = Student(

        user_id=current_user.id,

        college=data.college,

        degree=data.degree,

        branch=data.branch,

        graduation_year=data.graduation_year,

        career_goal=data.career_goal

    )


    db.add(student)

    db.commit()

    db.refresh(student)


    return student


# =========================================================
# 2. GET STUDENT PROFILE
# =========================================================

@router.get(
    "/profile",
    response_model=StudentProfileResponse
)
def get_student_profile(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    check_student(current_user)


    student = (
        db.query(Student)
        .filter(
            Student.user_id == current_user.id
        )
        .first()
    )


    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )


    return student


# =========================================================
# 3. UPDATE STUDENT PROFILE
# =========================================================

@router.put(
    "/profile",
    response_model=StudentProfileResponse
)
def update_student_profile(

    data: StudentProfileUpdate,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    check_student(current_user)


    student = (
        db.query(Student)
        .filter(
            Student.user_id == current_user.id
        )
        .first()
    )


    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )


    if data.college is not None:

        student.college = data.college


    if data.degree is not None:

        student.degree = data.degree


    if data.branch is not None:

        student.branch = data.branch


    if data.graduation_year is not None:

        student.graduation_year = data.graduation_year


    if data.career_goal is not None:

        student.career_goal = data.career_goal


    db.commit()

    db.refresh(student)


    return student


# =========================================================
# 4. DELETE STUDENT PROFILE
# =========================================================

@router.delete(
    "/profile"
)
def delete_student_profile(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    check_student(current_user)


    student = (
        db.query(Student)
        .filter(
            Student.user_id == current_user.id
        )
        .first()
    )


    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )


    db.delete(student)

    db.commit()


    return {

        "message": "Student profile deleted successfully"

    }


# =========================================================
# 5. GET ALL AVAILABLE SKILLS
# =========================================================

@router.get(
    "/available-skills",
    response_model=list[SkillResponse]
)
def get_available_skills(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    check_student(current_user)


    skills = (
        db.query(Skill)
        .order_by(Skill.name)
        .all()
    )


    return skills


# =========================================================
# 6. ADD STUDENT SKILL
# =========================================================

@router.post(
    "/skills",
    response_model=StudentSkillResponse
)
def add_student_skill(

    data: StudentSkillCreate,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    check_student(current_user)


    # Find student

    student = (
        db.query(Student)
        .filter(
            Student.user_id == current_user.id
        )
        .first()
    )


    if not student:

        raise HTTPException(
            status_code=404,
            detail="Create student profile first"
        )


    # Validate score

    if data.score < 0 or data.score > 100:

        raise HTTPException(
            status_code=400,
            detail="Skill score must be between 0 and 100"
        )


    # Check skill exists

    skill = (
        db.query(Skill)
        .filter(
            Skill.id == data.skill_id
        )
        .first()
    )


    if not skill:

        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )


    # Check duplicate skill

    existing = (
        db.query(StudentSkill)
        .filter(
            StudentSkill.student_id == student.id,
            StudentSkill.skill_id == data.skill_id
        )
        .first()
    )


    if existing:

        raise HTTPException(
            status_code=400,
            detail="Student already has this skill"
        )


    # Create skill

    student_skill = StudentSkill(

        student_id=student.id,

        skill_id=data.skill_id,

        score=data.score

    )


    db.add(student_skill)

    db.commit()

    db.refresh(student_skill)


    return student_skill


# =========================================================
# 7. GET STUDENT SKILLS
# =========================================================

@router.get(
    "/skills",
    response_model=list[StudentSkillResponse]
)
def get_student_skills(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    check_student(current_user)


    student = (
        db.query(Student)
        .filter(
            Student.user_id == current_user.id
        )
        .first()
    )


    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )


    skills = (
        db.query(StudentSkill)
        .filter(
            StudentSkill.student_id == student.id
        )
        .all()
    )


    return skills


# =========================================================
# 8. UPDATE STUDENT SKILL
# =========================================================

@router.put(
    "/skills/{skill_id}",
    response_model=StudentSkillResponse
)
def update_student_skill(

    skill_id: int,

    data: StudentSkillUpdate,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    check_student(current_user)


    if data.score < 0 or data.score > 100:

        raise HTTPException(
            status_code=400,
            detail="Skill score must be between 0 and 100"
        )


    student = (
        db.query(Student)
        .filter(
            Student.user_id == current_user.id
        )
        .first()
    )


    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )


    student_skill = (
        db.query(StudentSkill)
        .filter(
            StudentSkill.id == skill_id,
            StudentSkill.student_id == student.id
        )
        .first()
    )


    if not student_skill:

        raise HTTPException(
            status_code=404,
            detail="Student skill not found"
        )


    student_skill.score = data.score


    db.commit()

    db.refresh(student_skill)


    return student_skill


# =========================================================
# 9. DELETE STUDENT SKILL
# =========================================================

@router.delete(
    "/skills/{skill_id}"
)
def delete_student_skill(

    skill_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    check_student(current_user)


    student = (
        db.query(Student)
        .filter(
            Student.user_id == current_user.id
        )
        .first()
    )


    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )


    student_skill = (
        db.query(StudentSkill)
        .filter(
            StudentSkill.id == skill_id,
            StudentSkill.student_id == student.id
        )
        .first()
    )


    if not student_skill:

        raise HTTPException(
            status_code=404,
            detail="Student skill not found"
        )


    db.delete(student_skill)

    db.commit()


    return {

        "message": "Student skill deleted successfully"

    }


# =========================================================
# 10. STUDENT DASHBOARD
# =========================================================

@router.get(
    "/dashboard",
    response_model=StudentDashboardResponse
)
def student_dashboard(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db)

):

    check_student(current_user)


    student = (
        db.query(Student)
        .filter(
            Student.user_id == current_user.id
        )
        .first()
    )


    if not student:

        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )


    # -----------------------------
    # Skills
    # -----------------------------

    skills = (
        db.query(StudentSkill)
        .filter(
            StudentSkill.student_id == student.id
        )
        .all()
    )


    total_skills = len(skills)


    if total_skills > 0:

        average_score = (
            sum(skill.score for skill in skills)
            / total_skills
        )

    else:

        average_score = 0


    # -----------------------------
    # Applications
    # -----------------------------

    applications = (
        db.query(Application)
        .filter(
            Application.student_id == student.id
        )
        .all()
    )


    total_applications = len(applications)


    applied = sum(
        1
        for application in applications
        if application.status.lower() == "applied"
    )


    shortlisted = sum(
        1
        for application in applications
        if application.status.lower() == "shortlisted"
    )


    selected = sum(
        1
        for application in applications
        if application.status.lower() == "selected"
    )


    return {

        "student_id": student.id,

        "name": current_user.name,

        "email": current_user.email,

        "career_goal": student.career_goal,

        "total_skills": total_skills,

        "average_skill_score": round(
            average_score,
            2
        ),

        "total_applications": total_applications,

        "applied": applied,

        "shortlisted": shortlisted,

        "selected": selected

    }