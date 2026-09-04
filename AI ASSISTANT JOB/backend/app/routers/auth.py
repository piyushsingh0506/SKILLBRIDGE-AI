from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm
)
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm
)

from sqlalchemy.orm import Session

from app.database.database import get_db

from app.database.models import User, Student, Industry

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
    TokenResponse
)

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    response_model=UserResponse
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    allowed_roles = {
        "student",
        "industry",
        "academician",
        "institution"
    }

    if data.role not in allowed_roles:

        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )


    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )


    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    new_user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        role=data.role
    )

    db.add(new_user)
    db.flush()

    # Automatically initialize student or industry profile
    if new_user.role == "student":
        student_profile = Student(
            user_id=new_user.id,
            career_goal="AI Engineer"
        )
        db.add(student_profile)
    elif new_user.role == "industry":
        industry_profile = Industry(
            user_id=new_user.id,
            company_name=new_user.name
        )
        db.add(industry_profile)

    db.commit()
    db.refresh(new_user)

    return new_user


# =========================================================
# LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(
        form_data.password,
        user.password
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:

        raise HTTPException(
            status_code=400,
            detail="User account is inactive"
        )

    access_token = create_access_token({

        "sub": str(user.id),

        "email": user.email,

        "role": user.role

    })

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
# =========================================================
# CURRENT USER
# =========================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    payload = decode_access_token(token)


    if not payload:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


    user_id = payload.get("sub")


    if not user_id:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )


    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )


    return user


# =========================================================
# GET CURRENT USER
# =========================================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):

    return current_user