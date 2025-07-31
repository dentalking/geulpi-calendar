import { test as base } from '@playwright/test';
import { ApiTestHelper } from './helpers/api-test-helper';
import { googleAuthHelper } from './helpers/google-auth-helper';

// Extend basic test with real API helpers
export const test = base.extend({
  // Auto-setup API monitoring
  apiHelper: async ({ page }, use) => {
    const helper = new ApiTestHelper(page);
    await helper.setupApiMonitoring();
    await helper.setupTestEndpoints();
    
    await use(helper);
    
    // Cleanup after test
    await helper.cleanupTestData();
  },
  
  // Authenticated page with real Google token
  authenticatedPage: async ({ page, context }, use) => {
    // Get real auth token
    const authToken = await googleAuthHelper.createTestAuthToken();
    
    // Set authentication
    await context.addCookies([{
      name: 'auth_token',
      value: authToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }]);
    
    await page.goto('/');
    await use(page);
  },
  
  // Test calendar for real Google Calendar API
  testCalendarId: async ({}, use) => {
    const calendarId = await googleAuthHelper.createTestCalendar();
    
    await use(calendarId);
    
    // Cleanup
    await googleAuthHelper.cleanupTestCalendar(calendarId);
  }
});

export { expect } from '@playwright/test';