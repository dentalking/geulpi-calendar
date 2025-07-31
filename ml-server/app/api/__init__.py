from .ai_routes import router as ai_router
from .calendar_routes import router as calendar_router
from .health_routes import router as health_router

__all__ = ["ai_router", "calendar_router", "health_router"]