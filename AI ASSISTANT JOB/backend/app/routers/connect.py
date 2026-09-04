from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.database.models import (
    User,
    Institution,
    Industry,
    Partnership,
    CampusDrive,
    Student,
    Opportunity
)
from app.schemas.connect import (
    PartnershipCreate,
    PartnershipResponse,
    PartnershipStatusUpdate,
    CampusDriveCreate,
    CampusDriveResponse
)
from app.routers.auth import get_current_user


router = APIRouter(
    prefix="/connect",
    tags=["Industry-Institution Connect"]
)


# =========================================================
# 1. DIRECTORIES
# =========================================================

@router.get("/directories/industries")
def get_industry_directory(db: Session = Depends(get_db)):
    """List all registered industry partners with active stats"""
    industries = db.query(Industry).all()
    result = []
    for ind in industries:
        opp_count = db.query(Opportunity).filter(Opportunity.industry_id == ind.id).count()
        mou_count = db.query(Partnership).filter(
            Partnership.industry_id == ind.id,
            Partnership.status == "Active"
        ).count()
        result.append({
            "id": ind.id,
            "company_name": ind.company_name or "Corporate Partner",
            "industry_type": ind.industry_type or "Technology",
            "location": ind.location or "Pan India / Remote",
            "website": ind.website,
            "contact_email": ind.contact_email or (ind.user.email if ind.user else None),
            "active_opportunities": opp_count,
            "active_mous": mou_count
        })
    return result


@router.get("/directories/institutions")
def get_institution_directory(db: Session = Depends(get_db)):
    """List all registered academic institutions with cohort stats"""
    institutions = db.query(Institution).all()
    result = []
    for inst in institutions:
        student_count = db.query(Student).filter(
            func.lower(Student.college) == func.lower(inst.institution_name)
        ).count()
        mou_count = db.query(Partnership).filter(
            Partnership.institution_id == inst.id,
            Partnership.status == "Active"
        ).count()
        result.append({
            "id": inst.id,
            "institution_name": inst.institution_name or "Partner University",
            "location": inst.location or "India",
            "website": inst.website,
            "accreditation": inst.accreditation or "AICTE / UGC Recognized",
            "code": inst.code,
            "student_count": student_count,
            "active_mous": mou_count
        })
    return result


# =========================================================
# 2. PARTNERSHIPS & MOUs
# =========================================================

