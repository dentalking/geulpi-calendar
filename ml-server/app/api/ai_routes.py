from fastapi import APIRouter, HTTPException
from typing import List
import logging
from app.models.schemas import (
    NaturalLanguageRequest, 
    AIResponse, 
    EventSuggestion
)
from app.services.openai_service import OpenAIService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize OpenAI service
openai_service = OpenAIService()

@router.post("/parse-event", response_model=AIResponse)
async def parse_natural_language_event(request: NaturalLanguageRequest):
    """
    Parse natural language input into structured event data
    """
    try:
        suggestions = await openai_service.parse_natural_language_event(request)
        
        if not suggestions:
            return AIResponse(
                success=False,
                message="Could not parse event from the provided text",
                data=None,
                suggestions=None
            )
        
        return AIResponse(
            success=True,
            message=f"Successfully parsed {len(suggestions)} event(s)",
            data={"event_count": len(suggestions)},
            suggestions=suggestions
        )
        
    except Exception as e:
        logger.error(f"Error parsing natural language event: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/optimize-schedule")
async def get_schedule_optimization(events: List[dict], preferences: dict = None):
    """
    Get AI-powered schedule optimization suggestions
    """
    try:
        if preferences is None:
            preferences = {}
            
        optimization_result = await openai_service.suggest_schedule_optimization(events, preferences)
        
        return AIResponse(
            success=True,
            message="Schedule optimization completed",
            data=optimization_result,
            suggestions=None
        )
        
    except Exception as e:
        logger.error(f"Error optimizing schedule: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/generate-summary")
async def generate_meeting_summary(meeting_details: dict):
    """
    Generate AI-powered meeting summary
    """
    try:
        summary = await openai_service.generate_meeting_summary(meeting_details)
        
        return AIResponse(
            success=True,
            message="Meeting summary generated successfully",
            data={"summary": summary},
            suggestions=None
        )
        
    except Exception as e:
        logger.error(f"Error generating meeting summary: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/test")
async def test_ai_service():
    """
    Test endpoint for AI service
    """
    return {
        "message": "AI service is running",
        "openai_configured": bool(openai_service.settings.openai_api_key),
        "model": openai_service.settings.openai_model
    }