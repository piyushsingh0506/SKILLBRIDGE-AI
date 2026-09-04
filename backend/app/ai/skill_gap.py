from typing import List, Dict, Any, Optional
from app.ai.skill_extractor import normalize_skill

# Standard Benchmark Skill Profiles for Top Industry & Ayush Roles
ROLE_BENCHMARKS: Dict[str, Dict[str, Any]] = {
    "Data Analyst": {
        "required": ["Python", "SQL", "Power BI", "Advanced Excel", "Applied Statistics"],
        "preferred": ["Data Visualization", "Pandas", "Tableau", "Problem Solving & Analytical Thinking"],
        "category": "Data & Analytics"
    },
    "Data Scientist": {
        "required": ["Python", "Machine Learning", "Applied Statistics", "SQL", "Pandas", "Scikit-Learn"],
        "preferred": ["Deep Learning", "Natural Language Processing (NLP)", "Data Visualization", "Docker"],
        "category": "AI & ML"
    },
    "ML Engineer": {
        "required": ["Python", "Machine Learning", "Deep Learning", "PyTorch", "Docker", "REST APIs"],
        "preferred": ["Kubernetes", "AWS", "FastAPI", "Natural Language Processing (NLP)", "Git & GitHub"],
        "category": "AI & ML"
    },
    "Full Stack Developer": {
        "required": ["React", "JavaScript", "Node.js", "SQL", "HTML5", "CSS3", "Git & GitHub"],
        "preferred": ["TypeScript", "Tailwind CSS", "Docker", "REST APIs", "PostgreSQL"],
        "category": "Software Engineering"
    },
    "Backend Developer": {
        "required": ["Python", "FastAPI", "SQL", "PostgreSQL", "REST APIs", "Docker", "Git & GitHub"],
        "preferred": ["AWS", "Kubernetes", "MongoDB", "Linux"],
        "category": "Software Engineering"
    },
    "Ayurvedic Health Informatics Specialist": {
        "required": ["AYUSH Health Informatics", "Python", "Data Analysis", "Clinical Trials & GCP", "Dravyaguna (Pharmacology)"],
        "preferred": ["Bioinformatics & Genomic Analytics", "Advanced Excel", "Herb-Drug Interaction Analysis", "Applied Statistics"],
        "category": "Ayush & HealthTech"
    },
    "Clinical Data Analyst (Ayush & Biotech)": {
        "required": ["Clinical Trials & GCP", "Applied Statistics", "Advanced Excel", "Python", "SQL"],
        "preferred": ["Pharmacovigilance (Ayush)", "Power BI", "Phytochemistry & Quality Control", "Data Visualization"],
        "category": "Ayush & HealthTech"
    },
    "Herbal Drug Standardization Scientist": {
        "required": ["Phytochemistry & Quality Control", "Dravyaguna (Pharmacology)", "Herb-Drug Interaction Analysis", "Clinical Trials & GCP"],
        "preferred": ["AYUSH Health Informatics", "Pharmacovigilance (Ayush)", "Applied Statistics", "Communication Skills"],
        "category": "Ayush & Pharma"
    },
    "Cloud & DevOps Engineer": {
        "required": ["Linux", "Docker", "Kubernetes", "AWS", "Git & GitHub", "Python"],
        "preferred": ["REST APIs", "PostgreSQL", "Problem Solving & Analytical Thinking"],
        "category": "Cloud & Infrastructure"
    },
    "Product Manager (HealthTech / SaaS)": {
        "required": ["Agile Project Management", "Communication Skills", "Data Analysis", "Critical Thinking", "Problem Solving & Analytical Thinking"],
        "preferred": ["Power BI", "Advanced Excel", "Team Leadership", "Time Management"],
        "category": "Product & Strategy"
    }
}

