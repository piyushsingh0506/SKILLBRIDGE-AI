from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    Float,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database.database import Base


# =========================================================
# USER
# =========================================================

class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(150), unique=True, nullable=False, index=True)

    password = Column(String(255), nullable=False)

    role = Column(String(30), nullable=False)

    is_active = Column(Boolean, default=True)


    student = relationship(
        "Student",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    industry = relationship(
        "Industry",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    institution = relationship(
        "Institution",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    academician = relationship(
        "Academician",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )


# =========================================================
# STUDENT
# =========================================================

class Student(Base):

    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    college = Column(String(200))

    degree = Column(String(100))

    branch = Column(String(100))

    graduation_year = Column(Integer)

    career_goal = Column(String(150))


    user = relationship(
        "User",
        back_populates="student"
    )

    skills = relationship(
        "StudentSkill",
        back_populates="student",
        cascade="all, delete-orphan"
    )

    applications = relationship(
        "Application",
        back_populates="student",
        cascade="all, delete-orphan"
    )


# =========================================================
# INDUSTRY
# =========================================================

class Industry(Base):

    __tablename__ = "industries"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    company_name = Column(String(200))

    industry_type = Column(String(100))

    location = Column(String(200))

    website = Column(String(200), nullable=True)

    company_size = Column(String(100), nullable=True)

    contact_email = Column(String(150), nullable=True)


    user = relationship(
        "User",
        back_populates="industry"
    )

    opportunities = relationship(
        "Opportunity",
        back_populates="industry",
        cascade="all, delete-orphan"
    )

    partnerships = relationship(
        "Partnership",
        back_populates="industry",
        cascade="all, delete-orphan"
    )

    campus_drives = relationship(
        "CampusDrive",
        back_populates="industry",
        cascade="all, delete-orphan"
    )


# =========================================================
# INSTITUTION
# =========================================================

class Institution(Base):

    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    institution_name = Column(String(200))

    location = Column(String(200))

    website = Column(String(200), nullable=True)

    contact_email = Column(String(150), nullable=True)

    accreditation = Column(String(100), nullable=True)

    code = Column(String(50), nullable=True)


    user = relationship(
        "User",
        back_populates="institution"
    )

    partnerships = relationship(
        "Partnership",
        back_populates="institution",
        cascade="all, delete-orphan"
    )

    campus_drives = relationship(
        "CampusDrive",
        back_populates="institution",
        cascade="all, delete-orphan"
    )


# =========================================================
# PARTNERSHIP / MOU (INDUSTRY <-> INSTITUTION)
# =========================================================

class Partnership(Base):

    __tablename__ = "partnerships"

    id = Column(Integer, primary_key=True, index=True)

    institution_id = Column(
        Integer,
        ForeignKey("institutions.id"),
        nullable=False
    )

    industry_id = Column(
        Integer,
        ForeignKey("industries.id"),
        nullable=False
    )

    title = Column(String(200), nullable=False)

    partnership_type = Column(String(100), default="MOU")  # MOU, Campus Hiring, Internship Program, Curriculum Collaboration, Research

    description = Column(Text, nullable=True)

    status = Column(String(50), default="Active")  # Active, Pending, Proposed, Completed

    established_date = Column(String(50), nullable=True)

    initiated_by = Column(String(50), default="industry")  # industry or institution


    institution = relationship(
        "Institution",
        back_populates="partnerships"
    )

    industry = relationship(
        "Industry",
        back_populates="partnerships"
    )


# =========================================================
# CAMPUS DRIVE
# =========================================================

class CampusDrive(Base):

    __tablename__ = "campus_drives"

    id = Column(Integer, primary_key=True, index=True)

    industry_id = Column(
        Integer,
        ForeignKey("industries.id"),
        nullable=False
    )

    institution_id = Column(
        Integer,
        ForeignKey("institutions.id"),
        nullable=True
    )

    title = Column(String(200), nullable=False)

    job_role = Column(String(150), nullable=False)

    package_or_stipend = Column(String(100), nullable=True)

    eligibility_criteria = Column(String(250), nullable=True)

    event_date = Column(String(100), nullable=True)

    mode = Column(String(50), default="Hybrid")  # On-Campus, Virtual, Hybrid

    status = Column(String(50), default="Upcoming")  # Upcoming, Active, Completed


    industry = relationship(
        "Industry",
        back_populates="campus_drives"
    )

    institution = relationship(
        "Institution",
        back_populates="campus_drives"
    )


# =========================================================
# ACADEMICIAN
# =========================================================

class Academician(Base):

    __tablename__ = "academicians"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    department = Column(String(150))

    designation = Column(String(100))


    user = relationship(
        "User",
        back_populates="academician"
    )


# =========================================================
# SKILL
# =========================================================

class Skill(Base):

    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(100),
        unique=True,
        nullable=False
    )


    student_skills = relationship(
        "StudentSkill",
        back_populates="skill"
    )

    opportunity_skills = relationship(
        "OpportunitySkill",
        back_populates="skill"
    )


# =========================================================
# STUDENT SKILL
# =========================================================

class StudentSkill(Base):

    __tablename__ = "student_skills"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False
    )

    skill_id = Column(
        Integer,
        ForeignKey("skills.id"),
        nullable=False
    )

    score = Column(Float, default=0)


    student = relationship(
        "Student",
        back_populates="skills"
    )

    skill = relationship(
        "Skill",
        back_populates="student_skills"
    )


# =========================================================
# OPPORTUNITY
# =========================================================

class Opportunity(Base):

    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)

    industry_id = Column(
        Integer,
        ForeignKey("industries.id"),
        nullable=False
    )

    title = Column(String(200), nullable=False)

    description = Column(Text)

    location = Column(String(200))

    opportunity_type = Column(String(50))


    industry = relationship(
        "Industry",
        back_populates="opportunities"
    )

    skills = relationship(
        "OpportunitySkill",
        back_populates="opportunity",
        cascade="all, delete-orphan"
    )

    applications = relationship(
        "Application",
        back_populates="opportunity",
        cascade="all, delete-orphan"
    )


