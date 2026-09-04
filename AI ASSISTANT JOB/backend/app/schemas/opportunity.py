from pydantic import BaseModel
from typing import Optional


class OpportunityCreate(BaseModel):
    title: str
    description: str
    location: Optional[str] = None
    opportunity_type: str


class OpportunityResponse(BaseModel):
    id: int
    industry_id: int
    title: str
    description: str
    location: Optional[str]
    opportunity_type: str

    class Config:
        from_attributes = True


class OpportunitySkillCreate(BaseModel):
    skill_id: int
    required_level: float


class ApplicationCreate(BaseModel):
    opportunity_id: int