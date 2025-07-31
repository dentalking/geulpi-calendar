# Geulpi Calendar - Backend

Spring Boot backend application with Kotlin, GraphQL, and PostgreSQL.

## Features

- Spring Boot 3.2 with Kotlin
- GraphQL API with Spring GraphQL
- PostgreSQL database with JPA
- Redis caching
- JWT authentication
- Google Calendar integration

## Getting Started

### Prerequisites

- Java 17 or higher
- Docker and Docker Compose (for database)

### Installation

```bash
./gradlew build
```

### Development

Start the database:
```bash
docker-compose up postgres redis
```

Run the application:
```bash
./gradlew bootRun
```

The API will be available at [http://localhost:8080/graphql](http://localhost:8080/graphql)
GraphiQL IDE: [http://localhost:8080/graphiql](http://localhost:8080/graphiql)

### Testing

```bash
./gradlew test
```

## Environment Variables

Set these environment variables or create an `application-local.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/geulpi
    username: geulpi_user
    password: your_password
```

## Project Structure

```
src/main/kotlin/com/geulpi/calendar/
├── model/         # Data models
├── repository/    # Data access layer
├── service/       # Business logic
├── resolver/      # GraphQL resolvers
└── config/        # Configuration classes
```

## GraphQL Schema

The GraphQL schema is located at `src/main/resources/graphql/schema.graphqls`.