import os
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings

def generate_local_mentor_reply(
    message: str,
    student_profile: Dict[str, Any],
    skill_gap_info: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generates intelligent contextual career guidance based on student data without requiring external API keys.
    """
    msg_lower = message.lower()
    name = student_profile.get("full_name", "Student")
    college = student_profile.get("college", "your university")
    target_role = student_profile.get("career_interest", "Data Analyst")
    overall_score = student_profile.get("overall_skill_score", 72.0)
    
    # Extract student's current skills
    skills_list = [s.get("name") for s in student_profile.get("skills", [])]
    skills_str = ", ".join(skills_list[:5]) if skills_list else "Python, SQL"
    
    # Missing skills from gap analysis if available
    missing = []
    if skill_gap_info and "missing_skills" in skill_gap_info:
        missing = [m.get("skill") for m in skill_gap_info["missing_skills"]]
    missing_str = ", ".join(missing[:3]) if missing else "Power BI, Cloud Analytics"

    reply = ""
    suggested_actions = []
    suggested_questions = []

    if any(k in msg_lower for k in ["roadmap", "3-month", "month", "plan", "study"]):
        reply = (
            f"Here is your customized 3-Month Fast-Track Career Roadmap for **{target_role}**:\n\n"
            f"📅 **Month 1: Bridge Critical Gaps**\n"
            f"- Target high-priority missing skills: **{missing_str}**.\n"
            f"- Complete foundational coursework on SWAYAM / NPTEL / Coursera.\n"
            f"- Practice 20+ intermediate problem-solving sets.\n\n"
            f"📅 **Month 2: High-Impact Projects & AYUSH/Tech Real-World Datasets**\n"
            f"- Build an end-to-end project leveraging {skills_str} and publish to GitHub.\n"
            f"- Implement data pipeline or ML model with clean documentation.\n\n"
            f"📅 **Month 3: Placement Readiness & Industry Outreach**\n"
            f"- Refine resume with our AI ATS Scanner targeting a score > 85%.\n"
            f"- Apply to 5+ high-compatibility internships with > 80% Skill Match on the portal.\n"
            f"- Schedule a mock interview with an industry mentor."
        )
        suggested_actions = ["View Recommended Courses", "Explore Internships", "Run Resume ATS Scanner"]
        suggested_questions = [
            f"What projects should I build for {target_role}?",
            "How can I improve my overall skill score?",
            "Which internships match my profile right now?"
        ]

    elif any(k in msg_lower for k in ["resume", "cv", "ats", "format"]):
        reply = (
            f"Based on your profile, here are 3 key ways to optimize your resume for **{target_role}**:\n\n"
            f"1. **Highlight Your Strongest Competencies**: Emphasize your verified skills ({skills_str}) in your technical summary.\n"
            f"2. **Quantify Accomplishments**: Instead of 'built a model', write 'Engineered predictive ML pipeline with 94.2% precision reducing analysis turnaround by 40%'.\n"
            f"3. **Add Missing Keywords**: Ensure keywords like **{missing_str}** are represented in your coursework or projects section.\n\n"
            f"💡 *Tip: Use the **Resume AI** tab to upload your PDF resume for an instant ATS score calculation.*"
        )
        suggested_actions = ["Upload Resume to AI Scanner", "Add Project to Profile"]
        suggested_questions = [
            "Create a 3-month learning roadmap.",
            "Why is my skill score low?",
            "Which internship should I apply for?"
        ]

    elif any(k in msg_lower for k in ["low", "score", "improve", "why"]):
        reply = (
            f"Your current Overall Skill Score is **{overall_score}%**.\n\n"
            f"Here is why and how you can boost it to **85%+**:\n"
            f"• **Assessment Verification**: Complete domain-specific assessments in Technical and Aptitude modules to verify self-reported skills.\n"
            f"• **Skill Gap Closure**: You currently have {len(missing)} unverified or missing skills required for {target_role} (e.g. {missing_str}).\n"
            f"• **Project Portfolios**: Adding live GitHub links and detailed project descriptions gives a direct boost to your placement readiness score."
        )
        suggested_actions = ["Take AI Skill Assessment", "View Skill Gap Analysis"]
        suggested_questions = [
            f"What skills should I learn to become an {target_role}?",
            "Create a 3-month learning roadmap.",
            "Which internships should I apply for?"
        ]

    elif any(k in msg_lower for k in ["internship", "job", "apply", "opportunity"]):
        reply = (
            f"For your target role as **{target_role}**, our AI matching engine evaluates your technical stack ({skills_str}), "
            f"academic performance ({student_profile.get('cgpa', 8.0)} CGPA at {college}), and project count.\n\n"
            f"🔥 **Top Strategy**:\n"
            f"1. Focus on opportunities with **> 80% Skill Match** badges in the Internships section.\n"
            f"2. Check company criteria (e.g. Dabur AyurTech, Patanjali BioLabs, TCS HealthTech).\n"
            f"3. Apply with a customized cover note highlighting your {skills_list[0] if skills_list else 'data'} projects."
        )
        suggested_actions = ["Browse Matching Internships", "View Active Jobs"]
        suggested_questions = [
            "How can I improve my resume?",
            "Create a 3-month learning roadmap.",
            f"What skills do industries look for in {target_role}?"
        ]

    else:
        reply = (
            f"Hello {name}! I am your AI Career Mentor. I've analyzed your academic background at {college}, "
            f"your current skill profile in **{skills_str}**, and your target role as **{target_role}**.\n\n"
            f"I can help you with:\n"
            f"• Tailored 3-Month / 6-Month learning roadmaps\n"
            f"• ATS Resume optimization and keyword suggestions\n"
            f"• AI Skill Gap breakdown and high-yield course picks\n"
            f"• Guidance on matching internships and placement readiness\n\n"
            f"What would you like to focus on today?"
        )
        suggested_actions = ["Generate 3-Month Roadmap", "Analyze My Skill Gaps", "View Recommended Jobs"]
        suggested_questions = [
            f"What skills should I learn to become an {target_role}?",
            "Why is my skill score low and how to improve it?",
            "Which internship should I apply for?",
            "Create a 3-month learning roadmap."
        ]

    return {
        "reply": reply,
        "suggested_actions": suggested_actions,
        "suggested_questions": suggested_questions,
        "context_used": {
            "target_role": target_role,
            "overall_score": overall_score,
            "missing_skills_count": len(missing)
        }
    }

async def get_mentor_response(
    message: str,
    student_profile: Dict[str, Any],
    skill_gap_info: Optional[Dict[str, Any]] = None,
    chat_history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Handles AI Career Mentor responses with optional Gemini LLM integration and robust local fallback.
    """
    # If Gemini API key is configured and AI_PROVIDER is set to gemini
    if settings.GEMINI_API_KEY and settings.AI_PROVIDER == "gemini":
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            prompt = (
                f"You are an expert AI Career Mentor for university students on the Academia-Industry Connect platform.\n"
                f"Student Profile:\n"
                f"- Name: {student_profile.get('full_name')}\n"
                f"- College: {student_profile.get('college')}\n"
                f"- Target Career Role: {student_profile.get('career_interest')}\n"
                f"- Skills: {[s.get('name') for s in student_profile.get('skills', [])]}\n"
                f"- Overall Skill Score: {student_profile.get('overall_skill_score')}%\n"
                f"- CGPA: {student_profile.get('cgpa')}\n\n"
                f"Student Question: {message}\n"
                f"Provide concise, actionable, encouraging career guidance in clean markdown format."
            )
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
                if res.status_code == 200:
                    data = res.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {
                        "reply": text,
                        "suggested_actions": ["View Roadmap", "Take Assessment", "Browse Jobs"],
                        "suggested_questions": ["How do I improve my score?", "Which skills to learn next?"],
                        "context_used": {"provider": "gemini"}
                    }
        except Exception:
            # Fall back seamlessly to local AI mentor generator
            pass

    return generate_local_mentor_reply(message, student_profile, skill_gap_info)
