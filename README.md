# Medical Named Entity Recognition System

A comprehensive medical analysis platform that combines natural language processing and computer vision to extract medical entities from text and analyze X-ray images. The system consists of a FastAPI backend, React frontend, and two AI microservices.

## Overview

This project provides healthcare professionals and researchers with automated tools to:

- Extract medical named entities from clinical text and documents
- Analyze X-ray images for pathology detection
- Generate descriptive medical reports
- Compare X-ray images for clinical progression tracking
- Answer questions based on medical reports

## Features

### Medical NER Service
- Extract medical entities (diseases, symptoms, medications, procedures) from text
- Confidence scoring for each identified entity
- Support for various clinical document formats
- RESTful API for easy integration

### X-Ray Analysis Service
- Pathology detection using ChexNet model
- Automated report generation using BiomedCLIP
- X-ray image comparison for longitudinal studies
- Question-and-answer functionality based on medical reports

### Backend API
- Patient management system
- Medical report storage and retrieval
- X-ray image upload and processing
- Authentication and authorization
- CORS-enabled for frontend integration

### Frontend Application
- User-friendly interface for medical data input
- X-ray image upload and visualization
- Real-time entity extraction display
- Patient record management
- Dark mode support

## Technology Stack

### Backend
- **Framework:** FastAPI
- **ORM:** SQLAlchemy
- **Database:** SQLite (configurable)
- **Authentication:** JWT with bcrypt hashing
- **Server:** Uvicorn

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **HTTP Client:** Axios
- **Routing:** React Router DOM
- **Linter:** ESLint

### AI Services
- **NER Model:** FastAPI microservice
- **X-Ray Analysis:** ChexNet and BiomedCLIP
- **Image Processing:** PIL (Pillow)

## Project Structure

```
summer_medNer/
├── backend/                    # Main FastAPI backend
│   ├── api/                    # API route handlers
│   │   ├── routers/
│   │   │   ├── auth.py        # Authentication endpoints
│   │   │   ├── patients.py    # Patient management
│   │   │   ├── reports.py     # Medical reports
│   │   │   └── xray.py        # X-ray analysis endpoints
│   │   └── deps.py            # Dependency injection
│   ├── db/                     # Database layer
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── crud.py            # Database operations
│   │   └── database.py        # Database configuration
│   ├── services/              # Business logic
│   │   ├── ner_service.py     # NER integration
│   │   └── xray_service.py    # X-ray analysis integration
│   ├── core/                  # Core utilities
│   │   ├── config.py          # Configuration
│   │   └── security.py        # Security utilities
│   ├── main.py                # Application entry point
│   ├── requirements.txt        # Python dependencies
│   └── sql_app.db             # SQLite database
├── frontend/                   # React frontend application
│   ├── src/                   # Source code
│   ├── public/                # Static assets
│   ├── index.html             # HTML entry point
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   └── eslint.config.js       # ESLint configuration
└── ai_services/               # Microservices for AI models
    ├── ner_service/           # Named Entity Recognition
    │   ├── app.py             # NER API server
    │   └── ner_model.py       # NER model implementation
    └── xray_service/          # X-Ray analysis
        ├── app.py             # X-Ray API server
        └── xray_model.py      # X-Ray model implementation
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- pip and npm/yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv backend_venv
source backend_venv/bin/activate  # On Windows: backend_venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Initialize the database:
```bash
python init_db.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

### AI Services Setup

1. For NER Service:
```bash
cd ai_services/ner_service
pip install -r requirements.txt
```

2. For X-Ray Service:
```bash
cd ai_services/xray_service
pip install -r requirements.txt
```

## Usage

### Starting the Backend

```bash
cd backend
python main.py
```

The backend API will be available at `http://localhost:8000`

### Starting the Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Starting AI Services

#### NER Service
```bash
cd ai_services/ner_service
python app.py
```
Service runs on `http://localhost:5001`

#### X-Ray Service
```bash
cd ai_services/xray_service
python app.py
```
Service runs on `http://localhost:5002`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Patient Management
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create a new patient
- `GET /api/patients/{patient_id}` - Get patient details
- `PUT /api/patients/{patient_id}` - Update patient information

### Medical Reports
- `GET /api/patients/{patient_id}/reports` - Get patient reports
- `POST /api/patients/{patient_id}/reports` - Create a new report
- `GET /api/patients/{patient_id}/reports/{report_id}` - Get report details

### X-Ray Analysis
- `POST /api/patients/{patient_id}/xray/analyze` - Analyze X-ray image
- `POST /api/patients/{patient_id}/xray/compare` - Compare two X-ray images
- `POST /api/patients/{patient_id}/xray/qna` - Q&A based on X-ray report

### NER Service
- `POST /extract_entities` - Extract medical entities from text

### X-Ray Service
- `POST /analyze` - Analyze X-ray image for pathologies
- `POST /compare` - Compare two X-ray images
- `POST /qna` - Answer questions about medical reports

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```
DATABASE_URL=sqlite:///./sql_app.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
NER_SERVICE_URL=http://localhost:5001
XRAY_SERVICE_URL=http://localhost:5002
```

## Development

### Linting

Frontend:
```bash
cd frontend
npm run lint
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

### Running Tests

Documentation and test files are present in the project. Run them with:

```bash
pytest  # For backend tests
npm test  # For frontend tests
```

## Features in Detail

### Medical Named Entity Recognition
- Identifies and extracts medical entities such as:
  - Diseases and conditions
  - Medications and treatments
  - Symptoms
  - Medical procedures
  - Lab results
- Provides confidence scores for each extraction

### X-Ray Analysis Capabilities
- **Pathology Detection:** Identifies abnormalities in chest X-rays
- **Report Generation:** Creates natural language descriptions of findings
- **Image Comparison:** Compares longitudinal X-ray studies
- **Interactive Q&A:** Answers clinical questions based on X-ray reports

### Patient Management
- Store and retrieve patient information
- Track medical history
- Organize reports by patient
- Manage X-ray images

## Database Schema

The system uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `patients` - Patient demographic information
- `reports` - Medical reports and documents
- `xray_analysis` - X-ray analysis results

## Known Limitations

- X-ray analysis currently optimized for chest X-rays
- Segmentation map generation is a placeholder feature
- Database is SQLite (recommend PostgreSQL for production)

## Future Enhancements

- Support for multiple medical image types (CT, MRI, etc.)
- Integrated AI model updates and versioning
- Advanced data analytics and reporting
- Multi-language support
- Mobile application
- Integration with hospital information systems (HIS)

## Performance Considerations

- NER Service: Processes medical text with average latency of 100-200ms
- X-Ray Analysis: Image analysis typically completes in 1-3 seconds
- Recommended production setup uses PostgreSQL and production ASGI server

## Troubleshooting

### Backend Connection Issues
- Ensure all services are running on the correct ports
- Check firewall settings
- Verify `.env` configuration

### Frontend Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

### AI Service Errors
- Check model files are properly loaded
- Verify Python dependencies are installed
- Review service logs for detailed error messages

## Contributing

When contributing to this project:
1. Follow the existing code structure
2. Use type hints in Python code
3. Follow PEP 8 style guidelines for Python
4. Ensure API endpoints have proper error handling
5. Update documentation for new features

## License

This project is part of a summer internship program. Please refer to the project administrators for licensing details.

## Contact and Support

For issues, questions, or contributions, please contact the project maintainers.

## Acknowledgments

- ChexNet for X-ray pathology detection
- BiomedCLIP for medical image analysis
- FastAPI for the excellent framework
- React community for frontend tools
