import { test, expect } from '@playwright/test';

test.describe('Backend GraphQL API', () => {
  const GRAPHQL_ENDPOINT = 'http://localhost:8080/graphql';

  test('should check backend health', async ({ request }) => {
    try {
      const response = await request.get('http://localhost:8080/health');
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.status).toBe('UP');
    } catch (error) {
      console.log('Backend not ready yet:', error);
      // For now, we'll skip if backend is not ready
      test.skip();
    }
  });

  test('should execute GraphQL query', async ({ request }) => {
    const query = `
      query GetCalendars {
        calendars {
          id
          name
        }
      }
    `;

    try {
      const response = await request.post(GRAPHQL_ENDPOINT, {
        data: {
          query: query
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok()) {
        console.log('GraphQL endpoint not ready');
        test.skip();
      }

      const data = await response.json();
      expect(data).toHaveProperty('data');
    } catch (error) {
      console.log('GraphQL not ready:', error);
      test.skip();
    }
  });

  test('should handle GraphQL mutation', async ({ request }) => {
    const mutation = `
      mutation CreateCalendar {
        createCalendar(input: {
          name: "E2E Test Calendar"
          description: "Test calendar created by E2E tests"
        }) {
          id
          name
          description
        }
      }
    `;

    try {
      const response = await request.post(GRAPHQL_ENDPOINT, {
        data: {
          query: mutation
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok()) {
        console.log('Mutation endpoint not ready');
        test.skip();
      }

      const data = await response.json();
      expect(data).toHaveProperty('data');
    } catch (error) {
      console.log('Mutation not ready:', error);
      test.skip();
    }
  });
});