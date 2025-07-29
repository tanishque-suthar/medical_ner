# main.py

from fastapi import FastAPI
# --- CORRECTED IMPORTS ---
from api.routers import reports, patients, auth, xray
from db.database import engine
from db import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hospital Medical Analyzer API",
    description="The main backend server for the medical analysis platform.",
    version="1.0.0"
)

# Include all the different routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api/patients", tags=["Patients"])
app.include_router(reports.router, prefix="/api/patients", tags=["Medical Reports"])
app.include_router(xray.router, prefix="/api/patients", tags=["X-Ray Analysis"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Medical Analyzer API"}
