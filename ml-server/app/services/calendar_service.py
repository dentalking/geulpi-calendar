import httpx
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime, timedelta
from app.utils.config import get_settings
from app.models.schemas import ScheduleOptimizationRequest, ConflictResolution

logger = logging.getLogger(__name__)

class CalendarService:
    def __init__(self):
        self.settings = get_settings()
        self.backend_url = self.settings.backend_graphql_endpoint
    
    async def get_user_events(self, user_id: str, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """
        Fetch user events from the backend GraphQL API
        """
        try:
            if start_date and end_date:
                query = """
                query GetEventsByDateRange($userId: String!, $startTime: DateTime!, $endTime: DateTime!) {
                    eventsByDateRange(userId: $userId, startTime: $startTime, endTime: $endTime) {
                        id
                        title
                        description
                        startTime
                        endTime
                        location
                        category
                        priority
                        createdAt
                        updatedAt
                    }
                }
                """
                variables = {
                    "userId": user_id,
                    "startTime": start_date.isoformat(),
                    "endTime": end_date.isoformat()
                }
            else:
                query = """
                query GetEvents($userId: String!) {
                    events(userId: $userId) {
                        id
                        title
                        description
                        startTime
                        endTime
                        location
                        category
                        priority
                        createdAt
                        updatedAt
                    }
                }
                """
                variables = {"userId": user_id}
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.backend_url,
                    json={"query": query, "variables": variables},
                    timeout=30.0
                )
                response.raise_for_status()
                
                data = response.json()
                if "errors" in data:
                    logger.error(f"GraphQL errors: {data['errors']}")
                    return []
                
                if start_date and end_date:
                    return data.get("data", {}).get("eventsByDateRange", [])
                else:
                    return data.get("data", {}).get("events", [])
                    
        except Exception as e:
            logger.error(f"Error fetching user events: {e}")
            return []
    
    async def detect_conflicts(self, events: List[Dict[str, Any]]) -> List[ConflictResolution]:
        """
        Detect scheduling conflicts in events
        """
        conflicts = []
        
        # Sort events by start time
        sorted_events = sorted(events, key=lambda x: x['startTime'])
        
        for i in range(len(sorted_events) - 1):
            current_event = sorted_events[i]
            next_event = sorted_events[i + 1]
            
            current_end = datetime.fromisoformat(current_event['endTime'].replace('Z', '+00:00'))
            next_start = datetime.fromisoformat(next_event['startTime'].replace('Z', '+00:00'))
            
            # Check for overlap
            if current_end > next_start:
                conflict = ConflictResolution(
                    conflicting_events=[current_event, next_event],
                    resolution_suggestions=[
                        f"Shorten '{current_event['title']}' to end before '{next_event['title']}' starts",
                        f"Move '{next_event['title']}' to start after '{current_event['title']}' ends",
                        f"Make '{current_event['title']}' or '{next_event['title']}' virtual to eliminate travel time"
                    ],
                    recommended_action=f"Reschedule '{next_event['title']}' to start at {current_end.strftime('%H:%M')}"
                )
                conflicts.append(conflict)
        
        return conflicts
    
    async def optimize_schedule(self, request: ScheduleOptimizationRequest) -> Dict[str, Any]:
        """
        Optimize user's schedule for the given date range
        """
        try:
            # Get events for the date range
            events = await self.get_user_events(
                request.user_id,
                request.start_date,
                request.end_date
            )
            
            if not events:
                return {
                    "message": "No events found for optimization",
                    "optimizations": [],
                    "conflicts": []
                }
            
            # Detect conflicts
            conflicts = await self.detect_conflicts(events)
            
            # Generate optimization suggestions
            optimizations = []
            
            # Check for back-to-back meetings
            for i in range(len(events) - 1):
                current = events[i]
                next_event = events[i + 1]
                
                current_end = datetime.fromisoformat(current['endTime'].replace('Z', '+00:00'))
                next_start = datetime.fromisoformat(next_event['startTime'].replace('Z', '+00:00'))
                
                time_diff = (next_start - current_end).total_seconds() / 60
                
                if time_diff < 15:  # Less than 15 minutes between events
                    optimizations.append({
                        "type": "buffer_time",
                        "message": f"Add buffer time between '{current['title']}' and '{next_event['title']}'",
                        "suggestion": "Consider adding 15-30 minutes between meetings for transition time"
                    })
            
            # Check for long working blocks
            work_events = [e for e in events if e.get('category') == 'WORK']
            if len(work_events) > 4:  # More than 4 work events in a day
                optimizations.append({
                    "type": "break_recommendation",
                    "message": "Heavy work schedule detected",
                    "suggestion": "Consider scheduling breaks between work blocks for better productivity"
                })
            
            return {
                "message": "Schedule optimization completed",
                "events_analyzed": len(events),
                "conflicts_found": len(conflicts),
                "optimizations": optimizations,
                "conflicts": [conflict.dict() for conflict in conflicts]
            }
            
        except Exception as e:
            logger.error(f"Error optimizing schedule: {e}")
            return {
                "message": "Error occurred during schedule optimization",
                "error": str(e),
                "optimizations": [],
                "conflicts": []
            }
    
    async def suggest_meeting_times(self, user_id: str, duration_minutes: int, preferred_date: datetime) -> List[Dict[str, Any]]:
        """
        Suggest available meeting times based on user's schedule
        """
        try:
            # Get events for the preferred date
            start_of_day = preferred_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = preferred_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            events = await self.get_user_events(user_id, start_of_day, end_of_day)
            
            # Define working hours (9 AM to 6 PM)
            work_start = start_of_day.replace(hour=9)
            work_end = start_of_day.replace(hour=18)
            
            suggestions = []
            current_time = work_start
            
            # Sort events by start time
            sorted_events = sorted(events, key=lambda x: x['startTime'])
            
            for event in sorted_events:
                event_start = datetime.fromisoformat(event['startTime'].replace('Z', '+00:00'))
                
                # Check if there's enough time before this event
                if (event_start - current_time).total_seconds() >= duration_minutes * 60:
                    suggestions.append({
                        "start_time": current_time.isoformat(),
                        "end_time": (current_time + timedelta(minutes=duration_minutes)).isoformat(),
                        "available_duration": int((event_start - current_time).total_seconds() / 60),
                        "type": "before_event",
                        "next_event": event['title']
                    })
                
                # Update current time to after this event
                event_end = datetime.fromisoformat(event['endTime'].replace('Z', '+00:00'))
                current_time = max(current_time, event_end)
            
            # Check if there's time at the end of the day
            if (work_end - current_time).total_seconds() >= duration_minutes * 60:
                suggestions.append({
                    "start_time": current_time.isoformat(),
                    "end_time": (current_time + timedelta(minutes=duration_minutes)).isoformat(),
                    "available_duration": int((work_end - current_time).total_seconds() / 60),
                    "type": "end_of_day",
                    "next_event": None
                })
            
            return suggestions[:5]  # Return top 5 suggestions
            
        except Exception as e:
            logger.error(f"Error suggesting meeting times: {e}")
            return []