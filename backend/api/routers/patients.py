# app/api/routers/patients.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# --- CORRECTED IMPORTS ---
from db import schemas, crud
from db.database import get_db
from api.deps import get_current_user

router = APIRouter()

@router.get("/get-all-patients", response_model=List[schemas.Patient])
def get_all_patients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Retrieve a list of all patients. Requires authentication.
    """
    patients = crud.get_patients(db, skip=skip, limit=limit)
    return patients

@router.post("/add-patient", response_model=schemas.Patient, status_code=201)
def add_patient(
    patient: schemas.PatientCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Create a new patient. Requires authentication.
    """
    return crud.create_patient(db=db, patient=patient)

@router.get("/get-patient/{patient_id}", response_model=schemas.Patient)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Retrieve a single patient by their ID. Requires authentication.
    """
    db_patient = crud.get_patient(db, patient_id=patient_id)
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient

@router.delete("/delete-patient/{patient_id}", status_code=status.HTTP_200_OK)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Delete a patient and all their associated reports via CASCADE deletion.
    Requires 'Admin' or 'Doctor' role.
    
    This will automatically delete:
    - The patient record
    - All associated medical reports
    - All associated X-ray analyses
    - All associated comparison reports
    """
    if current_user.role not in ["Admin", "Doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete a patient."
        )
    
    db_patient = crud.get_patient(db, patient_id=patient_id)
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Count reports before deletion for response
    report_count = len(db_patient.reports)
    patient_name = db_patient.name
        
    try:
        crud.delete_patient(db=db, patient_id=patient_id)
        
        return {
            "message": f"Patient '{patient_name}' and {report_count} associated reports deleted successfully via CASCADE deletion.",
            "deleted_patient": {
                "id": patient_id,
                "name": patient_name,
                "deleted_reports_count": report_count
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete patient: {str(e)}"
        )
