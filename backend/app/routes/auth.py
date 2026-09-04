from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database.session import get_db
from app.models.models import (
    User, StudentProfile, IndustryProfile, AcademicianProfile, InstitutionProfile, Notification
)
from app.schemas.auth import (
    LoginRequest, Token, UserResponse,
    StudentRegisterRequest, IndustryRegisterRequest, AcademicianRegisterRequest, InstitutionRegisterRequest
)
from app.core.security import (
    verify_password, get_password_hash, create_access_token, get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register/student", response_model=Token)
def register_student(req: StudentRegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user = User(
        email=req.email,
        hashed_password=get_password_hash(req.password),
        role="student",
        full_name=req.full_name,
        phone=req.phone,
        avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={req.full_name.replace(' ', '')}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    student_profile = StudentProfile(
        user_id=user.id,
        college=req.college,
        course=req.course,
        branch=req.branch,
        graduation_year=req.graduation_year,
        career_interest=req.career_interest or "Data Analyst",
        preferred_locations=req.preferred_locations or "Delhi, Bengaluru, Remote",
        profile_completion=75.0,
        overall_skill_score=70.0,
        technical_score=72.0,
        soft_score=70.0,
        placement_readiness_score=68.0
    )
    db.add(student_profile)
    
    # Welcome notification
    welcome_notif = Notification(
        user_id=user.id,
        title="Welcome to Academia–Industry Connect!",
        message="Complete your AI Skill Assessment to get personalized job & internship recommendations.",
        type="alert"
    )
    db.add(welcome_notif)
    db.commit()
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name,
        "email": user.email
    }

@router.post("/register/industry", response_model=Token)
def register_industry(req: IndustryRegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user = User(
        email=req.email,
        hashed_password=get_password_hash(req.password),
        role="industry",
        full_name=req.company_name,
        avatar=f"https://api.dicebear.com/7.x/identicon/svg?seed={req.company_name.replace(' ', '')}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    industry_profile = IndustryProfile(
        user_id=user.id,
        company_name=req.company_name,
        industry_type=req.industry_type,
        company_size=req.company_size,
        location=req.location,
        website=req.website or "",
        description=req.description or f"Leading organization in {req.industry_type}",
        verified=True
    )
    db.add(industry_profile)
    db.commit()
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name,
        "email": user.email
    }

@router.post("/register/academician", response_model=Token)
def register_academician(req: AcademicianRegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user = User(
        email=req.email,
        hashed_password=get_password_hash(req.password),
        role="academician",
        full_name=req.name,
        phone=req.phone,
        avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={req.name.replace(' ', '')}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    acad_profile = AcademicianProfile(
        user_id=user.id,
        institution_name=req.institution,
        department=req.department,
        designation=req.designation,
        specialization=req.specialization or "Ayurvedic Informatics & Computer Science"
    )
    db.add(acad_profile)
    db.commit()
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name,
        "email": user.email
    }

@router.post("/register/institution", response_model=Token)
def register_institution(req: InstitutionRegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user = User(
        email=req.email,
        hashed_password=get_password_hash(req.password),
        role="institution",
        full_name=req.institution_name,
        avatar=f"https://api.dicebear.com/7.x/identicon/svg?seed={req.institution_name.replace(' ', '')}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    inst_profile = InstitutionProfile(
        user_id=user.id,
        institution_name=req.institution_name,
        institution_type=req.institution_type,
        location=req.location,
        website=req.website or "",
        contact_person=req.contact_person or ""
    )
    db.add(inst_profile)
    db.commit()
    
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name,
        "email": user.email
    }

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is deactivated")
        
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name,
        "email": user.email
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resp = {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "avatar": current_user.avatar,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }
    
    if current_user.role == "student" and current_user.student_profile:
        sp = current_user.student_profile
        resp["profile"] = {
            "student_id": sp.id,
            "college": sp.college,
            "course": sp.course,
            "branch": sp.branch,
            "graduation_year": sp.graduation_year,
            "career_interest": sp.career_interest,
            "cgpa": sp.cgpa,
            "profile_completion": sp.profile_completion,
            "overall_skill_score": sp.overall_skill_score,
            "technical_score": sp.technical_score,
            "soft_score": sp.soft_score,
            "placement_readiness_score": sp.placement_readiness_score
        }
    elif current_user.role == "industry" and current_user.industry_profile:
        ip = current_user.industry_profile
        resp["profile"] = {
            "industry_id": ip.id,
            "company_name": ip.company_name,
            "industry_type": ip.industry_type,
            "location": ip.location,
            "verified": ip.verified
        }
    elif current_user.role == "academician" and current_user.academician_profile:
        ap = current_user.academician_profile
        resp["profile"] = {
            "academician_id": ap.id,
            "institution_name": ap.institution_name,
            "department": ap.department,
            "designation": ap.designation
        }
    elif current_user.role == "institution" and current_user.institution_profile:
        inst = current_user.institution_profile
        resp["profile"] = {
            "institution_id": inst.id,
            "institution_name": inst.institution_name,
            "institution_type": inst.institution_type,
            "location": inst.location
        }
        
    return resp

@router.get("/demo-users")
def get_demo_users():
    """Returns quick-login credentials for hackathon evaluation and testing."""
    return [
        {
            "role": "student",
            "email": "aarav.sharma@aiia.gov.in",
            "name": "Aarav Sharma",
            "title": "B.Tech & AyurInformatics Scholar",
            "organization": "All India Institute of Ayurveda",
            "default_password": "password123"
        },
        {
            "role": "industry",
            "email": "hr@dabur-ayurtech.com",
            "name": "Dabur AyurTech India",
            "title": "Lead Talent Acquisition",
            "organization": "Dabur Healthcare & AI Labs",
            "default_password": "password123"
        },
        {
            "role": "academician",
            "email": "dr.rajesh.verma@aiia.gov.in",
            "name": "Dr. Rajesh Verma",
            "title": "Professor & Head of Ayurvedic Informatics",
            "organization": "All India Institute of Ayurveda",
            "default_password": "password123"
        },
        {
            "role": "institution",
            "email": "admin@aiia.ac.in",
            "name": "All India Institute of Ayurveda (AIIA)",
            "title": "Dean of Academic Affairs & Training",
            "organization": "Ministry of Ayush, Govt. of India",
            "default_password": "password123"
        },
        {
            "role": "admin",
            "email": "admin@academia-industry.gov.in",
            "name": "Platform Super Administrator",
            "title": "Chief Technology Officer",
            "organization": "Smart India Hackathon 2026",
            "default_password": "password123"
        }
    ]
