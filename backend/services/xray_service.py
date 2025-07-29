# app/services/xray_service.py

import httpx
from fastapi import UploadFile
from core.config import settings

async def call_xray_analyze(file: UploadFile) -> dict:
    """Calls the external X-Ray AI service to analyze a single image."""
    files = {'file': (file.filename, await file.read(), file.content_type)}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.XRAY_SERVICE_URL}/analyze",
                files=files,
                timeout=60.0 # Analysis may take longer
            )
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            raise Exception(f"Could not connect to X-Ray service: {e}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"X-Ray service returned an error: {e.response.text}")

async def call_xray_compare(previous_xray: UploadFile, current_xray: UploadFile) -> dict:
    """Calls the external X-Ray AI service to compare two images."""
    files = {
        'previous_xray': (previous_xray.filename, await previous_xray.read(), previous_xray.content_type),
        'current_xray': (current_xray.filename, await current_xray.read(), current_xray.content_type)
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.XRAY_SERVICE_URL}/compare",
                files=files,
                timeout=90.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            raise Exception(f"Could not connect to X-Ray service for comparison: {e}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"X-Ray comparison service returned an error: {e.response.text}")

async def call_xray_qna(context: str, question: str) -> dict:
    """Calls the external X-Ray AI service for Q&A."""
    payload = {"report_context": context, "question": question}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.XRAY_SERVICE_URL}/qna",
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            raise Exception(f"Could not connect to X-Ray Q&A service: {e}")
        except httpx.HTTPStatusError as e:
            raise Exception(f"X-Ray Q&A service returned an error: {e.response.text}")
