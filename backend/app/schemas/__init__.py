from app.schemas.auth import (
    Token, TokenData, LoginRequest, UserBase, UserResponse, DemoUser,
    StudentRegisterRequest, IndustryRegisterRequest, AcademicianRegisterRequest, InstitutionRegisterRequest
)
from app.schemas.student import (
    SkillItem, StudentSkillCreate, ProjectCreate, ProjectResponse,
    CertificationCreate, CertificationResponse, StudentProfileUpdate, StudentProfileResponse
)
from app.schemas.opportunity import (
    InternshipCreate, InternshipResponse, JobCreate, JobResponse,
    ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse, CandidateMatchItem
)
from app.schemas.ai import (
    QuestionOption, AssessmentSubmitRequest, AssessmentResultResponse,
    SkillGapItem, SkillGapResponse, ResumeAnalysisRequest, ResumeAnalysisResponse,
    CareerRecommendationItem, AIMentorChatRequest, AIMentorChatResponse
)
from app.schemas.collaboration import (
    ResearchCollaborationCreate, ResearchCollaborationResponse,
    MentorshipCreate, MentorshipResponse, InstitutionAnalyticsResponse
)
