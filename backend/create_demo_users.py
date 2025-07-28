#!/usr/bin/env python3
"""
Script to create demo users for the hospital staff authentication system.
Run this after starting the server to create initial login credentials.
"""

from db.database import SessionLocal
from db import models, schemas, crud
from core.security import get_password_hash

def create_demo_users():
    """Create demo users for hospital staff."""
    db = SessionLocal()
    try:
        # Check if users already exist
        existing_doctor = crud.get_user_by_username(db, "doctor")
        existing_admin = crud.get_user_by_username(db, "admin")
        
        if existing_doctor and existing_admin:
            print("Demo users already exist!")
            print("\nExisting Demo Credentials:")
            print("👨‍⚕️ Doctor - Username: doctor, Password: password123")
            print("👩‍💼 Admin - Username: admin, Password: admin123")
            return
        
        # Create demo doctor
        if not existing_doctor:
            doctor_data = schemas.UserCreate(
                username="doctor",
                password="password123",
                role="Doctor"
            )
            crud.create_user(db, doctor_data, get_password_hash("password123"))
            print("✅ Created demo doctor account")
        
        # Create demo admin
        if not existing_admin:
            admin_data = schemas.UserCreate(
                username="admin", 
                password="admin123",
                role="Admin"
            )
            crud.create_user(db, admin_data, get_password_hash("admin123"))
            print("✅ Created demo admin account")
        
        # Create demo nurse
        existing_nurse = crud.get_user_by_username(db, "nurse")
        if not existing_nurse:
            nurse_data = schemas.UserCreate(
                username="nurse",
                password="nurse123", 
                role="Nurse"
            )
            crud.create_user(db, nurse_data, get_password_hash("nurse123"))
            print("✅ Created demo nurse account")
        
        print("\n🎉 Demo users created successfully!")
        print("\n📋 Demo Credentials for Hospital Staff:")
        print("=" * 50)
        print("👨‍⚕️ Doctor Login:")
        print("   Username: doctor")
        print("   Password: password123")
        print()
        print("👩‍💼 Admin Login:")
        print("   Username: admin") 
        print("   Password: admin123")
        print()
        print("👩‍⚕️ Nurse Login:")
        print("   Username: nurse")
        print("   Password: nurse123")
        print("=" * 50)
        print("\n🌐 Test the login at: http://127.0.0.1:8000/docs")
        print("   1. Click 'Authorize' button")
        print("   2. Use any of the credentials above")
        print("   3. Access protected endpoints")
        
    except Exception as e:
        print(f"❌ Error creating demo users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🏥 Creating demo users for Hospital Medical Analyzer...")
    create_demo_users()
