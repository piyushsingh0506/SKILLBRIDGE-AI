import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database.session import get_db
from app.models.models import (
    User, StudentProfile, StudentSkill, Skill, Course, CareerRole, Resume
)
from app.schemas.ai import (
    SkillGapResponse, ResumeAnalysisRequest, ResumeAnalysisResponse,
    CareerRecommendationItem, AIMentorChatRequest, AIMentorChatResponse
)
from app.core.security import get_current_user
from app.ai.skill_gap import analyze_skill_gap
from app.ai.career_predictor import predict_career_paths
from app.ai.resume_analyzer import analyze_resume, extract_text_from_pdf_bytes
from app.ai.career_mentor import get_mentor_response

router = APIRouter(prefix="/api/ai", tags=["AI Engine"])

@router.get("/skill-gap", response_model=SkillGapResponse)
def get_skill_gap_analysis(
    target_role: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes AI skill gap analysis against student's target role or specified career role.
    """
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Student profile required")
        
    sp = current_user.student_profile
    role_to_check = target_role or sp.career_interest or "Data Analyst"
    
    # Prepare student skills list
    student_skills_list = [
        {
            "name": s.skill.name if s.skill else "Skill",
            "score": s.score,
            "category": s.skill.category if s.skill else "Technical",
            "proficiency_level": s.proficiency_level,
            "verified": s.verified
        }
        for s in sp.skills
    ]
    
    gap_result = analyze_skill_gap(student_skills_list, role_to_check)
    
    # Fetch recommended courses for missing skills
    missing_names = [m["skill"] for m in gap_result.get("missing_skills", [])]
    courses_query = db.query(Course).all()
    
    recommended_courses = []
    for c in courses_query:
        if any(m.lower() in c.title.lower() or m.lower() in (c.mapped_skill or "").lower() for m in missing_names):
            recommended_courses.append({
                "id": c.id,
                "title": c.title,
                "provider": c.provider,
                "duration_hours": c.duration_hours,
                "rating": c.rating,
                "level": c.level,
                "url": c.url,
                "mapped_skill": c.mapped_skill
            })
            
    if not recommended_courses:
        # Provide top generic courses
        for c in courses_query[:4]:
            recommended_courses.append({
                "id": c.id,
                "title": c.title,
                "provider": c.provider,
                "duration_hours": c.duration_hours,
                "rating": c.rating,
                "level": c.level,
                "url": c.url,
                "mapped_skill": c.mapped_skill
            })
            
    # Sample recommended projects
    recommended_projects = [
        f"Build an end-to-end {role_to_check} Dashboard & Predictive Pipeline",
        "Ayurvedic Formulation Data Analysis and GCP Compliance Web App",
        "High-Throughput Clinical Trial Analytics with Interactive Visualization"
    ]

    return {
        "career_role": role_to_check,
        "target_role_id": sp.target_career_role_id or 1,
        "compatibility_score": gap_result["compatibility_score"],
        "strong_skills": gap_result["strong_skills"],
        "weak_skills": gap_result["weak_skills"],
        "missing_skills": gap_result["missing_skills"],
        "action_plan": gap_result["action_plan"],
        "recommended_courses": recommended_courses[:6],
        "recommended_projects": recommended_projects
    }

@router.get("/career-recommendations", response_model=List[CareerRecommendationItem])
def get_career_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates multi-path career trajectory recommendations based on student skills.
    """
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Student profile required")
        
    sp = current_user.student_profile
    student_skills_list = [
        {
            "name": s.skill.name if s.skill else "Skill",
            "score": s.score,
            "category": s.skill.category if s.skill else "Technical"
        }
        for s in sp.skills
    ]
    
    recommendations = predict_career_paths(student_skills_list, sp.career_interest or "")
    return recommendations

@router.post("/resume-analysis", response_model=ResumeAnalysisResponse)
async def analyze_student_resume(
    target_role: Optional[str] = Form("Data Analyst"),
    resume_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Parses PDF resume or plain text, evaluates ATS score, detects skills, and suggests improvements.
    """
    extracted_text = ""
    file_name = "resume.txt"
    
    if file:
        file_name = file.filename
        content = await file.read()
        if file.filename.lower().endswith(".pdf"):
            extracted_text = extract_text_from_pdf_bytes(content)
        else:
            extracted_text = content.decode("utf-8", errors="ignore")
    elif resume_text:
        extracted_text = resume_text
    else:
        # Default student mock text
        extracted_text = (
            f"Candidate: {current_user.full_name}\n"
            f"Skills: Python, SQL, Data Analysis, Machine Learning, Power BI, Statistics.\n"
            f"Education: B.Tech in Computer Science / Health Informatics with 8.6 CGPA.\n"
            f"Experience: Built automated predictive models and data visualization dashboards using FastAPI and React."
        )

    analysis = analyze_resume(extracted_text, target_role or "Data Analyst")
    
    # Save to database if student
    if current_user.student_profile:
        sp = current_user.student_profile
        resume_record = Resume(
            student_id=sp.id,
            file_name=file_name,
            file_text=extracted_text[:2000],
            parsed_skills=json.dumps(analysis["extracted_skills"]),
            ats_score=analysis["ats_score"],
            feedback=json.dumps(analysis["improvement_suggestions"]),
            target_role=target_role or "Data Analyst"
        )
        db.add(resume_record)
        db.commit()

    return analysis

@router.post("/mentor-chat", response_model=AIMentorChatResponse)
async def chat_with_career_mentor(
    req: AIMentorChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Conversational AI Career Mentor utilizing live student data.
    """
    profile_dict = {
        "full_name": current_user.full_name,
        "college": "All India Institute of Ayurveda / University",
        "career_interest": "Data Analyst",
        "overall_skill_score": 75.0,
        "cgpa": 8.5,
        "skills": []
    }
    
    skill_gap_data = None
    if current_user.student_profile:
        sp = current_user.student_profile
        profile_dict = {
            "full_name": current_user.full_name,
            "college": sp.college or "University",
            "career_interest": sp.career_interest or "Data Analyst",
            "overall_skill_score": sp.overall_skill_score,
            "cgpa": sp.cgpa,
            "skills": [{"name": s.skill.name} for s in sp.skills if s.skill]
        }
        # Run fast gap check
        stud_skills = [{"name": s.skill.name, "score": s.score} for s in sp.skills if s.skill]
        skill_gap_data = analyze_skill_gap(stud_skills, sp.career_interest or "Data Analyst")

    res = await get_mentor_response(
        message=req.message,
        student_profile=profile_dict,
        skill_gap_info=skill_gap_data,
        chat_history=req.chat_history
    )
    return res
