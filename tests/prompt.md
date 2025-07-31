# E2E Tests Prompt

## Overview
This is the end-to-end testing suite for Geulpi Calendar, using Playwright to test user journeys across the entire application stack.

## Tech Stack
- Playwright Test Framework
- TypeScript
- Docker Compose for test environment
- GitHub Actions for CI/CD

## Project Structure
```
tests/
├── 01-basic/              # Basic functionality tests
├── 02-onboarding/         # User onboarding flows
├── 03-navigation/         # Navigation and routing
├── 04-ai-features/        # AI feature tests
├── 05-collaboration/      # Multi-user scenarios
├── 06-power-features/     # Advanced features
├── fixtures/              # Test fixtures
├── helpers/               # Test utilities
├── playwright.config.ts   # Playwright configuration
└── package.json          # Dependencies
```

## Test Categories

### P0 - Critical User Journeys
- User registration and login
- Create and view calendar events
- Basic CRUD operations
- Core navigation flows

### P1 - AI Features
- Voice input for events
- Natural language processing
- Smart scheduling suggestions
- Conflict resolution

### P2 - Advanced Features
- Multi-user collaboration
- Real-time updates
- Offline functionality
- Data export/import

## Development Guidelines
1. Write descriptive test names
2. Use Page Object Model pattern
3. Implement proper test isolation
4. Add data-testid attributes for stability
5. Use fixtures for test data
6. Implement retry logic for flaky tests
7. Take screenshots on failure

## Running Tests
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test file
npx playwright test 01-basic/graphql-test.spec.ts

# Run with UI mode
npx playwright test --ui

# Run with specific browser
npx playwright test --project=chromium

# Generate test report
npx playwright show-report
```

## CI/CD Integration
```yaml
# GitHub Actions example
- name: Run E2E tests
  run: |
    docker-compose up -d
    npm ci
    npx playwright install
    npm test
```

## Test Environment Setup
1. Ensure all services are running via Docker Compose
2. Wait for services to be healthy
3. Run database migrations if needed
4. Seed test data if required

## Best Practices
- Use explicit waits over hard-coded delays
- Test user-visible behavior, not implementation
- Keep tests independent and idempotent
- Use meaningful assertions
- Group related tests with describe blocks
- Clean up test data after each test

## Debugging
```bash
# Run with debug mode
PWDEBUG=1 npx playwright test

# Run with headed browser
npx playwright test --headed

# Slow down execution
npx playwright test --slow-mo=1000

# Generate trace file
npx playwright test --trace on
```

## Common Issues
- Timing issues: Use proper wait strategies
- Flaky tests: Implement retry logic
- Environment issues: Check service health
- Data conflicts: Ensure test isolation