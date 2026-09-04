from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class PartnershipCreate(BaseModel):
    institution_id: Optional[int] = None
    industry_id: Optional[int] = None
    title: str
    partnership_type: str = "MOU"
    description: Optional[str] = None


class PartnershipStatusUpdate(BaseModel):
    status: str


class PartnershipResponse(BaseModel):
    id: int
    institution_id: int
    institution_name: Optional[str] = None
    industry_id: int
    company_name: Optional[str] = None
    title: str
    partnership_type: str
    description: Optional[str] = None
    status: str
    established_date: Optional[str] = None
    initiated_by: Optional[str] = "industry"

    class Config:
        from_attributes = True


class CampusDriveCreate(BaseModel):
    institution_id: Optional[int] = None
    title: str
    job_role: str
    package_or_stipend: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    event_date: Optional[str] = None
    mode: Optional[str] = "Hybrid"


class CampusDriveResponse(BaseModel):
    id: int
    industry_id: int
    company_name: Optional[str] = None
    institution_id: Optional[int] = None
    institution_name: Optional[str] = None
    title: str
    job_role: str
    package_or_stipend: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    event_date: Optional[str] = None
    mode: str
    status: str

    class Config:
        from_attributes = True


class InstitutionProfileUpdate(BaseModel):
    institution_name: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    accreditation: Optional[str] = None
    code: Optional[str] = None


class InstitutionAnalyticsResponse(BaseModel):
    institution_name: str
    total_students: int
    avg_readiness_score: float
    active_mous: int
    upcoming_drives: int
    top_career_goals: List[Dict[str, Any]]
    skill_averages: List[Dict[str, Any]]


class StudentRosterItem(BaseModel):
    id: int
    name: str
    email: str
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    career_goal: Optional[str] = None
    avg_score: float
    skills_count: int


class ApplicationStatusUpdate(BaseModel):
    status: str


class CandidateApplicationResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    student_email: str
    college: Optional[str] = None
    career_goal: Optional[str] = None
    opportunity_id: int
    opportunity_title: str
    status: str
    match_score: float
    student_skills: List[Dict[str, Any]]
