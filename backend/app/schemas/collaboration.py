from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ResearchCollaborationCreate(BaseModel):
    title: str
    description: str
    domain: str
    budget: Optional[str] = "₹10,00,000"
    duration_months: Optional[int] = 6
    academician_id: Optional[int] = None

class ResearchCollaborationResponse(ResearchCollaborationCreate):
    id: int
    industry_id: int
    industry_name: Optional[str] = ""
    academician_name: Optional[str] = ""
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class MentorshipCreate(BaseModel):
    mentor_id: int
    topic: str
    notes: Optional[str] = ""

class MentorshipResponse(BaseModel):
    id: int
    mentor_id: int
    mentor_name: str
    mentor_role: str
    mentee_id: int
    mentee_name: str
    topic: str
    status: str
    scheduled_time: Optional[str] = None
    meeting_link: Optional[str] = None
    notes: Optional[str] = ""
    created_at: datetime

    class Config:
        from_attributes = True

class InstitutionAnalyticsResponse(BaseModel):
    total_students: int
    assessment_completion_rate: float
    average_skill_score: float
    placement_ready_students: int
    total_internships_active: int
    total_jobs_active: int
    total_applications_placed: int
    skill_gap_distribution: List[Dict[str, Any]]
    top_demanded_skills: List[Dict[str, Any]]
    department_skill_benchmark: List[Dict[str, Any]]
    placement_trend: List[Dict[str, Any]]
    industry_hiring_sectors: List[Dict[str, Any]]
