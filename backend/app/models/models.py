import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.database.session import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    INDUSTRY = "industry"
    ACADEMICIAN = "academician"
    INSTITUTION = "institution"
    ADMIN = "admin"

class OpportunityType(str, enum.Enum):
    INTERNSHIP = "internship"
    JOB = "job"

class ApplicationStatus(str, enum.Enum):
    APPLIED = "Applied"
    UNDER_REVIEW = "Under Review"
    SHORTLISTED = "Shortlisted"
    INTERVIEW = "Interview"
    SELECTED = "Selected"
    REJECTED = "Rejected"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    avatar = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    industry_profile = relationship("IndustryProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    academician_profile = relationship("AcademicianProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    institution_profile = relationship("InstitutionProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    college = Column(String(255), default="")
    course = Column(String(255), default="")
    branch = Column(String(255), default="")
    graduation_year = Column(Integer, default=2026)
    career_interest = Column(String(255), default="")
    preferred_roles = Column(Text, default="") # JSON or comma-separated
    preferred_locations = Column(Text, default="")
    bio = Column(Text, default="")
    cgpa = Column(Float, default=8.0)
    placement_ready = Column(Boolean, default=False)
    resume_url = Column(String(500), nullable=True)
    
    # Calculated scores
    profile_completion = Column(Float, default=70.0)
    overall_skill_score = Column(Float, default=72.0)
    technical_score = Column(Float, default=75.0)
    soft_score = Column(Float, default=70.0)
    placement_readiness_score = Column(Float, default=68.0)
    target_career_role_id = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="student_profile")
    skills = relationship("StudentSkill", back_populates="student", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="student", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="student", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
    assessment_results = relationship("AssessmentResult", back_populates="student", cascade="all, delete-orphan")
    skill_gaps = relationship("SkillGap", back_populates="student", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="student", cascade="all, delete-orphan")

class IndustryProfile(Base):
    __tablename__ = "industries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    company_name = Column(String(255), nullable=False)
    industry_type = Column(String(255), default="Technology")
    company_size = Column(String(100), default="50-200")
    location = Column(String(255), default="New Delhi")
    website = Column(String(500), default="")
    description = Column(Text, default="")
    verified = Column(Boolean, default=True)
    logo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="industry_profile")
    internships = relationship("Internship", back_populates="industry", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="industry", cascade="all, delete-orphan")
    research_collaborations = relationship("ResearchCollaboration", back_populates="industry", cascade="all, delete-orphan")

class AcademicianProfile(Base):
    __tablename__ = "academicians"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    institution_name = Column(String(255), nullable=False)
    department = Column(String(255), default="Computer Science")
    designation = Column(String(255), default="Associate Professor")
    specialization = Column(String(255), default="")
    bio = Column(Text, default="")
    research_areas = Column(Text, default="")
    experience_years = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="academician_profile")
    research_collaborations = relationship("ResearchCollaboration", back_populates="academician", cascade="all, delete-orphan")

class InstitutionProfile(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    institution_name = Column(String(255), nullable=False)
    institution_type = Column(String(255), default="University")
    location = Column(String(255), default="New Delhi")
    website = Column(String(500), default="")
    established_year = Column(Integer, default=1990)
    accreditation = Column(String(100), default="NAAC A++ / NIRF Top 20")
    contact_person = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="institution_profile")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), default="Technical") # Technical, Soft, Aptitude, Ayush/Domain, Framework, Tool
    description = Column(Text, default="")
    demand_level = Column(String(50), default="High") # High, Medium, Low
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student_skills = relationship("StudentSkill", back_populates="skill", cascade="all, delete-orphan")
    career_role_skills = relationship("CareerRoleSkill", back_populates="skill", cascade="all, delete-orphan")

class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency_level = Column(String(50), default="Intermediate") # Beginner, Intermediate, Advanced, Expert
    score = Column(Float, default=70.0) # 0 to 100
    verified = Column(Boolean, default=False)
    source = Column(String(50), default="Self") # Self, Assessment, Project, Certification

    student = relationship("StudentProfile", back_populates="skills")
    skill = relationship("Skill", back_populates="student_skills")

class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), unique=True, nullable=False)
    category = Column(String(100), default="Software")
    description = Column(Text, default="")
    average_salary = Column(String(100), default="₹8-16 LPA")
    growth_rate = Column(String(50), default="+24% YoY")
    required_education = Column(String(255), default="B.Tech / BAMS / MCA / M.Sc")

    skills = relationship("CareerRoleSkill", back_populates="career_role", cascade="all, delete-orphan")

class CareerRoleSkill(Base):
    __tablename__ = "career_role_skills"

    id = Column(Integer, primary_key=True, index=True)
    career_role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    importance = Column(String(50), default="Required") # Required, Preferred
    weight = Column(Float, default=1.0) # 0.5 to 2.0
    priority = Column(String(50), default="High") # High, Medium, Low

    career_role = relationship("CareerRole", back_populates="skills")
    skill = relationship("Skill", back_populates="career_role_skills")

