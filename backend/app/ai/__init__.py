from app.ai.skill_extractor import extract_skills_from_text, normalize_skill, SKILL_TAXONOMY
from app.ai.skill_gap import analyze_skill_gap, ROLE_BENCHMARKS
from app.ai.matcher import calculate_compatibility
from app.ai.resume_analyzer import analyze_resume, extract_text_from_pdf_bytes
from app.ai.career_predictor import predict_career_paths
from app.ai.career_mentor import get_mentor_response, generate_local_mentor_reply
