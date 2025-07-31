import { Page, BrowserContext } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

const SESSION_DIR = '/auth-session';
const SESSION_FILE = 'auth-state.json';

export class SessionManager {
  private sessionPath: string;

  constructor() {
    this.sessionPath = path.join(SESSION_DIR, SESSION_FILE);
  }

  /**
   * Save authentication state to persistent storage
   */
  async saveAuthState(context: BrowserContext) {
    try {
      // Ensure directory exists
      await fs.mkdir(SESSION_DIR, { recursive: true });
      
      // Save browser state (cookies, localStorage, etc.)
      const state = await context.storageState();
      await fs.writeFile(this.sessionPath, JSON.stringify(state, null, 2));
      
      console.log('Auth state saved successfully');
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  }

  /**
   * Load authentication state from persistent storage
   */
  async loadAuthState(): Promise<any> {
    try {
      const exists = await fs.access(this.sessionPath).then(() => true).catch(() => false);
      
      if (!exists) {
        console.log('No saved auth state found');
        return null;
      }

      const stateData = await fs.readFile(this.sessionPath, 'utf-8');
      return JSON.parse(stateData);
    } catch (error) {
      console.error('Failed to load auth state:', error);
      return null;
    }
  }

  /**
   * Check if we have a valid saved session
   */
  async hasValidSession(): Promise<boolean> {
    const state = await this.loadAuthState();
    if (!state) return false;

    // Check if we have auth cookies
    const hasAuthCookie = state.cookies?.some((cookie: any) => 
      cookie.name === 'auth_token' && cookie.value
    );

    // Check if we have user data in localStorage
    const hasUserData = state.origins?.some((origin: any) => 
      origin.localStorage?.some((item: any) => 
        item.name === 'token' && item.value
      )
    );

    return hasAuthCookie || hasUserData;
  }

  /**
   * Clear saved session
   */
  async clearSession() {
    try {
      await fs.unlink(this.sessionPath);
      console.log('Session cleared');
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as any).code !== 'ENOENT') {
        console.error('Failed to clear session:', error);
      }
    }
  }

  /**
   * Perform Google OAuth login and save session
   */
  async performOAuthLogin(page: Page, context: BrowserContext) {
    // Navigate to login page
    await page.goto('/login');
    
    // In E2E test mode, we'll use mock authentication
    if (process.env.E2E_TEST_MODE === 'true') {
      await this.mockOAuthLogin(page, context);
    } else {
      // Real OAuth flow (requires manual interaction)
      console.log('Please complete OAuth login manually...');
      await page.click('button:has-text("Google로 로그인")');
      
      // Wait for redirect back to app
      await page.waitForURL(/\/(dashboard|onboarding)/, { 
        timeout: 60000 // 1 minute for manual login
      });
    }

    // Save the session after successful login
    await this.saveAuthState(context);
  }

  /**
   * Mock OAuth login for E2E tests
   */
  private async mockOAuthLogin(page: Page, context: BrowserContext) {
    const mockUser = {
      id: '1',
      email: process.env.E2E_USER_EMAIL || 'test@geulpi.com',
      name: 'E2E Test User',
      picture: 'https://example.com/avatar.jpg',
      onboardingCompleted: true
    };

    // Set auth token in localStorage
    await page.evaluate((user) => {
      localStorage.setItem('token', process.env.E2E_AUTH_TOKEN || 'test_auth_token');
      localStorage.setItem('user', JSON.stringify(user));
    }, mockUser);

    // Set auth cookie
    await context.addCookies([{
      name: 'auth_token',
      value: process.env.E2E_AUTH_TOKEN || 'test_auth_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }]);

    // Mock GraphQL responses
    await context.route('**/graphql', async route => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      if (postData?.operationName === 'GetCurrentUser') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { me: mockUser }
          })
        });
      } else {
        await route.continue();
      }
    });

    // Navigate to dashboard
    await page.goto('/dashboard');
  }
}

// Singleton instance
export const sessionManager = new SessionManager();