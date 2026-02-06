"""
Database models for RentSure auth system
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum

DATABASE_URL = "sqlite:///./rentsure.db"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class UserRole(str, enum.Enum):
    TENANT = "tenant"
    OWNER = "owner"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    role = Column(Enum(UserRole), default=UserRole.TENANT)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    city = Column(String, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="user", uselist=False)
    owner = relationship("Owner", back_populates="user", uselist=False)
    properties = relationship("Property", back_populates="owner")


class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    student_or_working = Column(String)  # "student" or "working"
    budget_preference = Column(Integer, nullable=True)  # in rupees
    gender_preference = Column(String, nullable=True)  # "male", "female", "any"
    
    # Relationships
    user = relationship("User", back_populates="tenant")


class Owner(Base):
    __tablename__ = "owners"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    property_type = Column(String)  # "residential", "commercial", etc.
    
    # Relationships
    user = relationship("User", back_populates="owner")


class Property(Base):
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), index=True)
    title = Column(String, index=True)
    description = Column(String)
    address = Column(String, nullable=True)
    city = Column(String, index=True)
    rent = Column(Integer)  # in rupees
    availability = Column(Boolean, default=True)
    safety_score = Column(Float, default=4.0)
    trust_score = Column(Float, default=4.0)
    nearby_college = Column(String, nullable=True)
    college_distance_km = Column(Float, nullable=True)
    nearby_office_hub = Column(String, nullable=True)
    office_distance_km = Column(Float, nullable=True)
    women_safety_index = Column(Float, default=4.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="properties")


def _ensure_property_address_column():
    """Add address column for existing databases if missing."""
    try:
        with engine.begin() as conn:
            columns = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(properties)").fetchall()]
            if "address" not in columns:
                conn.exec_driver_sql("ALTER TABLE properties ADD COLUMN address VARCHAR")
    except Exception:
        # Avoid hard crash on startup if migration fails
        pass


# Create tables on import
Base.metadata.create_all(bind=engine)
_ensure_property_address_column()


def get_db():
    """Dependency for getting database session in FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
