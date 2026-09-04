from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str
    full_name: str
    email: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str

class StudentRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    college: str
    course: str
    branch: str
    graduation_year: int
    career_interest: Optional[str] = "Data Analyst"
    preferred_locations: Optional[str] = "Delhi, Bengaluru, Remote"

class IndustryRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    company_name: str
    industry_type: str
    company_size: str
    location: str
    website: Optional[str] = ""
    description: Optional[str] = ""

class AcademicianRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    institution: str
    department: str
    designation: str
    phone: Optional[str] = None
    specialization: Optional[str] = ""

class InstitutionRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    institution_name: str
    institution_type: str
    location: str
    website: Optional[str] = ""
    contact_person: Optional[str] = ""

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    full_name: str
    phone: Optional[str] = None
    avatar: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class DemoUser(BaseModel):
    email: str
    role: str
    name: str
    title: str
    description: str
