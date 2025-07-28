# app/services/ner_service.py

import httpx
from core.config import settings

async def call_ner_service(text: str) -> dict:
    """
    Calls the external NER AI microservice to extract entities from text.

    Args:
        text (str): The text content to be analyzed.

    Returns:
        dict: The JSON response from the NER service, typically containing a list of entities.
    
    Raises:
        Exception: If the service call fails or returns a non-200 status code.
    """
    # Use an async HTTP client to make the request
    async with httpx.AsyncClient() as client:
        try:
            # Make a POST request to the URL defined in your settings
            response = await client.post(
                f"{settings.NER_SERVICE_URL}/extract_entities",
                json={"text": text},
                timeout=30.0  # Set a reasonable timeout
            )
            
            # Raise an exception for bad status codes (4xx or 5xx)
            response.raise_for_status()
            
            return response.json()
            
        except httpx.RequestError as e:
            # Handle network-related errors
            print(f"An error occurred while requesting {e.request.url!r}.")
            raise Exception(f"Could not connect to NER service: {e}")
        except httpx.HTTPStatusError as e:
            # Handle non-200 responses
            print(f"Error response {e.response.status_code} while requesting {e.request.url!r}.")
            raise Exception(f"NER service returned an error: {e.response.text}")

