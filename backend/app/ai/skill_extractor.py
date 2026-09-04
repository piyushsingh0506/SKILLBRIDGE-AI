import re
from typing import List, Set, Dict

# Comprehensive Skill Taxonomy covering Modern Software, AI/ML, Cloud, Data, and Ayush/Biotech
SKILL_TAXONOMY: Dict[str, Dict[str, str]] = {
    # Programming & Tech
    "python": {"canonical": "Python", "category": "Technical"},
    "javascript": {"canonical": "JavaScript", "category": "Technical"},
    "typescript": {"canonical": "TypeScript", "category": "Technical"},
    "react": {"canonical": "React", "category": "Technical"},
    "reactjs": {"canonical": "React", "category": "Technical"},
    "node": {"canonical": "Node.js", "category": "Technical"},
    "nodejs": {"canonical": "Node.js", "category": "Technical"},
    "express": {"canonical": "Express.js", "category": "Technical"},
    "fastapi": {"canonical": "FastAPI", "category": "Technical"},
    "flask": {"canonical": "Flask", "category": "Technical"},
    "django": {"canonical": "Django", "category": "Technical"},
    "sql": {"canonical": "SQL", "category": "Technical"},
    "postgresql": {"canonical": "PostgreSQL", "category": "Technical"},
    "postgres": {"canonical": "PostgreSQL", "category": "Technical"},
    "mysql": {"canonical": "MySQL", "category": "Technical"},
    "mongodb": {"canonical": "MongoDB", "category": "Technical"},
    "docker": {"canonical": "Docker", "category": "Technical"},
    "kubernetes": {"canonical": "Kubernetes", "category": "Technical"},
    "aws": {"canonical": "AWS", "category": "Technical"},
    "git": {"canonical": "Git & GitHub", "category": "Technical"},
    "github": {"canonical": "Git & GitHub", "category": "Technical"},
    "html": {"canonical": "HTML5", "category": "Technical"},
    "css": {"canonical": "CSS3", "category": "Technical"},
    "tailwind": {"canonical": "Tailwind CSS", "category": "Technical"},
    "tailwindcss": {"canonical": "Tailwind CSS", "category": "Technical"},
    "c++": {"canonical": "C++", "category": "Technical"},
    "cpp": {"canonical": "C++", "category": "Technical"},
    "java": {"canonical": "Java", "category": "Technical"},
    "linux": {"canonical": "Linux", "category": "Technical"},
    "rest api": {"canonical": "REST APIs", "category": "Technical"},
    "graphql": {"canonical": "GraphQL", "category": "Technical"},
    
    # Data & AI/ML
    "machine learning": {"canonical": "Machine Learning", "category": "Technical"},
    "ml": {"canonical": "Machine Learning", "category": "Technical"},
    "deep learning": {"canonical": "Deep Learning", "category": "Technical"},
    "nlp": {"canonical": "Natural Language Processing (NLP)", "category": "Technical"},
    "natural language processing": {"canonical": "Natural Language Processing (NLP)", "category": "Technical"},
    "computer vision": {"canonical": "Computer Vision", "category": "Technical"},
    "tensorflow": {"canonical": "TensorFlow", "category": "Technical"},
    "pytorch": {"canonical": "PyTorch", "category": "Technical"},
    "scikit-learn": {"canonical": "Scikit-Learn", "category": "Technical"},
    "pandas": {"canonical": "Pandas", "category": "Technical"},
    "numpy": {"canonical": "NumPy", "category": "Technical"},
    "power bi": {"canonical": "Power BI", "category": "Technical"},
    "powerbi": {"canonical": "Power BI", "category": "Technical"},
    "tableau": {"canonical": "Tableau", "category": "Technical"},
    "excel": {"canonical": "Advanced Excel", "category": "Technical"},
    "statistics": {"canonical": "Applied Statistics", "category": "Technical"},
    "data analysis": {"canonical": "Data Analysis", "category": "Technical"},
    "data science": {"canonical": "Data Science", "category": "Technical"},
    "data visualization": {"canonical": "Data Visualization", "category": "Technical"},

    # Ayush, Health Informatics & Biotech (Ministry of Ayush / AIIA domain)
    "ayurvedic pharmacology": {"canonical": "Dravyaguna (Pharmacology)", "category": "Ayush/Domain"},
    "dravyaguna": {"canonical": "Dravyaguna (Pharmacology)", "category": "Ayush/Domain"},
    "herb-drug interaction": {"canonical": "Herb-Drug Interaction Analysis", "category": "Ayush/Domain"},
    "clinical trials": {"canonical": "Clinical Trials & GCP", "category": "Ayush/Domain"},
    "ayush informatics": {"canonical": "AYUSH Health Informatics", "category": "Ayush/Domain"},
    "ayush health informatics": {"canonical": "AYUSH Health Informatics", "category": "Ayush/Domain"},
    "ayush": {"canonical": "AYUSH Health Informatics", "category": "Ayush/Domain"},
    "bioinformatics": {"canonical": "Bioinformatics & Genomic Analytics", "category": "Ayush/Domain"},
    "phytochemistry": {"canonical": "Phytochemistry & Quality Control", "category": "Ayush/Domain"},
    "panchakarma": {"canonical": "Panchakarma Protocol Analytics", "category": "Ayush/Domain"},
    "ayurvedic formulation": {"canonical": "Ayurvedic Drug Standardization", "category": "Ayush/Domain"},
    "pharmacovigilance": {"canonical": "Pharmacovigilance (Ayush)", "category": "Ayush/Domain"},
    "herbal data mining": {"canonical": "Herbal Big Data Mining", "category": "Ayush/Domain"},
    
    # Soft & Aptitude
    "communication": {"canonical": "Communication Skills", "category": "Soft"},
    "problem solving": {"canonical": "Problem Solving & Analytical Thinking", "category": "Soft"},
    "team leadership": {"canonical": "Team Leadership", "category": "Soft"},
    "leadership": {"canonical": "Team Leadership", "category": "Soft"},
    "project management": {"canonical": "Agile Project Management", "category": "Soft"},
    "agile": {"canonical": "Agile Project Management", "category": "Soft"},
    "critical thinking": {"canonical": "Critical Thinking", "category": "Soft"},
    "time management": {"canonical": "Time Management", "category": "Soft"},
    "aptitude": {"canonical": "Quantitative Aptitude", "category": "Aptitude"},
    "logical reasoning": {"canonical": "Logical Reasoning", "category": "Aptitude"}
}

def normalize_skill(skill_name: str) -> str:
    """Normalizes any skill name to its canonical title."""
    clean = skill_name.strip().lower()
    if clean in SKILL_TAXONOMY:
        return SKILL_TAXONOMY[clean]["canonical"]
    
    # Check partial contains
    for key, val in SKILL_TAXONOMY.items():
        if key == clean or (len(key) > 3 and key in clean):
            return val["canonical"]
            
    # Capitalize title format
    return skill_name.strip().title()

def extract_skills_from_text(text: str) -> List[str]:
    """Extracts skills from text (e.g. resumes, job descriptions, project summaries)."""
    if not text:
        return []
        
    found_skills: Set[str] = set()
    text_lower = " " + text.lower().replace("/", " ").replace(",", " ") + " "
    
    # Search for known taxonomy entries
    for key, val in SKILL_TAXONOMY.items():
        pattern = r'\b' + re.escape(key) + r'\b'
        if re.search(pattern, text_lower):
            found_skills.add(val["canonical"])
            
    return sorted(list(found_skills))
