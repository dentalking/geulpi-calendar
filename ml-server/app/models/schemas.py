from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class EventCategory(str, Enum):
    WORK = "WORK"
    PERSONAL = "PERSONAL"
    HEALTH = "HEALTH"
    SOCIAL = "SOCIAL"
    EDUCATION = "EDUCATION"
    TRAVEL = "TRAVEL"

class EventPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class EventSuggestion(BaseModel):
    title: str = Field(..., description="Event title")
    description: Optional[str] = Field(None, description="Event description")
    suggested_start_time: datetime = Field(..., description="Suggested start time")
    suggested_end_time: datetime = Field(..., description="Suggested end time")
    location: Optional[str] = Field(None, description="Event location")
    category: EventCategory = Field(..., description="Event category")
    priority: EventPriority = Field(..., description="Event priority")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="AI confidence score")

class NaturalLanguageRequest(BaseModel):
    text: str = Field(..., description="Natural language input from user")
    user_id: str = Field(..., description="User ID")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")

class AIResponse(BaseModel):
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="Response message")
    data: Optional[Dict[str, Any]] = Field(None, description="Response data")
    suggestions: Optional[List[EventSuggestion]] = Field(None, description="Event suggestions")

class ScheduleOptimizationRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    start_date: datetime = Field(..., description="Start date for optimization")
    end_date: datetime = Field(..., description="End date for optimization")
    preferences: Optional[Dict[str, Any]] = Field(None, description="User preferences")

class ConflictResolution(BaseModel):
    conflicting_events: List[Dict[str, Any]] = Field(..., description="Conflicting events")
    resolution_suggestions: List[str] = Field(..., description="Resolution suggestions")
    recommended_action: str = Field(..., description="Recommended action")

class HealthCheckResponse(BaseModel):
    status: str = Field(..., description="Service status")
    timestamp: datetime = Field(..., description="Check timestamp")
    version: str = Field(..., description="Service version")
    dependencies: Dict[str, str] = Field(..., description="Dependency status")