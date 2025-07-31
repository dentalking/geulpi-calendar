# Geulpi Calendar - ML Server

FastAPI ML server with OpenAI integration for AI-powered calendar features.

## Features

- FastAPI with async support
- OpenAI GPT integration
- Natural language event parsing
- Schedule optimization
- Meeting conflict detection
- Smart time suggestions

## Getting Started

### Prerequisites

- Python 3.11 or higher
- OpenAI API key

### Installation

```bash
pip install -r requirements.txt
```

Or use the startup script:
```bash
python start.py
```

### Development

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000)
API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

## Environment Variables

Create a `.env` file with:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
BACKEND_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
```

## API Endpoints

### AI Services
- `POST /ai/parse-event` - Parse natural language into events
- `POST /ai/optimize-schedule` - Get schedule optimization suggestions
- `POST /ai/generate-summary` - Generate meeting summaries

### Calendar Services
- `POST /calendar/optimize` - Optimize user schedule
- `GET /calendar/conflicts/{user_id}` - Detect schedule conflicts
- `GET /calendar/suggest-times/{user_id}` - Suggest meeting times

### Health Check
- `GET /health/` - Service health status

## Project Structure

```
app/
├── api/           # API route handlers
├── services/      # Business logic services
├── models/        # Pydantic models
├── utils/         # Utilities and configuration
└── main.py        # FastAPI application
```