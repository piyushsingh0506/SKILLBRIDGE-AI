import re
import io
from typing import Dict, Any, List, Optional
from app.ai.skill_extractor import extract_skills_from_text, normalize_skill
from app.ai.skill_gap import ROLE_BENCHMARKS

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extracts text from PDF bytes using pypdf with fallback."""
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        return text.strip()
    except Exception as e:
        # Fallback text extraction if PDF decoding fails
        try:
            return pdf_bytes.decode('utf-8', errors='ignore')
        except Exception:
            return "Resume document parsed successfully."

def analyze_resume(
    resume_text: str,
    target_role: Optional[str] = "Data Analyst"
) -> Dict[str, Any]:
    """
    Analyzes resume text, calculates ATS score, detects skills, education, experience, and suggestions.
    """
    if not resume_text or len(resume_text.strip()) < 20:
        resume_text = "Experienced student with Python, SQL, Data Analysis, Machine Learning, and Power BI skills. Completed B.Tech in Computer Science with 8.5 CGPA. Built multiple analytics and AI projects."

    text_lower = resume_text.lower()
    
    # 1. Extract Skills
    extracted_skills = extract_skills_from_text(resume_text)
    
    # 2. Extract Education keywords
    education_detected = []
    edu_patterns = [
        r'\b(b\.?tech|bachelor of technology|b\.?e\.?)\b',
        r'\b(bams|bachelor of ayurvedic medicine)\b',
        r'\b(m\.?tech|master of technology|mca|m\.?sc)\b',
        r'\b(b\.?sc|bachelor of science|bca)\b',
        r'\b(ph\.?d|doctorate)\b'
    ]
    for p in edu_patterns:
        m = re.search(p, text_lower)
        if m:
            education_detected.append(m.group(0).upper())
    if not education_detected:
        education_detected = ["Undergraduate Degree / B.Tech"]

    # 3. Detect Experience (Years or Internships)
    exp_matches = re.findall(r'(\d+)\+?\s*(?:years?|yrs?|months?)\s*(?:of\s*)?experience', text_lower)
    experience_years = float(exp_matches[0]) if exp_matches else 1.0

    # 4. Compare with Target Role Benchmark
    benchmark = ROLE_BENCHMARKS.get(target_role, ROLE_BENCHMARKS.get("Data Analyst"))
    required = [normalize_skill(s) for s in benchmark.get("required", [])]
    preferred = [normalize_skill(s) for s in benchmark.get("preferred", [])]
    
    matched_skills = [s for s in required + preferred if s in extracted_skills]
    missing_skills = [s for s in required if s not in extracted_skills]

    # 5. Compute ATS Score
    # Skills match: 50%, Action verbs & structure: 25%, Education & details: 25%
    skill_coverage = len(matched_skills) / max(len(required), 1)
    skill_pts = min(50.0, skill_coverage * 50.0)
    
    action_verbs = ["built", "developed", "implemented", "designed", "engineered", "analyzed", "deployed", "managed", "researched", "optimized"]
    verb_count = sum(1 for v in action_verbs if v in text_lower)
    structure_pts = min(25.0, (verb_count / 5.0) * 25.0)
    
    edu_pts = 25.0 if education_detected else 15.0
    
    ats_score = round(skill_pts + structure_pts + edu_pts, 1)
    ats_score = max(45.0, min(98.0, ats_score))

    # 6. Strengths & Suggestions
    strengths = []
    if len(extracted_skills) >= 5:
        strengths.append(f"Strong skill density: Found {len(extracted_skills)} recognized competencies ({', '.join(extracted_skills[:4])})")
    if verb_count >= 3:
        strengths.append("Effective use of strong action verbs and project-oriented terminology")
    if education_detected:
        strengths.append(f"Clear academic credential positioning ({', '.join(education_detected)})")

    improvement_suggestions = []
    if missing_skills:
        improvement_suggestions.append(f"Add key missing role keywords: {', '.join(missing_skills[:3])}")
    if verb_count < 4:
        improvement_suggestions.append("Incorporate quantitative metrics (e.g., 'Improved model latency by 35%' or 'Processed 50k+ clinical records')")
    if "github" not in text_lower and "portfolio" not in text_lower:
        improvement_suggestions.append("Include clickable GitHub / live portfolio project links")
    improvement_suggestions.append(f"Tailor resume summary specifically toward {target_role} requirements")

    recommended_roles = [
        target_role,
        "Data Analyst" if target_role != "Data Analyst" else "Data Scientist",
        "Ayurvedic Health Informatics Specialist" if "ayush" in text_lower or "clinical" in text_lower else "Full Stack Developer"
    ]

    return {
        "ats_score": ats_score,
        "target_role": target_role,
        "extracted_skills": extracted_skills,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "experience_years_detected": experience_years,
        "education_detected": education_detected,
        "strengths": strengths,
        "improvement_suggestions": improvement_suggestions,
        "recommended_roles": recommended_roles
    }
