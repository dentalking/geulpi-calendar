import openai
from typing import List, Dict, Any, Optional
import json
import logging
from app.utils.config import get_settings
from app.models.schemas import EventSuggestion, NaturalLanguageRequest

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.settings = get_settings()
        openai.api_key = self.settings.openai_api_key
        self.client = openai.OpenAI(api_key=self.settings.openai_api_key)
    
    async def parse_natural_language_event(self, request: NaturalLanguageRequest) -> List[EventSuggestion]:
        """
        Parse natural language input and extract event information using OpenAI
        """
        try:
            system_prompt = """
            You are an AI assistant that helps parse natural language into calendar events.
            Extract event information from user input and return structured data.
            
            For each event mentioned, extract:
            - title: A clear, concise title
            - description: Additional details (optional)
            - suggested_start_time: ISO format datetime
            - suggested_end_time: ISO format datetime
            - location: Physical or virtual location (optional)
            - category: One of WORK, PERSONAL, HEALTH, SOCIAL, EDUCATION, TRAVEL
            - priority: One of LOW, MEDIUM, HIGH, URGENT
            - confidence_score: Float between 0.0 and 1.0
            
            Return valid JSON array of event objects.
            If time is not specified, suggest reasonable defaults based on event type.
            If date is not specified, assume the user means the next occurrence.
            """
            
            user_prompt = f"""
            Parse this user input into calendar events:
            "{request.text}"
            
            User ID: {request.user_id}
            Additional context: {request.context or {}}
            
            Return only valid JSON array.
            """
            
            response = self.client.chat.completions.create(
                model=self.settings.openai_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=self.settings.openai_max_tokens,
                temperature=self.settings.openai_temperature
            )
            
            content = response.choices[0].message.content.strip()
            
            # Try to parse JSON response
            try:
                events_data = json.loads(content)
                suggestions = []
                
                for event_data in events_data:
                    suggestion = EventSuggestion(**event_data)
                    suggestions.append(suggestion)
                
                return suggestions
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse OpenAI JSON response: {e}")
                logger.error(f"Raw response: {content}")
                return []
                
        except Exception as e:
            logger.error(f"Error parsing natural language with OpenAI: {e}")
            return []
    
    async def suggest_schedule_optimization(self, events: List[Dict[str, Any]], preferences: Dict[str, Any]) -> Dict[str, Any]:
        """
        Suggest schedule optimizations using OpenAI
        """
        try:
            system_prompt = """
            You are an AI scheduling assistant that optimizes calendar events.
            Analyze the provided events and user preferences to suggest improvements.
            
            Consider:
            - Time conflicts
            - Travel time between locations
            - Work-life balance
            - Energy levels throughout the day
            - Meeting clustering
            - Buffer time needs
            
            Return suggestions in JSON format with:
            - optimizations: Array of specific optimization suggestions
            - conflicts: Array of detected conflicts
            - recommendations: Array of general recommendations
            """
            
            user_prompt = f"""
            Optimize this schedule:
            Events: {json.dumps(events, default=str)}
            User preferences: {json.dumps(preferences)}
            
            Provide optimization suggestions in JSON format.
            """
            
            response = self.client.chat.completions.create(
                model=self.settings.openai_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=self.settings.openai_max_tokens,
                temperature=self.settings.openai_temperature
            )
            
            content = response.choices[0].message.content.strip()
            
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                return {"optimizations": [], "conflicts": [], "recommendations": []}
                
        except Exception as e:
            logger.error(f"Error getting schedule optimization: {e}")
            return {"optimizations": [], "conflicts": [], "recommendations": []}
    
    async def generate_meeting_summary(self, meeting_details: Dict[str, Any]) -> str:
        """
        Generate a meeting summary using OpenAI
        """
        try:
            system_prompt = """
            You are an AI assistant that creates concise meeting summaries.
            Generate a professional summary based on the meeting details provided.
            """
            
            user_prompt = f"""
            Generate a meeting summary for:
            {json.dumps(meeting_details, default=str)}
            
            Include key points, decisions made, and action items if any.
            """
            
            response = self.client.chat.completions.create(
                model=self.settings.openai_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=self.settings.openai_max_tokens,
                temperature=self.settings.openai_temperature
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating meeting summary: {e}")
            return "Unable to generate meeting summary."