class SkillAssessment(Base):
    __tablename__ = "skill_assessments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="Technical")
    description = Column(Text, default="")
    duration_minutes = Column(Integer, default=20)
    total_questions = Column(Integer, default=10)

    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")
    results = relationship("AssessmentResult", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("skill_assessments.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)
    correct_option = Column(String(10), nullable=False) # 'A', 'B', 'C', 'D'
    skill_name = Column(String(100), default="")
    difficulty = Column(String(50), default="Medium")
    explanation = Column(Text, default="")

    assessment = relationship("SkillAssessment", back_populates="questions")

class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("skill_assessments.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, default=0.0) # Percentage 0-100
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    category_breakdown = Column(Text, default="{}") # JSON string
    answers_json = Column(Text, default="{}") # JSON string of chosen options
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("StudentProfile", back_populates="assessment_results")
    assessment = relationship("SkillAssessment", back_populates="results")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    tech_stack = Column(Text, default="") # comma-separated or JSON
    github_url = Column(String(500), default="")
    live_url = Column(String(500), default="")
    start_date = Column(String(50), default="")
    end_date = Column(String(50), default="")

    student = relationship("StudentProfile", back_populates="projects")

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    issuer = Column(String(255), default="")
    issue_date = Column(String(50), default="")
    expiry_date = Column(String(50), default="")
    credential_url = Column(String(500), default="")
    verified = Column(Boolean, default=True)

    student = relationship("StudentProfile", back_populates="certifications")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    provider = Column(String(255), default="Coursera / NPTEL / SWAYAM")
    description = Column(Text, default="")
    category = Column(String(100), default="Technical")
    level = Column(String(50), default="Beginner") # Beginner, Intermediate, Advanced
    duration_hours = Column(Integer, default=20)
    rating = Column(Float, default=4.8)
    url = Column(String(500), default="https://swayam.gov.in")
    image_url = Column(String(500), default="")
    mapped_skill = Column(String(100), default="")

class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    industry_id = Column(Integer, ForeignKey("industries.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    required_skills = Column(Text, default="") # comma-separated
    preferred_skills = Column(Text, default="")
    stipend = Column(String(100), default="₹20,000/month")
    duration_months = Column(Integer, default=3)
    location = Column(String(255), default="New Delhi / Remote")
    work_mode = Column(String(50), default="Hybrid") # Remote, On-site, Hybrid
    openings = Column(Integer, default=3)
    deadline = Column(String(50), default="2026-10-30")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    industry = relationship("IndustryProfile", back_populates="internships")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    industry_id = Column(Integer, ForeignKey("industries.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    required_skills = Column(Text, default="") # comma-separated
    preferred_skills = Column(Text, default="")
    salary_range = Column(String(100), default="₹8 - 14 LPA")
    experience_years = Column(String(50), default="0-2 Years (Freshers Welcome)")
    qualification = Column(String(255), default="B.Tech / BAMS / M.Tech / MCA")
    location = Column(String(255), default="Bengaluru / Remote")
    job_type = Column(String(50), default="Full-time") # Full-time, Contract, Part-time
    work_mode = Column(String(50), default="Hybrid")
    openings = Column(Integer, default=2)
    deadline = Column(String(50), default="2026-11-15")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    industry = relationship("IndustryProfile", back_populates="jobs")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_type = Column(String(50), default="internship") # internship, job
    opportunity_id = Column(Integer, nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    match_score = Column(Float, default=85.0) # 0 to 100
    status = Column(String(50), default="Applied") # Applied, Under Review, Shortlisted, Interview, Selected, Rejected
    cover_note = Column(Text, default="")
    resume_snapshot = Column(Text, default="")
    interview_date = Column(String(100), nullable=True)
    interview_link = Column(String(500), nullable=True)
    feedback = Column(Text, default="")
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    student = relationship("StudentProfile", back_populates="applications")

class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    career_role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=True)
    role_title = Column(String(255), default="")
    missing_skills = Column(Text, default="[]") # JSON list of objects with priority
    weak_skills = Column(Text, default="[]") # JSON list
    strong_skills = Column(Text, default="[]") # JSON list
    gap_score = Column(Float, default=30.0) # Lower is better or compatibility score
    priority_actions = Column(Text, default="[]") # JSON list of actions
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    student = relationship("StudentProfile", back_populates="skill_gaps")

class StudentRecommendation(Base):
    __tablename__ = "student_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    item_type = Column(String(50), nullable=False) # internship, job, course, career
    item_id = Column(Integer, nullable=False)
    compatibility_score = Column(Float, default=80.0)
    match_factors = Column(Text, default="{}") # JSON details
    reason = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Mentorship(Base):
    __tablename__ = "mentorships"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mentee_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    topic = Column(String(255), default="Career Guidance & Skill Roadmapping")
    status = Column(String(50), default="Pending") # Pending, Accepted, Completed, Rejected
    scheduled_time = Column(String(100), default="2026-09-15 17:00 IST")
    meeting_link = Column(String(500), default="https://meet.google.com/abc-defg-hij")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ResearchCollaboration(Base):
    __tablename__ = "research_collaborations"

    id = Column(Integer, primary_key=True, index=True)
    industry_id = Column(Integer, ForeignKey("industries.id", ondelete="CASCADE"), nullable=False)
    academician_id = Column(Integer, ForeignKey("academicians.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    domain = Column(String(255), default="AI in Ayurveda & Clinical Automation")
    budget = Column(String(100), default="₹15,00,000")
    status = Column(String(50), default="Open") # Open, In Progress, Completed
    duration_months = Column(Integer, default=12)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    industry = relationship("IndustryProfile", back_populates="research_collaborations")
    academician = relationship("AcademicianProfile", back_populates="research_collaborations")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="alert") # alert, match, application, mentorship, course
    is_read = Column(Boolean, default=False)
    link = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), default="resume.pdf")
    file_text = Column(Text, default="")
    parsed_skills = Column(Text, default="[]") # JSON list
    parsed_experience = Column(Text, default="")
    parsed_education = Column(Text, default="")
    ats_score = Column(Float, default=78.0)
    feedback = Column(Text, default="[]") # JSON list of improvements
    target_role = Column(String(255), default="Data Analyst")
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("StudentProfile", back_populates="resumes")
