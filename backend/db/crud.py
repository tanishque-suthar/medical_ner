# app/db/crud.py

from sqlalchemy.orm import Session
from typing import List, Optional
from db import models, schemas
import re

# --- Patient CRUD Functions ---

def get_patient(db: Session, patient_id: int) -> Optional[models.Patient]:
    """Retrieves a single patient by their ID."""
    return db.query(models.Patient).filter(models.Patient.id == patient_id).first()

def get_patient_by_name(db: Session, name: str) -> Optional[models.Patient]:
    """
    Retrieves the first patient found with a matching name.
    Note: In a real-world scenario, you'd use a more robust identifier than name.
    """
    normalized_name = name.strip().title()  # "john smith" -> "John Smith"
    return db.query(models.Patient).filter(
        models.Patient.name.ilike(normalized_name)
    ).first()

def get_patients_by_name(db: Session, name: str) -> List[models.Patient]:
    """
    Retrieves ALL patients with a matching name (handles duplicates).
    """
    normalized_name = name.strip().title()  # "john smith" -> "John Smith"
    return db.query(models.Patient).filter(
        models.Patient.name.ilike(normalized_name)
    ).all()

def get_patients(db: Session, skip: int = 0, limit: int = 100) -> List[models.Patient]:
    """
    Retrieves a list of patients with pagination.
    """
    return db.query(models.Patient).offset(skip).limit(limit).all()

def create_patient(db: Session, patient: schemas.PatientCreate) -> models.Patient:
    """Creates a new patient record in the database."""
    db_patient = models.Patient(name=patient.name, age=patient.age, gender=patient.gender)
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def delete_patient(db: Session, patient_id: int) -> Optional[models.Patient]:
    """Deletes a patient from the database by their ID."""
    db_patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if db_patient:
        db.delete(db_patient)
        db.commit()
    return db_patient

# --- Report CRUD Functions ---

def create_report_for_patient(db: Session, report: schemas.ReportCreate, patient_id: int) -> models.Report:
    """Creates a new report record and associates it with a patient."""
    db_report = models.Report(**report.dict(), patient_id=patient_id)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_report(db: Session, report_id: int) -> Optional[models.Report]:
    """Retrieves a single report by its ID."""
    return db.query(models.Report).filter(models.Report.id == report_id).first()

def delete_report(db: Session, report_id: int) -> Optional[models.Report]:
    """Deletes a report from the database by its ID."""
    db_report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if db_report:
        db.delete(db_report)
        db.commit()
    return db_report

def get_reports_for_patient(db: Session, patient_id: int) -> List[models.Report]:
    """Retrieves all reports for a specific patient."""
    return db.query(models.Report).filter(models.Report.patient_id == patient_id).all()

# --- Utility Functions ---

def extract_patient_details_from_text(text: str) -> dict:
    """
    Extract patient details using comprehensive regex patterns.
    Based on proven patterns from previous implementation.
    """
    details = {"name": None, "age": None, "gender": None}
    
    # Name extraction patterns (from your proven implementation)
    name_patterns = [
        r'patient\s+name\s*:\s*(?:(?:mr|mrs|ms|dr)\.?\s+)?([A-Z][A-Z\s]+?)(?=\s*(?:study|age|referring|sex|gender|$|\n))',
        r'(?:patient\s+)?name\s*:\s*(?:(?:mr|mrs|ms|dr)\.?\s+)?([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,4})(?=\s*(?:\n|$|study|age|dob|sex|gender|mrn|address|phone))',
        r'\b(?:mr|mrs|ms)\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b',
        r'\bname\s*:\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\b',
        r'\b(?:name|patient)\s*[:=]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b',
        r'your patient\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b',
        r're:.*?for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),\s*MRN',
        r'dear\s+dr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)[:,]',
        r'patient\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+),?\s+(?:aged?|age|is)',
    ]
    
    # Age extraction patterns (from your proven implementation)
    age_patterns = [
        r'age\s*[:=]\s*(\d{1,3})(?:\s*(?:years?|yrs?|y\.?o\.?))?',
        r'\((\d{1,3})\s*(?:years?\s*old|yrs?\s*old|y\.o\.)\)',
        r'(?:age|aged?)\s*[:=]?\s*(\d{1,3})\s*(?:years?|yrs?|y\.o\.?)?',
        r'(\d{1,3})\s*(?:years?\s*old|yrs?\s*old|y\.o\.)',
        r'aged?\s+(\d{1,3})',
        r'age\s*[:=]\s*(\d{1,3})',
        r'DOB:\s*\d{2}/\d{2}/\d{4}\s*\((\d{1,3})\s*(?:years?\s*old|yrs?\s*old|y\.o\.)\)',
        r'(\d{1,3})\s*[-]?\s*year[-\s]*old',
    ]
    
    # Gender extraction patterns (from your proven implementation)
    gender_patterns = [
        r'(?:gender|sex)\s*[:=]\s*(male|female|m|f)',
        r'\b(male|female)\b(?!\s*(?:patient|doctor|nurse))',
        r'(?:mr\.?|male)\b',  # Male indicators
        r'(?:mrs\.?|ms\.?|female)\b',  # Female indicators
    ]
    
    # Extract name with improved logic
    for pattern in name_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            # Get the first non-empty group
            name = next((group for group in match.groups() if group), "").strip()
            if name and len(name) > 1 and len(name) < 50:
                # Clean up the name (remove extra spaces, common prefixes)
                name = re.sub(r'\s+', ' ', name)  # Multiple spaces to single
                name = re.sub(r'^(?:mr\.?|mrs\.?|ms\.?|dr\.?)\s*', '', name, flags=re.IGNORECASE)
                if name and not re.match(r'^\d+$', name):  # Not just numbers
                    details["name"] = name.title()
                    break
    
    # Extract age with validation
    for pattern in age_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            age_str = match.group(1)
            try:
                age = int(age_str)
                if 0 <= age <= 120:  # Reasonable age range
                    details["age"] = age
                    break
            except ValueError:
                continue
    
    # Extract gender with improved logic
    for pattern in gender_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            gender_text = match.group(1) if match.groups() else match.group(0)
            gender_lower = gender_text.lower()
            
            if gender_lower in ['male', 'm', 'mr', 'mr.']:
                details["gender"] = "Male"
                break
            elif gender_lower in ['female', 'f', 'mrs', 'mrs.', 'ms', 'ms.']:
                details["gender"] = "Female"
                break
    
    # Fallback: Search for gender keywords in broader context
    if not details["gender"]:
        if re.search(r'\bmale\b(?!\s*(?:patient|doctor|nurse))', text, re.IGNORECASE):
            # Check if 'female' appears nearby to avoid false positives
            if not re.search(r'\bfemale\b', text, re.IGNORECASE):
                details["gender"] = "Male"
        elif re.search(r'\bfemale\b', text, re.IGNORECASE):
            details["gender"] = "Female"
    
    # Set defaults for missing values
    if not details["age"]:
        details["age"] = 0  # Default age
    if not details["gender"]:
        details["gender"] = "Unknown"  # Default gender
        
    return details

# --- User CRUD Functions ---

def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    """Get a user by username."""
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str) -> models.User:
    """Create a new user."""
    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        role=user.role,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
