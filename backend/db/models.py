# app/db/models.py

from sqlalchemy import Column, Integer, String, Enum, ForeignKey, JSON, Boolean, DateTime
from sqlalchemy.orm import relationship
from db.database import Base
import enum
from datetime import datetime, timezone, timedelta

# India timezone (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

def get_ist_now():
    """Get current time in Indian Standard Time"""
    return datetime.now(IST)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="Doctor")  # Doctor, Admin, Nurse, etc.
    is_active = Column(Boolean, default=True)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String) # Simple string for flexibility

    # This creates a one-to-many relationship.
    # A patient can have multiple reports.
    reports = relationship("Report", back_populates="patient", cascade="all, delete-orphan")


class ReportType(str, enum.Enum):
    """Enum for the different types of reports we can store."""
    PDF_NER = "PDF_NER"
    XRAY_ANALYSIS = "XRAY_ANALYSIS"
    XRAY_COMPARISON = "XRAY_COMPARISON"


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    report_type = Column(Enum(ReportType))
    
    # Using JSON type is highly flexible for storing structured results
    # like a list of entities or a full analysis report.
    results = Column(JSON)
    
    # Timestamp for when the report was created/uploaded (IST)
    created_at = Column(DateTime, default=get_ist_now)
    
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"))
    
    # This creates the many-to-one relationship back to the Patient.
    patient = relationship("Patient", back_populates="reports")
