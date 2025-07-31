from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import Optional
import logging
from app.models.schemas import ScheduleOptimizationRequest, AIResponse
from app.services.calendar_service import CalendarService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize calendar service
calendar_service = CalendarService()

@router.post("/optimize", response_model=AIResponse)
async def optimize_user_schedule(request: ScheduleOptimizationRequest):
    """
    Optimize user's schedule for a given date range
    """
    try:
        optimization_result = await calendar_service.optimize_schedule(request)
        
        return AIResponse(
            success=True,
            message=optimization_result.get("message", "Schedule optimization completed"),
            data=optimization_result,
            suggestions=None
        )
        
    except Exception as e:
        logger.error(f"Error optimizing user schedule: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/conflicts/{user_id}")
async def detect_schedule_conflicts(
    user_id: str,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    """
    Detect conflicts in user's schedule
    """
    try:
        events = await calendar_service.get_user_events(user_id, start_date, end_date)
        conflicts = await calendar_service.detect_conflicts(events)
        
        return {
            "user_id": user_id,
            "events_analyzed": len(events),
            "conflicts_found": len(conflicts),
            "conflicts": [conflict.dict() for conflict in conflicts]
        }
        
    except Exception as e:
        logger.error(f"Error detecting schedule conflicts: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/suggest-times/{user_id}")
async def suggest_meeting_times(
    user_id: str,
    duration_minutes: int = Query(..., ge=15, le=480),
    preferred_date: datetime = Query(...)
):
    """
    Suggest available meeting times for a user
    """
    try:
        suggestions = await calendar_service.suggest_meeting_times(
            user_id, duration_minutes, preferred_date
        )
        
        return {
            "user_id": user_id,
            "duration_minutes": duration_minutes,
            "preferred_date": preferred_date.isoformat(),
            "suggestions": suggestions
        }
        
    except Exception as e:
        logger.error(f"Error suggesting meeting times: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/events/{user_id}")
async def get_user_events(
    user_id: str,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None)
):
    """
    Get user events (proxy to backend API)
    """
    try:
        events = await calendar_service.get_user_events(user_id, start_date, end_date)
        
        return {
            "user_id": user_id,
            "event_count": len(events),
            "events": events
        }
        
    except Exception as e:
        logger.error(f"Error fetching user events: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")