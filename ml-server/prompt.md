# ML Server Prompt

## Overview
This is the ML/AI service for Geulpi Calendar, a FastAPI application providing AI-powered features like voice transcription, natural language processing, and intelligent scheduling.

## Tech Stack
- Python 3.11
- FastAPI
- OpenAI Whisper for speech recognition
- OpenAI GPT for NLP
- Kafka for message queue
- Redis for caching
- PyTorch for ML models
- Uvicorn ASGI server

## Project Structure
```
ml-server/
├── app/
│   ├── api/              # API endpoints
│   │   ├── v1/          # API version 1
│   │   └── health.py    # Health check endpoint
│   ├── core/            # Core functionality
│   │   ├── config.py    # Configuration
│   │   └── security.py  # Security utilities
│   ├── models/          # ML models
│   │   ├── whisper.py   # Whisper integration
│   │   └── nlp.py       # NLP models
│   ├── services/        # Business logic
│   │   ├── transcription.py
│   │   └── scheduling.py
│   └── main.py         # FastAPI application
├── tests/               # Test files
├── requirements.txt     # Python dependencies
└── Dockerfile          # Container configuration
```

## Key Features
- Voice-to-text transcription using Whisper
- Natural language understanding for calendar events
- Smart scheduling suggestions
- Conflict detection and resolution
- Multi-language support
- Real-time processing via Kafka
- Model caching with Redis

## API Endpoints
- `GET /health`: Health check
- `POST /api/v1/transcribe`: Voice transcription
- `POST /api/v1/parse-event`: Parse natural language to event
- `POST /api/v1/suggest-time`: Suggest optimal meeting times
- `POST /api/v1/analyze-schedule`: Analyze schedule patterns

## Development Guidelines
1. Use type hints throughout
2. Follow PEP 8 style guide
3. Implement proper error handling
4. Use async/await for I/O operations
5. Cache ML model outputs when appropriate
6. Monitor model performance metrics
7. Write unit tests for services

## Environment Variables
- `OPENAI_API_KEY`: OpenAI API key
- `REDIS_URL`: Redis connection URL
- `KAFKA_BOOTSTRAP_SERVERS`: Kafka broker addresses
- `MODEL_CACHE_DIR`: Directory for model cache
- `MAX_WORKERS`: Number of worker processes

## Running the Service
```bash
# Install dependencies
pip install -r requirements.txt

# Local development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Docker
docker-compose up ml-server
```

## Testing
```bash
# Unit tests
pytest

# API tests
pytest tests/api/

# Load testing
locust -f tests/load/locustfile.py
```

## ML Model Management
- Models are downloaded on first use
- Cached in Redis for quick access
- Automatic fallback to CPU if GPU unavailable
- Model versioning through environment variables

## Performance Optimization
- Use batch processing for multiple requests
- Implement request queuing for heavy loads
- Monitor GPU memory usage
- Set appropriate timeout values
- Use model quantization for faster inference