# =========================================================
# OPPORTUNITY SKILL
# =========================================================

class OpportunitySkill(Base):

    __tablename__ = "opportunity_skills"

    id = Column(Integer, primary_key=True, index=True)

    opportunity_id = Column(
        Integer,
        ForeignKey("opportunities.id"),
        nullable=False
    )

    skill_id = Column(
        Integer,
        ForeignKey("skills.id"),
        nullable=False
    )

    required_level = Column(Float, default=0)


    opportunity = relationship(
        "Opportunity",
        back_populates="skills"
    )

    skill = relationship(
        "Skill",
        back_populates="opportunity_skills"
    )


# =========================================================
# APPLICATION
# =========================================================

class Application(Base):

    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False
    )

    opportunity_id = Column(
        Integer,
        ForeignKey("opportunities.id"),
        nullable=False
    )

    status = Column(
        String(50),
        default="Applied"
    )


    student = relationship(
        "Student",
        back_populates="applications"
    )

    opportunity = relationship(
        "Opportunity",
        back_populates="applications"
    )
# =========================================================
# ASSESSMENT MODELS
# =========================================================

class AssessmentQuestion(Base):

    __tablename__ = "assessment_questions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    skill_id = Column(
        Integer,
        ForeignKey("skills.id"),
        nullable=False
    )

    question = Column(
        Text,
        nullable=False
    )

    option_a = Column(
        String(255),
        nullable=False
    )

    option_b = Column(
        String(255),
        nullable=False
    )

    option_c = Column(
        String(255),
        nullable=False
    )

    option_d = Column(
        String(255),
        nullable=False
    )

    correct_answer = Column(
        String(1),
        nullable=False
    )


class AssessmentAttempt(Base):

    __tablename__ = "assessment_attempts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False
    )

    career_goal = Column(
        String(255),
        nullable=False
    )

    total_questions = Column(
        Integer,
        nullable=False
    )

    correct_answers = Column(
        Integer,
        nullable=False
    )

    score = Column(
        Float,
        nullable=False
    )


class AssessmentAnswer(Base):

    __tablename__ = "assessment_answers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    attempt_id = Column(
        Integer,
        ForeignKey("assessment_attempts.id"),
        nullable=False
    )

    question_id = Column(
        Integer,
        ForeignKey("assessment_questions.id"),
        nullable=False
    )

    selected_answer = Column(
        String(1),
        nullable=False
    )

    is_correct = Column(
        Boolean,
        nullable=False
    )
class CareerRequiredSkill(Base):
    __tablename__ = "career_required_skills"

    id = Column(Integer, primary_key=True, index=True)
    career_goal = Column(String(255), nullable=False)

    skill_id = Column(
        Integer,
        ForeignKey("skills.id"),
        nullable=False
    )

    required_level = Column(Float, nullable=False)