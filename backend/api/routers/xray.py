# app/api/routers/xray.py

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db import schemas, crud, models
from db.database import get_db
from services import xray_service
from api.deps import get_current_user

router = APIRouter()

@router.post("/analyze-xray/{patient_id}", response_model=schemas.Report)
async def analyze_xray(
    patient_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Analyze an X-ray for a specific patient and save the analysis as a new report.
    """
    # Verify patient exists
    db_patient = crud.get_patient(db, patient_id=patient_id)
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Call the AI service
    try:
        analysis_result = await xray_service.call_xray_analyze(file)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"X-Ray Analysis Service unavailable: {e}")

    # Create a new report in the database with the results
    report_to_create = schemas.ReportCreate(
        filename=file.filename,
        report_type=models.ReportType.XRAY_ANALYSIS,
        results=analysis_result
    )
    db_report = crud.create_report_for_patient(db, report=report_to_create, patient_id=patient_id)
    
    return db_report

@router.post("/compare-xrays/{patient_id}", response_model=schemas.Report)
async def compare_xrays(
    patient_id: int,
    previous_xray: UploadFile = File(...),
    current_xray: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Compare two X-rays for a specific patient and save the result as a new report.
    """
    db_patient = crud.get_patient(db, patient_id=patient_id)
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    try:
        comparison_result = await xray_service.call_xray_compare(previous_xray, current_xray)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"X-Ray Comparison Service unavailable: {e}")

    report_to_create = schemas.ReportCreate(
        filename=f"comparison_{previous_xray.filename}_vs_{current_xray.filename}",
        report_type=models.ReportType.XRAY_COMPARISON,
        results=comparison_result
    )
    db_report = crud.create_report_for_patient(db, report=report_to_create, patient_id=patient_id)
    
    return db_report

@router.post("/ask-question", response_model=schemas.QNAResponse)
async def ask_question(
    payload: schemas.QNARequest,
    current_user: schemas.User = Depends(get_current_user)
):
    """
    Ask a question about a medical report context.
    This is a stateless endpoint that doesn't interact with the database.
    """
    try:
        qna_result = await xray_service.call_xray_qna(payload.report_context, payload.question)
        return qna_result
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"X-Ray Q&A Service unavailable: {e}")
