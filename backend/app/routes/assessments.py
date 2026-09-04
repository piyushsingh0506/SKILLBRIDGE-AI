import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database.session import get_db
from app.models.models import (
    User, StudentProfile, SkillAssessment, AssessmentQuestion, AssessmentResult, StudentSkill, Skill
)
from app.schemas.ai import (
    QuestionOption, AssessmentSubmitRequest, AssessmentResultResponse
)
from app.core.security import get_current_user
from app.ai.skill_extractor import normalize_skill

router = APIRouter(prefix="/api/assessments", tags=["Skill Assessment Engine"])

@router.get("")
def list_assessments(db: Session = Depends(get_db)):
    assessments = db.query(SkillAssessment).all()
    return [
        {
            "id": a.id,
            "title": a.title,
            "category": a.category,
            "description": a.description,
            "duration_minutes": a.duration_minutes,
            "total_questions": len(a.questions) if a.questions else a.total_questions
        }
        for a in assessments
    ]

@router.get("/{id}/questions")
def get_assessment_questions(id: int, db: Session = Depends(get_db)):
    assessment = db.query(SkillAssessment).filter(SkillAssessment.id == id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    return {
        "assessment_id": assessment.id,
        "title": assessment.title,
        "category": assessment.category,
        "duration_minutes": assessment.duration_minutes,
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "category": assessment.category,
                "difficulty": q.difficulty,
                "skill_name": q.skill_name,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d
            }
            for q in assessment.questions
        ]
    }

@router.post("/submit", response_model=AssessmentResultResponse)
def submit_assessment(
    req: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Only students can submit assessments")
        
    sp = current_user.student_profile
    assessment = db.query(SkillAssessment).filter(SkillAssessment.id == req.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    questions = assessment.questions
    if not questions:
        raise HTTPException(status_code=400, detail="No questions configured for this assessment")
        
    correct_count = 0
    total_q = len(questions)
    skill_performance = {} # skill_name -> {"correct": int, "total": int}
    
    for q in questions:
        user_ans = req.answers.get(str(q.id), "").upper().strip()
        skill_n = normalize_skill(q.skill_name or "General")
        
        if skill_n not in skill_performance:
            skill_performance[skill_n] = {"correct": 0, "total": 0}
        skill_performance[skill_n]["total"] += 1
        
        if user_ans == q.correct_option.upper().strip():
            correct_count += 1
            skill_performance[skill_n]["correct"] += 1
            
    final_score_pct = round((correct_count / max(total_q, 1)) * 100.0, 1)
    
    # Save result record
    category_breakdown = {
        s: round((data["correct"] / max(data["total"], 1)) * 100.0, 1)
        for s, data in skill_performance.items()
    }
    
    res = AssessmentResult(
        student_id=sp.id,
        assessment_id=assessment.id,
        score=final_score_pct,
        total_questions=total_q,
        correct_answers=correct_count,
        category_breakdown=json.dumps(category_breakdown),
        answers_json=json.dumps(req.answers)
    )
    db.add(res)
    
    # Update StudentSkills with verified scores
    for skill_name, perf in skill_performance.items():
        sk_pct = round((perf["correct"] / max(perf["total"], 1)) * 100.0, 1)
        skill_obj = db.query(Skill).filter(Skill.name == skill_name).first()
        if not skill_obj:
            skill_obj = Skill(name=skill_name, category=assessment.category, demand_level="High")
            db.add(skill_obj)
            db.commit()
            db.refresh(skill_obj)
            
        student_skill = db.query(StudentSkill).filter(
            StudentSkill.student_id == sp.id,
            StudentSkill.skill_id == skill_obj.id
        ).first()
        
        if student_skill:
            # Weighted update with previous score
            student_skill.score = round(student_skill.score * 0.3 + sk_pct * 0.7, 1)
            student_skill.verified = True
            student_skill.source = "Assessment"
            if student_skill.score >= 85:
                student_skill.proficiency_level = "Expert"
            elif student_skill.score >= 70:
                student_skill.proficiency_level = "Advanced"
            elif student_skill.score >= 50:
                student_skill.proficiency_level = "Intermediate"
            else:
                student_skill.proficiency_level = "Beginner"
        else:
            student_skill = StudentSkill(
                student_id=sp.id,
                skill_id=skill_obj.id,
                proficiency_level="Advanced" if sk_pct >= 70 else "Intermediate",
                score=sk_pct,
                verified=True,
                source="Assessment"
            )
            db.add(student_skill)
            
    # Recalculate student overall profile metrics
    db.commit()
    all_stud_skills = db.query(StudentSkill).filter(StudentSkill.student_id == sp.id).all()
    if all_stud_skills:
        tech_skills = [s.score for s in all_stud_skills if s.skill and s.skill.category in ["Technical", "Domain/Ayush"]]
        soft_skills = [s.score for s in all_stud_skills if s.skill and s.skill.category in ["Soft", "Aptitude"]]
        
        sp.overall_skill_score = round(sum(s.score for s in all_stud_skills) / len(all_stud_skills), 1)
        if tech_skills:
            sp.technical_score = round(sum(tech_skills) / len(tech_skills), 1)
        if soft_skills:
            sp.soft_score = round(sum(soft_skills) / len(soft_skills), 1)
            
        sp.placement_readiness_score = round(sp.overall_skill_score * 0.65 + (sp.cgpa * 10) * 0.35, 1)
        db.commit()

    feedback = "Outstanding performance! Your verified skill badges have been updated." if final_score_pct >= 80 else (
        "Good effort! Review the weak areas and explore recommended learning courses to boost your match score."
    )

    return {
        "score": final_score_pct,
        "total_questions": total_q,
        "correct_answers": correct_count,
        "category_breakdown": category_breakdown,
        "feedback": feedback,
        "updated_overall_score": sp.overall_skill_score,
        "updated_technical_score": sp.technical_score,
        "updated_soft_score": sp.soft_score
    }

@router.get("/results/history")
def get_assessment_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.student_profile:
        return []
    sp = current_user.student_profile
    results = db.query(AssessmentResult).filter(AssessmentResult.student_id == sp.id).order_by(AssessmentResult.completed_at.desc()).all()
    return [
        {
            "id": r.id,
            "assessment_title": r.assessment.title if r.assessment else "Assessment",
            "category": r.assessment.category if r.assessment else "General",
            "score": r.score,
            "total_questions": r.total_questions,
            "correct_answers": r.correct_answers,
            "category_breakdown": json.loads(r.category_breakdown) if r.category_breakdown else {},
            "completed_at": r.completed_at
        }
        for r in results
    ]
