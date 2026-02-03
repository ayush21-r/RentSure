"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from models import UserRole


class TenantSignupRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    city: str
    student_or_working: str  # "student" or "working"
    budget_preference: Optional[int] = None
    gender_preference: Optional[str] = None
    password: str


class OwnerSignupRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    city: str
    property_type: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserResponse(BaseModel):
    id: int
    role: UserRole
    name: str
    email: str
    phone: str
    city: str
    created_at: str
    
    class Config:
        from_attributes = True


class TenantResponse(UserResponse):
    student_or_working: str
    budget_preference: Optional[int]
    gender_preference: Optional[str]


class OwnerResponse(UserResponse):
    property_type: str


class PropertyCreateRequest(BaseModel):
    title: str
    description: str
    city: str
    rent: int
    availability: bool = True
    safety_score: float = 4.0
    nearby_college: Optional[str] = None
    college_distance_km: Optional[float] = None
    nearby_office_hub: Optional[str] = None
    office_distance_km: Optional[float] = None


class PropertyResponse(BaseModel):
    id: int
    owner_id: int
    title: str
    description: str
    city: str
    rent: int
    availability: bool
    safety_score: float
    trust_score: float
    nearby_college: Optional[str]
    college_distance_km: Optional[float]
    nearby_office_hub: Optional[str]
    office_distance_km: Optional[float]
    women_safety_index: float
    created_at: str
    
    class Config:
        from_attributes = True
