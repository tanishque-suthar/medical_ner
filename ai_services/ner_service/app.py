# ner-service/app.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
from ner_model import ner_model # Import the instantiated model

# --- Pydantic Models for Request and Response ---

class TextInput(BaseModel):
    """Defines the structure for the incoming request body."""
    text: str = Field(..., min_length=1, description="The text to be analyzed for named entities.")

class Entity(BaseModel):
    """Defines the structure for a single extracted entity."""
    text: str
    label: str
    confidence: float

class NERResponse(BaseModel):
    """Defines the structure for the API response."""
    entities: List[Entity]


# --- FastAPI Application ---

# Initialize the FastAPI application
app = FastAPI(
    title="Medical NER Service",
    description="A microservice to extract medical named entities from text.",
    version="1.0.0"
)

@app.post("/extract_entities", response_model=NERResponse)
def extract_entities(payload: TextInput):
    """
    API endpoint to extract medical entities from text.
    It uses a Pydantic model for automatic validation of the request body.
    """
    try:
        # Perform prediction using the loaded NER model
        # The ner_model.predict function already returns a list of dicts
        # that match the 'Entity' Pydantic model structure.
        entities = ner_model.predict(payload.text)
        
        # Return the results. FastAPI will automatically convert this
        # into a JSON response that matches the NERResponse model.
        return {"entities": entities}
        
    except Exception as e:
        # Handle unexpected errors during prediction
        print(f"An unexpected error occurred: {e}")
        # Use HTTPException for proper FastAPI error handling
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred during entity extraction."
        )

if __name__ == "__main__":
    import uvicorn
    # Run the FastAPI app with uvicorn
    # Uvicorn is a lightning-fast ASGI server implementation
    uvicorn.run(app, host="localhost", port=5001)
