# Backend Service Prompt

## Overview
This is the backend service for Geulpi Calendar, a Spring Boot application providing GraphQL API endpoints for calendar management with AI features.

## Tech Stack
- Java 17
- Spring Boot 3.2.1
- Spring GraphQL
- Spring Security
- Spring Data JPA
- PostgreSQL
- GraphQL Java Extended Scalars

## Project Structure
```
backend/
├── src/main/java/com/geulpi/calendar/
│   ├── config/          # Configuration classes
│   ├── controller/      # REST and GraphQL controllers
│   ├── model/          # Entity classes
│   ├── repository/     # JPA repositories
│   ├── resolver/       # GraphQL resolvers
│   └── service/        # Business logic services
├── src/main/resources/
│   ├── application.yml  # Application configuration
│   └── graphql/        # GraphQL schemas
└── build.gradle.kts    # Build configuration
```

## Key Features
- GraphQL API with schema-first approach
- Spring Boot GraphQL auto-configuration
- @Controller annotation-based resolvers (@QueryMapping, @MutationMapping)
- Security configuration with CORS support
- DateTime scalar support using OffsetDateTime
- Docker support for containerized deployment

## GraphQL Schema
Located at `src/main/resources/graphql/simple-schema.graphqls`:
- Query: health, me, calendars
- Mutation: createCalendar
- Types: User, Calendar, CreateCalendarInput
- Scalars: DateTime

## Development Guidelines
1. Use Java 17 features appropriately
2. Follow Spring Boot best practices
3. Implement proper error handling
4. Use DTOs for data transfer
5. Write unit tests for services
6. Use constructor injection for dependencies

## Known Issues
- DateTime must use OffsetDateTime, not LocalDateTime for GraphQL DateTime scalar

## Environment Variables
- `SPRING_DATASOURCE_URL`: PostgreSQL connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password

## Running the Service
```bash
# Local development
./gradlew bootRun

# Docker
docker-compose up backend
```

## Testing
```bash
# Unit tests
./gradlew test

# GraphQL endpoint test
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ health }"}'
```