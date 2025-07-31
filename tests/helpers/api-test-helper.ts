import { Page } from '@playwright/test';

export class ApiTestHelper {
  constructor(private page: Page) {}

  /**
   * Monitor and control API usage during tests
   */
  async setupApiMonitoring() {
    // Track API calls to external services
    await this.page.route('**/*googleapis.com/**', async (route, request) => {
      console.log(`Google API call: ${request.url()}`);
      
      // Add rate limiting headers
      const headers = {
        ...request.headers(),
        'X-E2E-Test': 'true',
        'X-Test-Run-Id': process.env.TEST_RUN_ID || 'local'
      };
      
      await route.continue({ headers });
    });

    // Monitor OpenAI API calls
    await this.page.route('**/api.openai.com/**', async (route, request) => {
      console.log(`OpenAI API call: ${request.url()}`);
      
      // Check token usage limit
      const currentUsage = await this.getTokenUsage();
      if (currentUsage > parseInt(process.env.OPENAI_MAX_TOKENS_PER_TEST || '1000')) {
        // Fallback to mock response if limit exceeded
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            choices: [{
              message: {
                content: 'E2E test limit exceeded - using fallback response'
              }
            }]
          })
        });
        return;
      }
      
      await route.continue();
    });
  }

  /**
   * Setup test-specific API endpoints
   */
  async setupTestEndpoints() {
    // Google Places API - use test location
    await this.page.route('**/maps/api/place/**', async (route, request) => {
      const url = new URL(request.url());
      
      // Force test location (Seoul)
      if (url.pathname.includes('nearbysearch')) {
        url.searchParams.set('location', '37.5665,126.9780');
        url.searchParams.set('radius', '1000');
      }
      
      await route.continue({ url: url.toString() });
    });

    // Google Calendar - use test calendar
    await this.page.route('**/calendar/v3/calendars/**', async (route, request) => {
      const url = request.url();
      
      // Replace primary calendar with test calendar
      if (url.includes('/primary/')) {
        const testCalendarUrl = url.replace('/primary/', `/${process.env.GOOGLE_TEST_CALENDAR_ID}/`);
        await route.continue({ url: testCalendarUrl });
      } else {
        await route.continue();
      }
    });
  }

  /**
   * Verify API responses are real (not mocked)
   */
  async verifyRealApiResponse(apiName: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.page.once('response', response => {
        if (response.url().includes(apiName)) {
          const headers = response.headers();
          // Real API responses have specific headers
          const isReal = !headers['x-mock-response'] && 
                        headers['x-goog-api-client'] || 
                        headers['openai-version'];
          resolve(isReal);
        }
      });
    });
  }

  /**
   * Get current token usage for OpenAI
   */
  private async getTokenUsage(): Promise<number> {
    // This would query your backend for current test run usage
    const response = await this.page.request.get('/api/test/token-usage');
    const data = await response.json();
    return data.tokensUsed || 0;
  }

  /**
   * Clean up test data after test completion
   */
  async cleanupTestData() {
    if (process.env.CLEANUP_AFTER_TEST === 'true') {
      try {
        // Call backend cleanup endpoint
        await this.page.request.post('/api/test/cleanup', {
          data: {
            testRunId: process.env.TEST_RUN_ID,
            preserveFailedData: process.env.PRESERVE_FAILED_TEST_DATA === 'true'
          }
        });
        
        console.log('Test data cleaned up successfully');
      } catch (error) {
        console.error('Failed to cleanup test data:', error);
      }
    }
  }
}

/**
 * Rate limiter for API calls
 */
export class ApiRateLimiter {
  private callCounts: Map<string, number> = new Map();
  private resetTimes: Map<string, number> = new Map();

  async checkLimit(apiName: string, maxPerMinute: number): Promise<boolean> {
    const now = Date.now();
    const resetTime = this.resetTimes.get(apiName) || 0;
    
    if (now > resetTime) {
      // Reset counter
      this.callCounts.set(apiName, 0);
      this.resetTimes.set(apiName, now + 60000); // 1 minute
    }
    
    const currentCount = this.callCounts.get(apiName) || 0;
    if (currentCount >= maxPerMinute) {
      return false; // Rate limit exceeded
    }
    
    this.callCounts.set(apiName, currentCount + 1);
    return true;
  }
}

export const apiRateLimiter = new ApiRateLimiter();