@router.get("/partnerships", response_model=List[PartnershipResponse])
def get_partnerships(
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List partnerships. If role is institution/industry, filters for relevant ones, or returns all active."""
    query = db.query(Partnership)

    if current_user.role == "institution":
        inst = db.query(Institution).filter(Institution.user_id == current_user.id).first()
        if inst:
            query = query.filter(Partnership.institution_id == inst.id)
    elif current_user.role == "industry":
        ind = db.query(Industry).filter(Industry.user_id == current_user.id).first()
        if ind:
            query = query.filter(Partnership.industry_id == ind.id)

    partnerships = query.order_by(Partnership.id.desc()).all()
    res = []
    for p in partnerships:
        inst = db.query(Institution).filter(Institution.id == p.institution_id).first()
        ind = db.query(Industry).filter(Industry.id == p.industry_id).first()
        res.append(PartnershipResponse(
            id=p.id,
            institution_id=p.institution_id,
            institution_name=inst.institution_name if inst else "Institution",
            industry_id=p.industry_id,
            company_name=ind.company_name if ind else "Industry Partner",
            title=p.title,
            partnership_type=p.partnership_type,
            description=p.description,
            status=p.status,
            established_date=p.established_date,
            initiated_by=p.initiated_by
        ))
    return res


@router.post("/partnerships", response_model=PartnershipResponse)
def create_partnership(
    data: PartnershipCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Propose an MOU or Partnership between Industry and Institution"""
    inst_id = data.institution_id
    ind_id = data.industry_id
    initiated = "industry"

    if current_user.role == "institution":
        inst = db.query(Institution).filter(Institution.user_id == current_user.id).first()
        if not inst:
            raise HTTPException(status_code=404, detail="Institution profile not found")
        inst_id = inst.id
        initiated = "institution"
        if not ind_id:
            raise HTTPException(status_code=400, detail="industry_id is required")

    elif current_user.role == "industry":
        ind = db.query(Industry).filter(Industry.user_id == current_user.id).first()
        if not ind:
            raise HTTPException(status_code=404, detail="Industry profile not found")
        ind_id = ind.id
        initiated = "industry"
        if not inst_id:
            raise HTTPException(status_code=400, detail="institution_id is required")
    else:
        raise HTTPException(status_code=403, detail="Only institutions or industry partners can create partnerships")

    now_str = datetime.now().strftime("%b %Y")
    partnership = Partnership(
        institution_id=inst_id,
        industry_id=ind_id,
        title=data.title,
        partnership_type=data.partnership_type or "MOU",
        description=data.description,
        status="Active",
        established_date=now_str,
        initiated_by=initiated
    )
    db.add(partnership)
    db.commit()
    db.refresh(partnership)

    inst_obj = db.query(Institution).filter(Institution.id == inst_id).first()
    ind_obj = db.query(Industry).filter(Industry.id == ind_id).first()

    return PartnershipResponse(
        id=partnership.id,
        institution_id=partnership.institution_id,
        institution_name=inst_obj.institution_name if inst_obj else "Institution",
        industry_id=partnership.industry_id,
        company_name=ind_obj.company_name if ind_obj else "Industry Partner",
        title=partnership.title,
        partnership_type=partnership.partnership_type,
        description=partnership.description,
        status=partnership.status,
        established_date=partnership.established_date,
        initiated_by=partnership.initiated_by
    )


@router.put("/partnerships/{partnership_id}/status")
def update_partnership_status(
    partnership_id: int,
    data: PartnershipStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept, Decline or update partnership agreement status"""
    partnership = db.query(Partnership).filter(Partnership.id == partnership_id).first()
    if not partnership:
        raise HTTPException(status_code=404, detail="Partnership agreement not found")

    partnership.status = data.status
    db.commit()
    return {"message": f"Partnership status updated to {data.status}", "status": data.status}


# =========================================================
# 3. CAMPUS DRIVES
# =========================================================

@router.get("/campus-drives", response_model=List[CampusDriveResponse])
def get_campus_drives(db: Session = Depends(get_db)):
    """List all upcoming and active campus hiring & internship drives"""
    drives = db.query(CampusDrive).order_by(CampusDrive.id.desc()).all()
    res = []
    for d in drives:
        ind = db.query(Industry).filter(Industry.id == d.industry_id).first()
        inst = db.query(Institution).filter(Institution.id == d.institution_id).first() if d.institution_id else None
        res.append(CampusDriveResponse(
            id=d.id,
            industry_id=d.industry_id,
            company_name=ind.company_name if ind else "Industry Recruiter",
            institution_id=d.institution_id,
            institution_name=inst.institution_name if inst else "All Partner Institutions",
            title=d.title,
            job_role=d.job_role,
            package_or_stipend=d.package_or_stipend,
            eligibility_criteria=d.eligibility_criteria,
            event_date=d.event_date,
            mode=d.mode or "Hybrid",
            status=d.status or "Upcoming"
        ))
    return res


@router.post("/campus-drives", response_model=CampusDriveResponse)
def create_campus_drive(
    data: CampusDriveCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Industry partner schedules a new campus hiring drive"""
    if current_user.role != "industry":
        raise HTTPException(status_code=403, detail="Only industry partners can schedule campus drives")

    ind = db.query(Industry).filter(Industry.user_id == current_user.id).first()
    if not ind:
        raise HTTPException(status_code=404, detail="Industry profile not found")

    drive = CampusDrive(
        industry_id=ind.id,
        institution_id=data.institution_id,
        title=data.title,
        job_role=data.job_role,
        package_or_stipend=data.package_or_stipend,
        eligibility_criteria=data.eligibility_criteria,
        event_date=data.event_date or "Q2 2026",
        mode=data.mode or "Hybrid",
        status="Upcoming"
    )
    db.add(drive)
    db.commit()
    db.refresh(drive)

    inst = db.query(Institution).filter(Institution.id == drive.institution_id).first() if drive.institution_id else None

    return CampusDriveResponse(
        id=drive.id,
        industry_id=drive.industry_id,
        company_name=ind.company_name,
        institution_id=drive.institution_id,
        institution_name=inst.institution_name if inst else "All Partner Institutions",
        title=drive.title,
        job_role=drive.job_role,
        package_or_stipend=drive.package_or_stipend,
        eligibility_criteria=drive.eligibility_criteria,
        event_date=drive.event_date,
        mode=drive.mode,
        status=drive.status
    )
