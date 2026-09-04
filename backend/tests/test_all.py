import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import SessionLocal, Base, engine
from app.models.models import User, StudentProfile, Skill, CareerRole, Internship, Job
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.ai.skill_extractor import normalize_skill, extract_skills_from_text
from app.ai.skill_gap import analyze_skill_gap
from app.ai.matcher import calculate_compatibility
from app.ai.resume_analyzer import analyze_resume
from app.ai.career_predictor import predict_career_paths

def test_password_hashing():
    pw = "secretpassword123"
    hashed = get_password_hash(pw)
    assert verify_password(pw, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_jwt_token_generation():
    token = create_access_token(data={"sub": "1", "role": "student", "email": "test@aiia.gov.in"})
    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == "1"
    assert payload.get("role") == "student"

def test_skill_extraction_and_normalization():
    text = "Candidate has hands-on proficiency with Python, SQL, ReactJS, Machine Learning, and AYUSH Health Informatics."
    skills = extract_skills_from_text(text)
    assert "Python" in skills
    assert "SQL" in skills
    assert "React" in skills
    assert "Machine Learning" in skills
    assert "AYUSH Health Informatics" in skills

def test_ai_skill_gap_analysis():
    student_skills = [
        {"name": "Python", "score": 85.0, "category": "Technical"},
        {"name": "SQL", "score": 80.0, "category": "Technical"}
    ]
    gap_result = analyze_skill_gap(student_skills, "Data Analyst")
    assert gap_result["target_role"] == "Data Analyst"
    assert gap_result["compatibility_score"] > 0
    # Power BI and Applied Statistics should be detected as missing
    missing = [m["skill"] for m in gap_result["missing_skills"]]
    assert "Power BI" in missing
    assert "Applied Statistics" in missing
    assert len(gap_result["action_plan"]) > 0

def test_7_factor_matching_algorithm():
    student_profile = {
        "skills": [
            {"name": "Python", "score": 90.0},
            {"name": "SQL", "score": 85.0},
            {"name": "AYUSH Health Informatics", "score": 88.0}
        ],
        "soft_score": 80.0,
        "cgpa": 8.8,
        "certifications": [{"title": "GCP Certified"}],
        "projects": [{"title": "AyurAnalytics Portal"}, {"title": "Clinical AI"}],
        "career_interest": "Data Analyst",
        "preferred_locations": "New Delhi, Remote"
    }

    opportunity = {
        "title": "Ayurvedic Healthcare Data Analyst",
        "description": "Healthcare data analysis and clinical trials",
        "required_skills": "Python, SQL, AYUSH Health Informatics",
        "preferred_skills": "Power BI",
        "location": "New Delhi / Remote",
        "work_mode": "Hybrid"
    }

    compat = calculate_compatibility(student_profile, opportunity)
    assert compat["compatibility_score"] >= 80.0
    assert "technical_skills" in compat["breakdown"]
    assert "qualification" in compat["breakdown"]
    assert len(compat["reasons"]) > 0

def test_resume_ats_analyzer():
    sample_resume = """
    Aarav Sharma
    Email: aarav@aiia.gov.in
    Education: B.Tech in Healthcare Data Analytics with 8.8 CGPA
    Skills: Python, SQL, Machine Learning, Power BI, Statistics, Clinical Trials & GCP.
    Experience: Developed predictive algorithms and engineered interactive health analytics dashboards.
    """
    analysis = analyze_resume(sample_resume, "Data Analyst")
    assert analysis["ats_score"] >= 75.0
    assert "Python" in analysis["extracted_skills"]
    assert len(analysis["strengths"]) > 0
    assert len(analysis["improvement_suggestions"]) > 0

def test_career_predictor():
    skills = [
        {"name": "Python", "score": 90.0},
        {"name": "Machine Learning", "score": 88.0},
        {"name": "Deep Learning", "score": 85.0},
        {"name": "PyTorch", "score": 82.0},
        {"name": "Docker", "score": 80.0},
        {"name": "REST APIs", "score": 85.0}
    ]
    predictions = predict_career_paths(skills, "ML Engineer")
    assert len(predictions) > 0
    top_career = predictions[0]
    assert top_career["compatibility_score"] >= 70.0

if __name__ == "__main__":
    print("[*] Running test suite...")
    test_password_hashing()
    print("[OK] test_password_hashing passed")
    test_jwt_token_generation()
    print("[OK] test_jwt_token_generation passed")
    test_skill_extraction_and_normalization()
    print("[OK] test_skill_extraction_and_normalization passed")
    test_ai_skill_gap_analysis()
    print("[OK] test_ai_skill_gap_analysis passed")
    test_7_factor_matching_algorithm()
    print("[OK] test_7_factor_matching_algorithm passed")
    test_resume_ats_analyzer()
    print("[OK] test_resume_ats_analyzer passed")
    test_career_predictor()
    print("[OK] test_career_predictor passed")
    print("\n[SUCCESS] ALL 7 AUTOMATED BACKEND & AI TESTS PASSED PERFECTLY!")
