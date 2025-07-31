# Claude Development Guide for Geulpi Calendar

## 🎯 Project Overview
Geulpi Calendar is an AI-powered smart calendar system with:
- **Frontend**: Next.js 14 with Apollo Client
- **Backend**: Spring Boot 3.2.1 with GraphQL
- **ML Server**: Python FastAPI with OpenAI integration
- **E2E Tests**: Playwright

## 🚀 Quick Start - Local Development

### 1. Start Database Services
```bash
./start-local.sh
```

### 2. Start Backend (Terminal 1)
```bash
cd backend
./gradlew bootRun
# Runs on http://localhost:8080
# GraphQL Playground: http://localhost:8080/graphql
```

### 3. Start Frontend (Terminal 2)
```bash
cd frontend
npm install  # First time only
npm run dev
# Runs on http://localhost:3000
```

### 4. Start ML Server (Terminal 3)
```bash
cd ml-server
python3 -m venv venv  # First time only
source venv/bin/activate
pip install -r requirements.txt  # First time only
python start.py
# Runs on http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## 🧪 Running Tests

### E2E Tests
```bash
cd tests
npm test
# Or specific test: npm test -- --grep "GraphQL"
```

### Lint and Type Check
```bash
# Backend
cd backend && ./gradlew check

# Frontend
cd frontend && npm run lint && npm run typecheck
```

## 📁 Key Files

- **GraphQL Schema**: `backend/src/main/resources/graphql/simple-schema.graphqls`
- **Frontend Queries**: `frontend/src/graphql/calendar-queries.graphql`
- **Test Page**: `frontend/src/pages/test-graphql.tsx`
- **AI Test Page**: `frontend/src/pages/ai-test.tsx`

## 🔧 Common Tasks

### Add New GraphQL Query/Mutation
1. Update schema in `backend/src/main/resources/graphql/simple-schema.graphqls`
2. Create/update resolver in `backend/src/main/java/com/geulpi/calendar/resolver/`
3. Add frontend query in `frontend/src/graphql/`
4. Use in component with `useQuery` or `useMutation`

### Debug ML Integration
- ML service client: `backend/src/main/java/com/geulpi/calendar/service/MLServiceClient.java`
- If ML server is down, backend returns mock responses
- Check ML server health: `curl http://localhost:8000/ai/test`

### Update Dependencies
- Backend: Edit `backend/build.gradle.kts`
- Frontend: `cd frontend && npm update`
- ML Server: Edit `ml-server/requirements.txt`

## ⚠️ Important Notes

1. **Environment Variables**: Copy `.env.example` to `.env` and fill in your API keys
2. **CORS**: Backend allows `localhost:3000` and `localhost:3001`
3. **Database**: PostgreSQL runs on port 5432, Redis on 6379
4. **Hot Reload**: All services support hot reload in development

## 🐛 Troubleshooting

### Backend won't start
- Check if PostgreSQL is running: `docker ps`
- Check logs: `docker-compose -f docker-compose.local.yml logs postgres`

### Frontend GraphQL errors
- Ensure backend is running on port 8080
- Check CORS settings in `backend/src/main/java/com/geulpi/calendar/config/WebConfig.java`

### ML Server connection issues
- Check if running: `curl http://localhost:8000/docs`
- Backend falls back to mock responses if ML server is down

## 🚢 Deployment

### GitHub Repository
https://github.com/dentalking/geulpi-calendar

### Next Steps
1. Set up Vercel deployment for frontend
2. Configure GitHub Actions for CI/CD
3. Deploy backend to cloud service (AWS/GCP)
4. Set up production database