from fastapi import APIRouter
from datetime import datetime
from app.models.schemas import HealthCheckResponse
import httpx
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check endpoint
    """
    dependencies = {}
    
    # Check OpenAI API availability
    try:
        import openai
        dependencies["openai"] = "available"
    except Exception:
        dependencies["openai"] = "unavailable"
    
    # Check backend API availability
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:8080/actuator/health", timeout=5.0)
            if response.status_code == 200:
                dependencies["backend_api"] = "available"
            else:
                dependencies["backend_api"] = "degraded"
    except Exception:
        dependencies["backend_api"] = "unavailable"
    
    return HealthCheckResponse(
        status="healthy",
        timestamp=datetime.now(),
        version="1.0.0",
        dependencies=dependencies
    )