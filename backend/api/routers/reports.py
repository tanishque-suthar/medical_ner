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

@router.post("/upload", response_model=schemas.Patient, status_code=201)
async def upload_report_and_extract_entities(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user) # Dependency for authentication
):
    """
    Handles the entire NER workflow for an uploaded PDF report.
    Requires user to be authenticated.
    """
    logger.info(f"User {current_user.username} uploading file: {file.filename}")
    
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

        # Extract patient details
        logger.info("Extracting patient details...")
        patient_details = crud.extract_patient_details_from_text(extracted_text)
        logger.info(f"Extracted patient details: {patient_details}")
        
        if not patient_details.get("name"):
            logger.warning("Could not find patient name in report")
            # Instead of failing, create a default patient name based on filename and timestamp
            import datetime
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            default_name = f"Patient_{file.filename.split('.')[0]}_{timestamp}"
            patient_details["name"] = default_name
            logger.info(f"Using default patient name: {default_name}")
            
            # Provide a helpful error message with suggestions
            suggestion_msg = (
                f"Could not automatically extract patient name from the report. "
                f"Created patient with name '{default_name}'. "
                f"To improve automatic extraction, ensure the PDF contains text like: "
                f"'Patient Name: John Doe', 'Name: John Doe', or 'Patient: John Doe'. "
                f"You can use the /reports/debug-pdf endpoint to see what text was extracted."
            )
            logger.warning(suggestion_msg)

        # Find or create patient
        logger.info(f"Looking for existing patient: {patient_details['name']}")
        db_patient = crud.get_patient_by_name(db, name=patient_details["name"])
        
        if not db_patient:
            logger.info("Creating new patient...")
            patient_to_create = schemas.PatientCreate(**patient_details)
            db_patient = crud.create_patient(db, patient=patient_to_create)
            logger.info(f"Created new patient with ID: {db_patient.id}")
        else:
            logger.info(f"Found existing patient with ID: {db_patient.id}")

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
        return db_patient
        
    except HTTPException:
        # Re-raise HTTP exceptions (they're already handled properly)
        raise
    except Exception as e:
        logger.error(f"Unexpected error during upload: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

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
