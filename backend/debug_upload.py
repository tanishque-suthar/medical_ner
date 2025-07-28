#!/usr/bin/env python3
"""
Debug script to test individual components of the upload process.
"""

import asyncio
from db.database import SessionLocal
from db import models, schemas, crud
from services import ner_service
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_upload_components():
    """Test each component of the upload process individually."""
    
    print("🔍 Testing upload components...")
    
    # Test 1: Database connection
    print("\n1. Testing database connection...")
    try:
        db = SessionLocal()
        # Test a simple query
        user_count = db.query(models.User).count()
        print(f"✅ Database connected. Found {user_count} users.")
        db.close()
    except Exception as e:
        print(f"❌ Database error: {e}")
        return
    
    # Test 2: Schema validation
    print("\n2. Testing schema validation...")
    try:
        # Test PatientCreate schema
        patient_data = {
            "name": "Test Patient",
            "age": 30,
            "gender": "Male"
        }
        patient_schema = schemas.PatientCreate(**patient_data)
        print(f"✅ PatientCreate schema works: {patient_schema}")
        
        # Test ReportCreate schema
        report_data = {
            "filename": "test.pdf",
            "report_type": models.ReportType.PDF_NER,
            "results": {"entities": []}
        }
        report_schema = schemas.ReportCreate(**report_data)
        print(f"✅ ReportCreate schema works: {report_schema}")
        
    except Exception as e:
        print(f"❌ Schema validation error: {e}")
        return
    
    # Test 3: CRUD operations
    print("\n3. Testing CRUD operations...")
    try:
        db = SessionLocal()
        
        # Test patient creation
        patient = schemas.PatientCreate(name="Debug Patient", age=25, gender="Female")
        db_patient = crud.create_patient(db, patient)
        print(f"✅ Patient created with ID: {db_patient.id}")
        
        # Test report creation
        report = schemas.ReportCreate(
            filename="debug.pdf",
            report_type=models.ReportType.PDF_NER,
            results={"test": "data"}
        )
        db_report = crud.create_report_for_patient(db, report, db_patient.id)
        print(f"✅ Report created with ID: {db_report.id}")
        
        # Clean up
        db.delete(db_report)
        db.delete(db_patient)
        db.commit()
        db.close()
        print("✅ Cleanup completed")
        
    except Exception as e:
        print(f"❌ CRUD operations error: {e}")
        db.rollback()
        db.close()
        return
    
    # Test 4: NER service (this might fail if service isn't running)
    print("\n4. Testing NER service...")
    try:
        test_text = "Patient name: John Doe. Age: 35. Has diabetes."
        result = await ner_service.call_ner_service(test_text)
        print(f"✅ NER service works: {result}")
    except Exception as e:
        print(f"⚠️ NER service error (this is OK if service isn't running): {e}")
    
    # Test 5: Text extraction
    print("\n5. Testing text extraction...")
    try:
        test_text = "Full name of patient: Mr. John Smith\nAge of patient: 45"
        details = crud.extract_patient_details_from_text(test_text)
        print(f"✅ Text extraction works: {details}")
    except Exception as e:
        print(f"❌ Text extraction error: {e}")

    print("\n🎉 Component testing completed!")

if __name__ == "__main__":
    asyncio.run(test_upload_components())
