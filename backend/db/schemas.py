# app/db/schemas.py

from pydantic import BaseModel
from typing import List, Optional
from db.models import ReportType

# --- Base Schemas ---

class PatientBase(BaseModel):
    name: str
    age: int
    gender: str

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    reports: List["Report"] = []
    
    class Config:
        from_attributes = True

# --- Report Schemas ---

class ReportBase(BaseModel):
    filename: str
    report_type: ReportType
    results: dict

class ReportCreate(ReportBase):
    pass

class Report(ReportBase):
    id: int
    patient_id: int
    
    class Config:
        from_attributes = True

# --- User Schemas (for authentication) ---

class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

# Update forward references
Patient.model_rebuild()