from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class SkillItem(BaseModel):
    id: Optional[int] = None
    name: str
    category: Optional[str] = "Technical"
    proficiency_level: Optional[str] = "Intermediate"
    score: Optional[float] = 75.0
    verified: Optional[bool] = False
    source: Optional[str] = "Self"

class StudentSkillCreate(BaseModel):
    skill_name: str
    category: Optional[str] = "Technical"
    proficiency_level: Optional[str] = "Intermediate"
    score: Optional[float] = 75.0
    source: Optional[str] = "Self"

class ProjectCreate(BaseModel):
    title: str
    description: str
    tech_stack: str
    github_url: Optional[str] = ""
    live_url: Optional[str] = ""
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""

class ProjectResponse(ProjectCreate):
    id: int
    student_id: int

    class Config:
        from_attributes = True

class CertificationCreate(BaseModel):
    title: str
    issuer: str
    issue_date: str
    expiry_date: Optional[str] = ""
    credential_url: Optional[str] = ""

class CertificationResponse(CertificationCreate):
    id: int
    student_id: int
    verified: bool

    class Config:
        from_attributes = True

class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    career_interest: Optional[str] = None
    preferred_roles: Optional[str] = None
    preferred_locations: Optional[str] = None
    bio: Optional[str] = None
    cgpa: Optional[float] = None
    target_career_role_id: Optional[int] = None

class StudentProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    avatar: Optional[str] = None
    college: str
    course: str
    branch: str
    graduation_year: int
    career_interest: str
    preferred_roles: Optional[str] = ""
    preferred_locations: Optional[str] = ""
    bio: Optional[str] = ""
    cgpa: float
    placement_ready: bool
    profile_completion: float
    overall_skill_score: float
    technical_score: float
    soft_score: float
    placement_readiness_score: float
    target_career_role_id: Optional[int] = None
    skills: List[SkillItem] = []
    projects: List[ProjectResponse] = []
    certifications: List[CertificationResponse] = []

    class Config:
        from_attributes = True
