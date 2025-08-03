# app/api/routers/reports.py

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pdfplumber
import io
import logging
import traceback

# --- CORRECTED IMPORTS ---
# Changed from relative (...db) to absolute (db)
from db import schemas, crud, models
from db.database import get_db
from services import ner_service
from api.deps import get_current_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/test")
async def test_endpoint():
    """Test endpoint to verify the router is working"""
    return {"message": "Reports router is working!", "status": "ok"}

@router.post("/upload-report", status_code=201)
async def upload_report(
    file: UploadFile = File(...),
    patient_id: int = None,  # Optional: if provided, use this specific patient
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Upload and process a medical report. 
    
    Args:
        file: PDF file containing medical report
        patient_id: Optional - ID of existing patient to attach report to.
                   If not provided, creates new patient with extracted name.
        
    Workflow:
        1. If patient_id provided -> attach report to that patient
        2. If no patient_id -> extract name and create new patient
        
    Returns:
        Success response with patient and report information
    """
    logger.info(f"User {current_user.username} uploading file: {file.filename}")
    logger.info(f"Target patient ID: {patient_id if patient_id else 'Auto-create new patient'}")
    
    if file.content_type != "application/pdf":
        logger.warning(f"Invalid file type: {file.content_type} for file: {file.filename}")
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is supported.")

    try:
        # Read PDF file
        logger.info("Reading PDF file...")
        pdf_bytes = await file.read()
        
        # Extract text from PDF
        logger.info("Extracting text from PDF...")
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            extracted_text = "".join(page.extract_text() or "" for page in pdf.pages)
        
        if not extracted_text.strip():
            logger.warning("No text could be extracted from PDF")
            raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

        logger.info(f"Extracted {len(extracted_text)} characters from PDF")
        
        # Call NER service
        logger.info("Calling NER service...")
        try:
            ner_response = await ner_service.call_ner_service(extracted_text)
            entities = ner_response.get("entities", [])
            logger.info(f"NER service returned {len(entities)} entities")
        except Exception as ner_error:
            logger.error(f"NER service error: {str(ner_error)}")
            # Continue without NER results if service fails
            entities = []
            logger.warning("Continuing without NER results due to service error")

        # Handle patient assignment logic
        if patient_id:
            # User specified a patient ID - use that patient
            logger.info(f"Using specified patient ID: {patient_id}")
            db_patient = crud.get_patient(db, patient_id=patient_id)
            
            if not db_patient:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Patient with ID {patient_id} not found"
                )
                
            action_taken = "used_specified_patient"
            logger.info(f"Found specified patient: {db_patient.name} (ID: {db_patient.id})")
            
        else:
            # No patient ID provided - extract name and create new patient
            logger.info("No patient ID provided, extracting name and creating new patient")
            
            # Extract patient details
            logger.info("Extracting patient details...")
            patient_details = crud.extract_patient_details_from_text(extracted_text)
            logger.info(f"Extracted patient details: {patient_details}")
            
            # Handle name extraction failure
            if not patient_details.get("name"):
                logger.warning("Could not extract patient name from report")
                raise HTTPException(
                    status_code=400,
                    detail={
                        "status": "name_extraction_failed",
                        "message": "Could not extract patient name from document",
                        "action_required": "manual_name_input_or_patient_id", 
                        "suggestion": "Use search-patients-by-name to find existing patients, or use upload-report-with-name endpoint",
                        "extracted_text_preview": extracted_text[:200] + "..." if len(extracted_text) > 200 else extracted_text
                    }
                )

            # Create new patient with extracted details
            extracted_name = patient_details["name"]
            logger.info(f"Successfully extracted patient name: {extracted_name}")
            
            patient_to_create = schemas.PatientCreate(**patient_details)
            db_patient = crud.create_patient(db, patient=patient_to_create)
            action_taken = "created_new_patient"
            logger.info(f"Created new patient with ID: {db_patient.id}")

        # Create report
        logger.info("Creating report...")
        report_to_create = schemas.ReportCreate(
            filename=file.filename,
            report_type=models.ReportType.PDF_NER,
            results={"entities": entities, "text_length": len(extracted_text)}
        )
        report = crud.create_report_for_patient(db, report=report_to_create, patient_id=db_patient.id)
        logger.info(f"Created report with ID: {report.id}")
        
        logger.info("Upload completed successfully")
        
        # Prepare response with detailed information
        response = {
            "status": "success",
            "action": action_taken,
            "patient_id": db_patient.id,
            "patient_name": db_patient.name,
            "report_id": report.id,
            "entities_found": len(entities)
        }
        
        return response
        
    except HTTPException:
        # Re-raise HTTP exceptions (they're already handled properly)
        raise
    except Exception as e:
        logger.error(f"Unexpected error during upload: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/upload-report-with-name", status_code=201)
async def upload_report_with_manual_name(
    patient_name: str,
    file: UploadFile = File(...),
    patient_age: int = None,
    patient_gender: str = None,
    patient_id: int = None,  # Optional: if provided, ignore name and use this patient
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Upload a medical report with manually provided patient information.
    Use this when automatic name extraction fails.
    
    Args:
        patient_name: Patient name (required if no patient_id)
        file: PDF file containing medical report
        patient_age: Patient age (optional)
        patient_gender: Patient gender (optional) 
        patient_id: Optional - ID of existing patient to use instead of creating new
    """
    logger.info(f"User {current_user.username} uploading file with manual name: {patient_name}")
    logger.info(f"Target patient ID: {patient_id if patient_id else 'Create new with provided name'}")
    
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF is supported.")

    try:
        # Read and process PDF (same as before)
        pdf_bytes = await file.read()
        
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            extracted_text = "".join(page.extract_text() or "" for page in pdf.pages)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

        # Call NER service
        try:
            ner_response = await ner_service.call_ner_service(extracted_text)
            entities = ner_response.get("entities", [])
        except Exception:
            entities = []
            logger.warning("NER service unavailable, continuing without entities")

        # Handle patient assignment logic
        if patient_id:
            # User specified a patient ID - use that patient
            logger.info(f"Using specified patient ID: {patient_id}")
            db_patient = crud.get_patient(db, patient_id=patient_id)
            
            if not db_patient:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Patient with ID {patient_id} not found"
                )
                
            action_taken = "used_specified_patient"
            logger.info(f"Found specified patient: {db_patient.name} (ID: {db_patient.id})")
            
        else:
            # Use manually provided patient details to create new patient
            patient_details = {
                "name": patient_name.strip(),
                "age": patient_age or 0,
                "gender": patient_gender or "Unknown"
            }
            
            patient_to_create = schemas.PatientCreate(**patient_details)
            db_patient = crud.create_patient(db, patient=patient_to_create)
            action_taken = "created_new_patient"
            logger.info(f"Created new patient with manual details: {db_patient.name} (ID: {db_patient.id})")

        # Create report
        report_to_create = schemas.ReportCreate(
            filename=file.filename,
            report_type=models.ReportType.PDF_NER,
            results={"entities": entities, "text_length": len(extracted_text), "manual_input": True}
        )
        report = crud.create_report_for_patient(db, report=report_to_create, patient_id=db_patient.id)
        
        response = {
            "status": "success",
            "action": action_taken,
            "patient_id": db_patient.id,
            "patient_name": db_patient.name,
            "report_id": report.id,
            "entities_found": len(entities),
            "manual_input_used": True
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in manual upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/search-patients-by-name")
async def search_patients_by_name(
    name: str,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Search for existing patients by exact name match.
    Useful for frontend to show duplicate options before upload.
    """
    if not name.strip():
        raise HTTPException(status_code=400, detail="Name parameter is required")
    
    patients = crud.get_patients_by_name(db, name=name.strip())
    
    return {
        "search_name": name,
        "matches_found": len(patients),
        "patients": [
            {
                "id": p.id,
                "name": p.name,
                "age": p.age,
                "gender": p.gender,
                "reports_count": len(p.reports)
            }
            for p in patients
        ]
    }

@router.post("/debug-pdf")
def debug_pdf_extraction(
    file: UploadFile = File(...),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Debug endpoint to see what text is extracted from PDF and what patient details are found.
    This helps troubleshoot PDF processing issues.
    """
    try:
        # Read PDF content
        pdf_bytes = file.file.read()
        
        # Extract text from PDF
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            extracted_text = "".join(page.extract_text() or "" for page in pdf.pages)
        
        # Extract patient details
        patient_details = crud.extract_patient_details_from_text(extracted_text)
        
        return {
            "filename": file.filename,
            "text_length": len(extracted_text),
            "extracted_text": extracted_text[:1000] + "..." if len(extracted_text) > 1000 else extracted_text,  # First 1000 chars
            "patient_details": patient_details,
            "full_text": extracted_text  # Include full text for debugging
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debug error: {str(e)}")

@router.delete("/delete-report/{report_id}", response_model=dict)
async def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Delete a specific report by ID.
    
    Args:
        report_id: ID of the report to delete
        
    Returns:
        Success message confirming deletion
        
    Security:
        - Only Admins and Doctors can delete reports
        - Nurses and other roles are denied access
    """
    logger.info(f"User {current_user.username} ({current_user.role}) attempting to delete report ID: {report_id}")
    
    # Check user permissions
    if current_user.role not in ["Admin", "Doctor"]:
        logger.warning(f"Access denied: User {current_user.username} with role {current_user.role} tried to delete report")
        raise HTTPException(
            status_code=403, 
            detail="Access denied. Only Admins and Doctors can delete reports."
        )
    
    # Check if report exists
    db_report = crud.get_report(db, report_id=report_id)
    if not db_report:
        logger.warning(f"Report with ID {report_id} not found")
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )
    
    # Get patient info for logging
    patient_name = db_report.patient.name if db_report.patient else "Unknown"
    report_filename = db_report.filename
    
    try:
        # Delete the report
        deleted_report = crud.delete_report(db, report_id=report_id)
        
        if deleted_report:
            logger.info(f"Successfully deleted report: {report_filename} for patient: {patient_name}")
            return {
                "message": "Report deleted successfully",
                "deleted_report": {
                    "id": deleted_report.id,
                    "filename": deleted_report.filename,
                    "patient_name": patient_name
                }
            }
        else:
            logger.error(f"Failed to delete report ID: {report_id}")
            raise HTTPException(
                status_code=500,
                detail="Failed to delete report"
            )
            
    except Exception as e:
        logger.error(f"Error deleting report ID {report_id}: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while deleting the report: {str(e)}"
        )

@router.get("/get-report/{report_id}", response_model=schemas.Report)
async def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Get a specific report by ID.
    
    Args:
        report_id: ID of the report to retrieve
        
    Returns:
        Report details including analysis results
    """
    logger.info(f"User {current_user.username} requesting report ID: {report_id}")
    
    # Get the report
    db_report = crud.get_report(db, report_id=report_id)
    if not db_report:
        logger.warning(f"Report with ID {report_id} not found")
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )
    
    logger.info(f"Successfully retrieved report: {db_report.filename}")
    return db_report
