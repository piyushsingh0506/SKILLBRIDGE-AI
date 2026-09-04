from typing import List, Dict, Any
from app.ai.skill_extractor import normalize_skill
from app.ai.skill_gap import ROLE_BENCHMARKS

def predict_career_paths(student_skills: List[Dict[str, Any]], interests: str = "") -> List[Dict[str, Any]]:
    """
    Ranks top career paths based on skill overlap, proficiency, and student interests.
    """
    student_skill_names = set()
    student_skill_scores = {}
    for s in student_skills:
        name = normalize_skill(s.get("name") or s.get("skill_name") or "")
        student_skill_names.add(name)
        student_skill_scores[name] = float(s.get("score", 70.0))
        
    career_predictions = []
    
    role_meta = {
        "Data Analyst": {"avg_salary": "₹7-14 LPA", "growth": "+28% YoY", "id": 1, "category": "Data"},
        "Data Scientist": {"avg_salary": "₹12-24 LPA", "growth": "+35% YoY", "id": 2, "category": "AI/ML"},
        "ML Engineer": {"avg_salary": "₹14-28 LPA", "growth": "+42% YoY", "id": 3, "category": "AI/ML"},
        "Full Stack Developer": {"avg_salary": "₹8-18 LPA", "growth": "+25% YoY", "id": 4, "category": "Engineering"},
        "Backend Developer": {"avg_salary": "₹9-20 LPA", "growth": "+24% YoY", "id": 5, "category": "Engineering"},
        "Ayurvedic Health Informatics Specialist": {"avg_salary": "₹8-16 LPA", "growth": "+38% YoY (Ayush Tech)", "id": 6, "category": "Ayush & HealthTech"},
        "Clinical Data Analyst (Ayush & Biotech)": {"avg_salary": "₹7-15 LPA", "growth": "+30% YoY", "id": 7, "category": "Ayush & HealthTech"},
        "Herbal Drug Standardization Scientist": {"avg_salary": "₹8-17 LPA", "growth": "+26% YoY", "id": 8, "category": "Ayush & Pharma"},
        "Cloud & DevOps Engineer": {"avg_salary": "₹10-22 LPA", "growth": "+32% YoY", "id": 9, "category": "Cloud"},
        "Product Manager (HealthTech / SaaS)": {"avg_salary": "₹15-30 LPA", "growth": "+20% YoY", "id": 10, "category": "Management"}
    }

    for role_name, bench in ROLE_BENCHMARKS.items():
        req = [normalize_skill(s) for s in bench["required"]]
        pref = [normalize_skill(s) for s in bench["preferred"]]
        
        matched_req = [s for s in req if s in student_skill_names]
        matched_pref = [s for s in pref if s in student_skill_names]
        missing_req = [s for s in req if s not in student_skill_names]
        
        req_ratio = len(matched_req) / max(len(req), 1)
        pref_ratio = len(matched_pref) / max(len(pref), 1)
        
        # Base compatibility score
        score = (req_ratio * 0.70 + pref_ratio * 0.30) * 100.0
        
        # Interest boost
        if interests and role_name.lower() in interests.lower():
            score = min(100.0, score + 10.0)
            
        score = round(max(35.0, min(96.0, score)), 1)
        
        meta = role_meta.get(role_name, {"avg_salary": "₹8-15 LPA", "growth": "+25% YoY", "id": 1, "category": "General"})
        
        roadmap = [
            f"Month 1: Gain solid foundation in {missing_req[0] if missing_req else 'advanced topics'}",
            f"Month 2: Build end-to-end industry project targeting {role_name}",
            f"Month 3: Complete certified domain assessment and apply for internships"
        ]
        
        career_predictions.append({
            "role_id": meta["id"],
            "title": role_name,
            "category": meta["category"],
            "compatibility_score": score,
            "average_salary": meta["avg_salary"],
            "growth_rate": meta["growth"],
            "matching_skills": matched_req + matched_pref,
            "missing_skills": missing_req,
            "roadmap": roadmap
        })
        
    # Sort by compatibility score descending
    career_predictions.sort(key=lambda x: x["compatibility_score"], reverse=True)
    return career_predictions
