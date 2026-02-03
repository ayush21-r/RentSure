"""
Authentication routes for RentSure
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from models import User, Tenant, Owner, Property, UserRole, get_db
from schemas import (
    TenantSignupRequest, OwnerSignupRequest, LoginRequest,
    TokenResponse, UserResponse, TenantResponse, OwnerResponse,
    PropertyCreateRequest, PropertyResponse
)
from auth_utils import (
    hash_password, verify_password, create_access_token,
    verify_token, get_token_from_header
)

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register/tenant", response_model=TokenResponse)
def register_tenant(req: TenantSignupRequest, db: Session = Depends(get_db)):
    """Register a new tenant account"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        role=UserRole.TENANT,
        name=req.name,
        email=req.email,
        phone=req.phone,
        city=req.city,
        password_hash=hash_password(req.password)
    )
    db.add(user)
    db.flush()
    
    # Create tenant profile
    tenant = Tenant(
        user_id=user.id,
        student_or_working=req.student_or_working,
        budget_preference=req.budget_preference,
        gender_preference=req.gender_preference
    )
    db.add(tenant)
    db.commit()
    
    # Generate token
    token = create_access_token({"user_id": user.id, "role": user.role})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "role": user.role,
            "name": user.name,
            "email": user.email
        }
    }


@router.post("/register/owner", response_model=TokenResponse)
def register_owner(req: OwnerSignupRequest, db: Session = Depends(get_db)):
    """Register a new owner account"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        role=UserRole.OWNER,
        name=req.name,
        email=req.email,
        phone=req.phone,
        city=req.city,
        password_hash=hash_password(req.password)
    )
    db.add(user)
    db.flush()
    
    # Create owner profile
    owner = Owner(
        user_id=user.id,
        property_type=req.property_type
    )
    db.add(owner)
    db.commit()
    
    # Generate token
    token = create_access_token({"user_id": user.id, "role": user.role})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "role": user.role,
            "name": user.name,
            "email": user.email
        }
    }


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password"""
    # Find user
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate token
    token = create_access_token({"user_id": user.id, "role": user.role})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "role": user.role,
            "name": user.name,
            "email": user.email
        }
    }


@router.get("/me")
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Get current authenticated user info"""
    token = get_token_from_header(authorization)
    payload = verify_token(token)
    
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": user.id,
        "role": user.role,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "city": user.city
    }


# ============================================================================
# OWNER ROUTES - Property Management
# ============================================================================

owner_router = APIRouter(prefix="/owner", tags=["owner"])


@owner_router.get("/properties")
def get_owner_properties(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Get all properties for current owner"""
    token = get_token_from_header(authorization)
    payload = verify_token(token)
    
    if payload.get("role") != UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can access this route"
        )
    
    user_id = payload.get("user_id")
    properties = db.query(Property).filter(Property.owner_id == user_id).all()
    
    return {
        "properties": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "city": p.city,
                "rent": p.rent,
                "availability": p.availability,
                "safety_score": p.safety_score,
                "created_at": p.created_at.isoformat()
            }
            for p in properties
        ]
    }


@owner_router.post("/properties", response_model=dict)
def create_property(
    req: PropertyCreateRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Create a new property"""
    token = get_token_from_header(authorization)
    payload = verify_token(token)
    
    if payload.get("role") != UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can create properties"
        )
    
    user_id = payload.get("user_id")
    
    property = Property(
        owner_id=user_id,
        title=req.title,
        description=req.description,
        city=req.city,
        rent=req.rent,
        availability=req.availability,
        safety_score=req.safety_score,
        nearby_college=req.nearby_college,
        college_distance_km=req.college_distance_km,
        nearby_office_hub=req.nearby_office_hub,
        office_distance_km=req.office_distance_km
    )
    db.add(property)
    db.commit()
    
    return {
        "id": property.id,
        "title": property.title,
        "city": property.city,
        "rent": property.rent,
        "availability": property.availability,
        "message": "Property created successfully"
    }


@owner_router.put("/properties/{property_id}")
def update_property(
    property_id: int,
    req: PropertyCreateRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Update an existing property"""
    token = get_token_from_header(authorization)
    payload = verify_token(token)
    
    if payload.get("role") != UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can update properties"
        )
    
    user_id = payload.get("user_id")
    property = db.query(Property).filter(Property.id == property_id).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if property.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own properties"
        )
    
    # Update fields
    property.title = req.title
    property.description = req.description
    property.city = req.city
    property.rent = req.rent
    property.availability = req.availability
    property.safety_score = req.safety_score
    property.nearby_college = req.nearby_college
    property.college_distance_km = req.college_distance_km
    property.nearby_office_hub = req.nearby_office_hub
    property.office_distance_km = req.office_distance_km
    
    db.commit()
    
    return {
        "id": property.id,
        "message": "Property updated successfully"
    }


@owner_router.delete("/properties/{property_id}")
def delete_property(
    property_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Delete a property"""
    token = get_token_from_header(authorization)
    payload = verify_token(token)
    
    if payload.get("role") != UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can delete properties"
        )
    
    user_id = payload.get("user_id")
    property = db.query(Property).filter(Property.id == property_id).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if property.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own properties"
        )
    
    db.delete(property)
    db.commit()
    
    return {"message": "Property deleted successfully"}


@owner_router.patch("/properties/{property_id}/availability")
def toggle_availability(
    property_id: int,
    availability: bool,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Toggle property availability"""
    token = get_token_from_header(authorization)
    payload = verify_token(token)
    
    if payload.get("role") != UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners can update properties"
        )
    
    user_id = payload.get("user_id")
    property = db.query(Property).filter(Property.id == property_id).first()
    
    if not property:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Property not found"
        )
    
    if property.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own properties"
        )
    
    property.availability = availability
    db.commit()
    
    return {
        "id": property.id,
        "availability": property.availability,
        "message": "Availability updated"
    }
