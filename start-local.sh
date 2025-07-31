#!/bin/bash

echo "🚀 Starting Geulpi Calendar Local Development Environment"

# Start database services
echo "📦 Starting PostgreSQL and Redis..."
docker-compose -f docker-compose.local.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are healthy
docker-compose -f docker-compose.local.yml ps

echo ""
echo "✅ Database services are running!"
echo ""
echo "📋 Next steps:"
echo "1. Backend: cd backend && ./gradlew bootRun"
echo "2. Frontend: cd frontend && npm run dev"
echo "3. ML Server: cd ml-server && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python start.py"
echo ""
echo "🧪 Run E2E tests: cd tests && npm test"
echo ""
echo "📝 Check http://localhost:3000 for frontend"
echo "📝 Check http://localhost:8080/graphql for GraphQL playground"
echo "📝 Check http://localhost:8000/docs for ML Server API docs"