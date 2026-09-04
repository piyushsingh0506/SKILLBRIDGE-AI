from typing import List, Dict, Any, Optional
from app.ai.skill_extractor import normalize_skill, extract_skills_from_text

def calculate_compatibility(
    student_profile: Dict[str, Any],
    opportunity: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Computes 7-factor weighted compatibility score between a Student and an Opportunity (Job/Internship).
    
    Weights:
    - Technical Skills: 40%
    - Soft Skills: 10%
    - Qualification/Academic: 15%
    - Certifications: 10%
    - Projects/Experience: 10%
    - Career Interest Alignment: 10%
    - Location/Preference: 5%
    """
    # 1. Parse Opportunity requirements
    raw_req = opportunity.get("required_skills", "")
    raw_pref = opportunity.get("preferred_skills", "")
    
    required_skills = [normalize_skill(s) for s in raw_req.split(",") if s.strip()] if isinstance(raw_req, str) else [normalize_skill(s) for s in raw_req]
    preferred_skills = [normalize_skill(s) for s in raw_pref.split(",") if s.strip()] if isinstance(raw_pref, str) else [normalize_skill(s) for s in raw_pref]
    
    # 2. Extract Student Skills
    student_skills_list = student_profile.get("skills", [])
    student_skill_names = set()
    student_skill_scores = {}
    for s in student_skills_list:
        name = normalize_skill(s.get("name") or s.get("skill_name") or "")
        student_skill_names.add(name)
        student_skill_scores[name] = float(s.get("score", 75.0))
        
    # --- Factor 1: Technical Skills (40%) ---
    tech_score = 0.0
    if required_skills:
        matched_req = [s for s in required_skills if s in student_skill_names]
        req_ratio = len(matched_req) / len(required_skills)
        # Average score of matched skills
        avg_score = sum(student_skill_scores.get(s, 75.0) for s in matched_req) / max(len(matched_req), 1) if matched_req else 0
        tech_score = (req_ratio * 0.7 + (avg_score / 100.0) * 0.3) * 100.0
    else:
        tech_score = 80.0
        
    # Boost with preferred skills
    if preferred_skills:
        matched_pref = [s for s in preferred_skills if s in student_skill_names]
        pref_ratio = len(matched_pref) / len(preferred_skills)
        tech_score = min(100.0, tech_score * 0.85 + pref_ratio * 15.0)
        
    # --- Factor 2: Soft Skills (10%) ---
    student_soft_score = float(student_profile.get("soft_score", 70.0))
    soft_score = min(100.0, max(50.0, student_soft_score))
    
    # --- Factor 3: Qualification & CGPA (15%) ---
    cgpa = float(student_profile.get("cgpa", 8.0))
    # Normalize CGPA (e.g. 8.5/10 -> 85%)
    qual_score = min(100.0, (cgpa / 10.0) * 100.0)
    
    # --- Factor 4: Certifications (10%) ---
    certs = student_profile.get("certifications", [])
    if len(certs) >= 2:
        cert_score = 95.0
    elif len(certs) == 1:
        cert_score = 80.0
    else:
        cert_score = 55.0
        
    # --- Factor 5: Projects & Experience (10%) ---
    projects = student_profile.get("projects", [])
    if len(projects) >= 3:
        project_score = 95.0
    elif len(projects) == 2:
        project_score = 85.0
    elif len(projects) == 1:
        project_score = 70.0
    else:
        project_score = 50.0
        
    # --- Factor 6: Career Interest Alignment (10%) ---
    interest = (student_profile.get("career_interest", "") or "").lower()
    title = (opportunity.get("title", "") or "").lower()
    desc = (opportunity.get("description", "") or "").lower()
    
    if interest and (interest in title or interest in desc):
        interest_score = 95.0
    elif interest and any(word in title for word in interest.split()):
        interest_score = 80.0
    else:
        interest_score = 65.0
        
    # --- Factor 7: Location & Work Mode (5%) ---
    opp_loc = (opportunity.get("location", "") or "").lower()
    opp_mode = (opportunity.get("work_mode", "") or "").lower()
    stud_pref_loc = (student_profile.get("preferred_locations", "") or "").lower()
    
    if "remote" in opp_mode or "remote" in opp_loc:
        location_score = 100.0
    elif stud_pref_loc and any(loc.strip() in opp_loc for loc in stud_pref_loc.split(",")):
        location_score = 95.0
    else:
        location_score = 75.0
        
    # Calculate Total Weighted Score
    final_score = (
        tech_score * 0.40 +
        soft_score * 0.10 +
        qual_score * 0.15 +
        cert_score * 0.10 +
        project_score * 0.10 +
        interest_score * 0.10 +
        location_score * 0.05
    )
    
    final_score_rounded = round(final_score, 1)
    
    # Generate match reasons & highlights
    reasons = []
    if tech_score >= 80:
        reasons.append("Strong technical skill overlap")
    if qual_score >= 80:
        reasons.append(f"Outstanding academic profile ({cgpa} CGPA)")
    if len(projects) >= 2:
        reasons.append(f"{len(projects)} relevant portfolio projects")
    if "remote" in opp_mode or location_score >= 90:
        reasons.append("High location/work-mode compatibility")
        
    return {
        "compatibility_score": final_score_rounded,
        "match_label": f"{int(final_score_rounded)}% Skill Match",
        "breakdown": {
            "technical_skills": round(tech_score, 1),
            "soft_skills": round(soft_score, 1),
            "qualification": round(qual_score, 1),
            "certifications": round(cert_score, 1),
            "projects": round(project_score, 1),
            "career_interest": round(interest_score, 1),
            "location_preference": round(location_score, 1)
        },
        "reasons": reasons
    }