def analyze_skill_gap(
    student_skills: List[Dict[str, Any]],
    target_role: str,
    assessment_scores: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Performs AI skill gap detection and profiling.
    """
    # Normalize student skill dictionary
    student_skill_map = {}
    for s in student_skills:
        name = normalize_skill(s.get("name") or s.get("skill_name") or "")
        score = float(s.get("score", 70.0))
        student_skill_map[name] = {
            "name": name,
            "score": score,
            "level": s.get("proficiency_level", "Intermediate"),
            "category": s.get("category", "Technical"),
            "verified": s.get("verified", False)
        }
        
    benchmark = ROLE_BENCHMARKS.get(target_role)
    if not benchmark:
        # Fallback to Data Analyst benchmark
        target_role = "Data Analyst"
        benchmark = ROLE_BENCHMARKS[target_role]
        
    required_skills = [normalize_skill(s) for s in benchmark["required"]]
    preferred_skills = [normalize_skill(s) for s in benchmark["preferred"]]
    
    strong_skills = []
    weak_skills = []
    missing_skills = []
    
    total_weights = 0.0
    earned_weights = 0.0
    
    # Process Required Skills (Weight: 1.0 each)
    for req in required_skills:
        weight = 1.0
        total_weights += weight
        if req in student_skill_map:
            item = student_skill_map[req]
            if item["score"] >= 70:
                strong_skills.append({
                    "skill": req,
                    "score": item["score"],
                    "category": item.get("category", "Technical"),
                    "status": "Strong",
                    "importance": "Required"
                })
                earned_weights += weight * (item["score"] / 100.0)
            else:
                weak_skills.append({
                    "skill": req,
                    "score": item["score"],
                    "target_score": 80.0,
                    "priority": "High",
                    "category": item.get("category", "Technical"),
                    "status": "Needs Improvement",
                    "importance": "Required"
                })
                earned_weights += weight * (item["score"] / 100.0)
        else:
            missing_skills.append({
                "skill": req,
                "score": 0.0,
                "target_score": 80.0,
                "priority": "High",
                "category": "Technical",
                "importance": "Required",
                "recommendation": f"Complete foundational course and hands-on projects in {req}"
            })
            
    # Process Preferred Skills (Weight: 0.5 each)
    for pref in preferred_skills:
        weight = 0.5
        total_weights += weight
        if pref in student_skill_map:
            item = student_skill_map[pref]
            if item["score"] >= 70:
                strong_skills.append({
                    "skill": pref,
                    "score": item["score"],
                    "category": item.get("category", "Technical"),
                    "status": "Strong",
                    "importance": "Preferred"
                })
                earned_weights += weight * (item["score"] / 100.0)
            else:
                weak_skills.append({
                    "skill": pref,
                    "score": item["score"],
                    "target_score": 75.0,
                    "priority": "Medium",
                    "category": item.get("category", "Technical"),
                    "status": "Moderate",
                    "importance": "Preferred"
                })
                earned_weights += weight * (item["score"] / 100.0)
        else:
            missing_skills.append({
                "skill": pref,
                "score": 0.0,
                "target_score": 75.0,
                "priority": "Medium" if len(missing_skills) < 4 else "Low",
                "category": "Technical",
                "importance": "Preferred",
                "recommendation": f"Add {pref} to your skillset to gain a competitive edge"
            })
            
    compatibility_score = round((earned_weights / max(total_weights, 1.0)) * 100, 1)
    
    # Generate tailored action roadmap
    action_plan = []
    if missing_skills:
        high_missing = [m["skill"] for m in missing_skills if m["priority"] == "High"]
        if high_missing:
            action_plan.append(f"Master critical high-priority skills: {', '.join(high_missing)}")
    if weak_skills:
        action_plan.append(f"Upgrade proficiency in weak areas ({', '.join([w['skill'] for w in weak_skills])}) via practice assessments")
    action_plan.append(f"Build at least 2 end-to-end portfolio projects aligned with {target_role}")
    action_plan.append("Target industry-recognized certifications (e.g. NPTEL, Coursera, AIIA AyurInformatics)")
    action_plan.append("Apply for entry-level internships matching > 75% compatibility")

    return {
        "target_role": target_role,
        "compatibility_score": compatibility_score,
        "strong_skills": strong_skills,
        "weak_skills": weak_skills,
        "missing_skills": missing_skills,
        "total_gaps_count": len(missing_skills) + len(weak_skills),
        "action_plan": action_plan
    }
