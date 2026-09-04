from pydantic import BaseModel
from typing import List


class SkillGapItem(BaseModel):
    skill_id: int
    skill_name: str
    student_score: float
    required_score: float
    gap: float
    status: str


class SkillGapResponse(BaseModel):
    career_goal: str
    match_score: float
    total_required_skills: int
    strong_skills: List[SkillGapItem]
    skill_gaps: List[SkillGapItem]
    recommendations: List[str]