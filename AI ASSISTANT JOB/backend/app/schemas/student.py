from pydantic import BaseModel
from typing import Optional


# =========================================================
# STUDENT PROFILE
# =========================================================

class StudentProfileCreate(BaseModel):

    college: str

    degree: str

    branch: str

    graduation_year: int

    career_goal: str


class StudentProfileUpdate(BaseModel):

    college: Optional[str] = None

    degree: Optional[str] = None

    branch: Optional[str] = None

    graduation_year: Optional[int] = None

    career_goal: Optional[str] = None


class StudentProfileResponse(BaseModel):

    id: int

    user_id: int

    college: Optional[str] = None

    degree: Optional[str] = None

    branch: Optional[str] = None

    graduation_year: Optional[int] = None

    career_goal: Optional[str] = None

    class Config:
        from_attributes = True


# =========================================================
# STUDENT SKILL
# =========================================================

class StudentSkillCreate(BaseModel):

    skill_id: int

    score: float


class StudentSkillUpdate(BaseModel):

    score: float


class StudentSkillResponse(BaseModel):

    id: int

    student_id: int

    skill_id: int

    score: float

    class Config:
        from_attributes = True


# =========================================================
# AVAILABLE SKILL
# =========================================================

class SkillResponse(BaseModel):

    id: int

    name: str

    class Config:
        from_attributes = True


# =========================================================
# DASHBOARD
# =========================================================

class StudentDashboardResponse(BaseModel):

    student_id: int

    name: str

    email: str

    career_goal: Optional[str] = None

    total_skills: int

    average_skill_score: float

    total_applications: int

    applied: int

    shortlisted: int

    selected: int