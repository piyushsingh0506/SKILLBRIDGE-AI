from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class InternshipCreate(BaseModel):
    title: str
    description: str
    required_skills: str # comma-separated
    preferred_skills: Optional[str] = ""
    stipend: Optional[str] = "₹20,000/month"
    duration_months: Optional[int] = 3
    location: Optional[str] = "New Delhi / Remote"
    work_mode: Optional[str] = "Hybrid"
    openings: Optional[int] = 2
    deadline: Optional[str] = "2026-10-30"

class InternshipResponse(InternshipCreate):
    id: int
    industry_id: int
    company_name: Optional[str] = ""
    company_logo: Optional[str] = None
    is_active: bool
    created_at: datetime
    match_score: Optional[float] = None
    match_reasons: Optional[List[str]] = []

    class Config:
        from_attributes = True

class JobCreate(BaseModel):
    title: str
    description: str
    required_skills: str
    preferred_skills: Optional[str] = ""
    salary_range: Optional[str] = "₹8 - 14 LPA"
    experience_years: Optional[str] = "0-2 Years"
    qualification: Optional[str] = "B.Tech / BAMS / MCA"
    location: Optional[str] = "Bengaluru / Remote"
    job_type: Optional[str] = "Full-time"
    work_mode: Optional[str] = "Hybrid"
    openings: Optional[int] = 2
    deadline: Optional[str] = "2026-11-15"

class JobResponse(JobCreate):
    id: int
    industry_id: int
    company_name: Optional[str] = ""
    company_logo: Optional[str] = None
    is_active: bool
    created_at: datetime
    match_score: Optional[float] = None
    match_reasons: Optional[List[str]] = []

    class Config:
        from_attributes = True

class ApplicationCreate(BaseModel):
    opportunity_type: str # "internship" or "job"
    opportunity_id: int
    cover_note: Optional[str] = ""

class ApplicationStatusUpdate(BaseModel):
    status: str # Applied, Under Review, Shortlisted, Interview, Selected, Rejected
    interview_date: Optional[str] = None
    interview_link: Optional[str] = None
    feedback: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    opportunity_type: str
    opportunity_id: int
    opportunity_title: Optional[str] = ""
    company_name: Optional[str] = ""
    company_logo: Optional[str] = None
    student_id: int
    student_name: Optional[str] = ""
    student_email: Optional[str] = ""
    student_college: Optional[str] = ""
    student_branch: Optional[str] = ""
    match_score: float
    status: str
    cover_note: Optional[str] = ""
    interview_date: Optional[str] = None
    interview_link: Optional[str] = None
    feedback: Optional[str] = None
    applied_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CandidateMatchItem(BaseModel):
    student_id: int
    user_id: int
    full_name: str
    email: str
    avatar: Optional[str] = None
    college: str
    course: str
    branch: str
    cgpa: float
    graduation_year: int
    compatibility_score: float # 0 to 100
    technical_match: float
    soft_match: float
    qualification_match: float
    certifications_match: float
    projects_match: float
    interest_match: float
    location_match: float
    top_skills: List[str]
    projects_count: int
    certifications_count: int
    placement_ready: bool
    status: Optional[str] = "Not Contacted"
