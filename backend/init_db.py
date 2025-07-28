#!/usr/bin/env python3
"""
Initialize the database with tables and demo users.
Run this once to set up your hospital database.
"""

from db.database import Base, engine
from db import models
from create_demo_users import create_demo_users

def init_db():
    """Initialize database tables and create demo users."""
    print("🏥 Initializing Hospital Medical Analyzer Database...")
    
    # Create all database tables
    print("📊 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
    
    # Create demo users
    print("\n👥 Setting up demo user accounts...")
    create_demo_users()
    
    print("\n🎉 Database initialization complete!")
    print("🚀 You can now start the server with: uvicorn main:app --reload")

if __name__ == "__main__":
    init_db()
