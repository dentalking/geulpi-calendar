import { test, expect } from '@playwright/test';

test.describe('GraphQL Endpoint Tests', () => {
  const GRAPHQL_URL = 'http://localhost:8080/graphql';

  test('health query returns UP', async ({ request }) => {
    const response = await request.post(GRAPHQL_URL, {
      data: {
        query: '{ health }'
      }
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data).toBeDefined();
    expect(json.data.health).toBe('UP');
  });

  test('me query returns current user', async ({ request }) => {
    const response = await request.post(GRAPHQL_URL, {
      data: {
        query: '{ me { id email name } }'
      }
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data).toBeDefined();
    expect(json.data.me).toMatchObject({
      id: '1',
      email: 'test@geulpi.com',
      name: 'Test User'
    });
  });

  test('calendars query returns empty list initially', async ({ request }) => {
    const response = await request.post(GRAPHQL_URL, {
      data: {
        query: '{ calendars { id name } }'
      }
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data).toBeDefined();
    expect(json.data.calendars).toEqual([]);
  });

  test('createCalendar mutation creates a new calendar', async ({ request }) => {
    const response = await request.post(GRAPHQL_URL, {
      data: {
        query: `
          mutation {
            createCalendar(input: { name: "Test Calendar", description: "E2E Test" }) {
              id
              name
              description
              owner {
                name
              }
              createdAt
            }
          }
        `
      }
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data).toBeDefined();
    expect(json.data.createCalendar).toMatchObject({
      name: 'Test Calendar',
      description: 'E2E Test',
      owner: {
        name: 'Test User'
      }
    });
    expect(json.data.createCalendar.id).toBeDefined();
    expect(json.data.createCalendar.createdAt).toBeDefined();
  });

  test('GraphiQL interface is accessible', async ({ page }) => {
    await page.goto('http://localhost:8080/graphiql?path=/graphql');
    await expect(page.locator('#graphiql')).toBeVisible();
  });
});