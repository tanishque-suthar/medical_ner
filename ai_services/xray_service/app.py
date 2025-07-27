# xray-analysis-service/app.py

from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from PIL import Image
import io

# Import the singleton instance of our model handler
from xray_model import xray_model_instance

# --- Pydantic Models for API Schema ---

class PathologyResult(BaseModel):
    name: str
    probability: float
    detected: bool

class AnalyzeResponse(BaseModel):
    pathologies: List[PathologyResult]
    generated_report: str
    # The segmentation map will be a base64 encoded string
    segmentation_map: Optional[str] = None

class CompareRequest(BaseModel):
    # In a real app, you might pass image IDs, but for this service, we'll handle uploads
    pass # This is a placeholder as files are handled separately

class CompareResponse(BaseModel):
    comparison_report: str

class QNARequest(BaseModel):
    report_context: str = Field(..., min_length=10)
    question: str = Field(..., min_length=1)

class QNAResponse(BaseModel):
    answer: str

# --- FastAPI Application ---

app = FastAPI(
    title="X-Ray Analysis Service",
    description="A microservice for analyzing X-ray images, including pathology detection, report generation, comparison, and Q&A.",
    version="1.0.0"
)

def read_image_from_upload(file: UploadFile) -> Image.Image:
    """Helper function to read and validate an uploaded image file."""
    try:
        # Read content from the uploaded file
        contents = file.file.read()
        # Open it as a PIL Image
        image = Image.open(io.BytesIO(contents))
        return image
    except Exception as e:
        print(f"Error reading image file: {e}")
        raise HTTPException(status_code=400, detail="Invalid image file provided.")
    finally:
        # Close the file to free resources
        file.file.close()


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_xray(file: UploadFile = File(...)):
    """
    Analyzes a single uploaded X-ray image.
    - Detects pathologies using ChexNet.
    - Generates a descriptive report using BiomedCLIP.
    """
    image = read_image_from_upload(file)
    
    try:
        pathologies = xray_model_instance.predict_pathologies(image)
        report = xray_model_instance.generate_biomed_clip_report(image)
        
        # For now, segmentation map is a placeholder. A full implementation
        # would use Grad-CAM and return a base64 string of the map image.
        
        return {
            "pathologies": pathologies,
            "generated_report": report,
            "segmentation_map": None # Placeholder
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during analysis: {str(e)}")


@app.post("/compare", response_model=CompareResponse)
async def compare_xrays(previous_xray: UploadFile = File(...), current_xray: UploadFile = File(...)):
    """
    Compares two uploaded X-ray images by generating reports for each
    and then using a generative model to create a comparison summary.
    """
    image1 = read_image_from_upload(previous_xray)
    image2 = read_image_from_upload(current_xray)

    try:
        comparison_report = xray_model_instance.generate_comparison_report(image1, image2)
        return {"comparison_report": comparison_report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during comparison: {str(e)}")


@app.post("/qna", response_model=QNAResponse)
async def answer_question(payload: QNARequest):
    """

    Answers a question based on a provided report context using a generative model.
    """
    try:
        answer = xray_model_instance.generate_qna_answer(payload.report_context, payload.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during Q&A: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    # Run the service on a different port than the NER service
    uvicorn.run(app, host="0.0.0.0", port=5002)
