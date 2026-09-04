from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class QuestionOption(BaseModel):
    id: int
    question_text: str
    category: str
    difficulty: str
    skill_name: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str

class AssessmentSubmitRequest(BaseModel):
    assessment_id: int
    answers: Dict[str, str] # question_id (as str): selected_option ('A', 'B', 'C', 'D')

class AssessmentResultResponse(BaseModel):
    score: float
    total_questions: int
    correct_answers: int
    category_breakdown: Dict[str, float]
    feedback: str
    updated_overall_score: float
    updated_technical_score: float
    updated_soft_score: float

class SkillGapItem(BaseModel):
    skill: str
    category: str
    priority: str # High, Medium, Low
    current_score: float # 0 if missing
    required_score: float # Target
    importance: str # Required, Preferred
    learning_recommendation: Optional[str] = None

class SkillGapResponse(BaseModel):
    career_role: str
    target_role_id: Optional[int] = None
    compatibility_score: float # 0 to 100
    strong_skills: List[Dict[str, Any]]
    weak_skills: List[Dict[str, Any]]
    missing_skills: List[Dict[str, Any]]
    action_plan: List[str]
    recommended_courses: List[Dict[str, Any]]
    recommended_projects: List[str]

class ResumeAnalysisRequest(BaseModel):
    resume_text: Optional[str] = None
    target_role: Optional[str] = "Data Analyst"

class ResumeAnalysisResponse(BaseModel):
    ats_score: float # 0 to 100
    target_role: str
    extracted_skills: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    experience_years_detected: float
    education_detected: List[str]
    strengths: List[str]
    improvement_suggestions: List[str]
    recommended_roles: List[str]

class CareerRecommendationItem(BaseModel):
    role_id: int
    title: str
    category: str
    compatibility_score: float
    average_salary: str
    growth_rate: str
    matching_skills: List[str]
    missing_skills: List[str]
    roadmap: List[str]

class AIMentorChatRequest(BaseModel):
    message: str
    chat_history: Optional[List[Dict[str, str]]] = []

class AIMentorChatResponse(BaseModel):
    reply: str
    suggested_actions: List[str]
    suggested_questions: List[str]
    context_used: Optional[Dict[str, Any]] = None
