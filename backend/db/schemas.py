# app/db/schemas.py

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
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
    created_at: datetime
    
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

# --- X-Ray Analysis Schemas (NEW) ---

class PathologyResult(BaseModel):
    name: str
    probability: float
    detected: bool

class XRayAnalyzeResponse(BaseModel):
    pathologies: List[PathologyResult]
    generated_report: str
    segmentation_map: Optional[str] = None

class XRayCompareResponse(BaseModel):
    comparison_report: str

class QNARequest(BaseModel):
    report_context: str
    question: str

class QNAResponse(BaseModel):
    answer: str