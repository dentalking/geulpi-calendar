# Geulpi Calendar - AI-Powered Smart Calendar System

## 🚀 Overview

Geulpi Calendar is an advanced calendar application that integrates AI capabilities with traditional scheduling features. Built with a microservices architecture, it provides intelligent event suggestions, natural language processing, and seamless integration with Google services.

## 🏗️ Architecture

The system consists of three main services:

- **Frontend**: Next.js 14 application with Apollo Client for GraphQL
- **Backend**: Spring Boot 3.2.1 with GraphQL API
- **ML Server**: Python FastAPI service for AI/ML features

## 🛠️ Tech Stack

### Frontend
- Next.js 14.0.4
- TypeScript
- Apollo Client (GraphQL)
- React 18
- Tailwind CSS

### Backend
- Spring Boot 3.2.1
- Java 17
- Spring GraphQL
- PostgreSQL with PostGIS
- Redis for caching
- Apache Kafka for messaging

### ML Server
- Python 3.11
- FastAPI
- OpenAI GPT-4
- Whisper for speech recognition
- PyTorch for ML models

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Java 17+
- Python 3.11+
- Google Cloud Console account (for OAuth and APIs)
- OpenAI API key

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/geulpi-calendar.git
   cd geulpi-calendar
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and credentials
   ```

3. **Start all services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend GraphQL: http://localhost:8080/graphql
   - ML Server API: http://localhost:8000/docs

## 🔧 Development

### Running services individually

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
./gradlew bootRun
```

**ML Server:**
```bash
cd ml-server
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Running E2E Tests
```bash
cd tests
npm install
npm test
```

## 📁 Project Structure

```
geulpi-calendar/
├── frontend/          # Next.js frontend application
├── backend/           # Spring Boot backend service
├── ml-server/         # Python ML/AI service
├── tests/             # E2E tests with Playwright
├── docker-compose.yml # Docker orchestration
├── schema.graphqls    # Main GraphQL schema
└── prompt.md files    # Service-specific documentation
```

## 🔑 Key Features

- **Smart Scheduling**: AI-powered event suggestions and conflict resolution
- **Natural Language Processing**: Create events using natural language
- **Google Integration**: Seamless sync with Google Calendar
- **Voice Commands**: Speech-to-text event creation
- **Intelligent Notifications**: Context-aware reminders
- **Multi-language Support**: Korean and English interfaces

## 🧪 Testing

The project includes comprehensive E2E tests using Playwright:

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "GraphQL"
```

## 📚 API Documentation

- **GraphQL Playground**: http://localhost:8080/graphql
- **ML Server OpenAPI**: http://localhost:8000/docs

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Spring Boot, Next.js, and FastAPI
- Powered by OpenAI GPT-4 and Google Cloud Services
- Developed as part of the Geulpi Project initiative