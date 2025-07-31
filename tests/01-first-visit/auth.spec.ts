import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('h1')).toContainText('로그인');
  });

  test('should show Google OAuth login button', async ({ page }) => {
    await page.goto('/login');
    
    // Check for Google OAuth button
    const googleButton = page.locator('button:has-text("Google로 로그인")');
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();
  });

  test('should handle successful OAuth login flow', async ({ page, context }) => {
    await page.goto('/login');
    
    // Mock backend OAuth endpoint to redirect with token
    await context.route('**/auth/google**', async route => {
      await route.fulfill({
        status: 302,
        headers: {
          'Location': 'http://localhost:3000/auth/callback?token=test_jwt_token'
        }
      });
    });

    // Mock GraphQL endpoint for user query
    await context.route('**/graphql', async route => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      if (postData?.operationName === 'GetCurrentUser') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              me: {
                id: '1',
                email: 'test@geulpi.com',
                name: '테스트 사용자',
                onboardingCompleted: true
              }
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // Click Google login button
    await page.locator('button:has-text("Google로 로그인")').click();
    
    // Should be redirected to dashboard (callback redirects to /dashboard, then ProtectedRoute allows access)
    await expect(page).toHaveURL('/dashboard');
    
    // Check if user info is displayed
    await expect(page.locator('[data-testid="user-email"]')).toContainText('test@geulpi.com');
  });

  test('should persist authentication across page reloads', async ({ page, context }) => {
    // Navigate to page first
    await page.goto('/login');
    
    // Set auth token in localStorage
    await page.evaluate(() => {
      localStorage.setItem('token', 'test_jwt_token');
    });
    
    // Also set auth cookie for middleware
    await context.addCookies([{
      name: 'auth_token',
      value: 'test_jwt_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }]);

    // Mock GraphQL endpoint for user query
    await context.route('**/graphql', async route => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      if (postData?.operationName === 'GetCurrentUser') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              me: {
                id: '1',
                email: 'test@geulpi.com',
                name: '테스트 사용자',
                picture: 'https://example.com/avatar.jpg'
              }
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // May redirect to onboarding if user hasn't completed it
    await page.waitForURL(url => {
      const urlString = typeof url === 'string' ? url : url.toString();
      return urlString.includes('/dashboard') || urlString.includes('/onboarding');
    });
    
    // Being on dashboard or onboarding means authentication worked
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(dashboard|onboarding)/);
    
    // Not on login page = authenticated
    await expect(page).not.toHaveURL(/\/login/);
    
    // Reload page
    await page.reload();
    
    // Should still be authenticated after reload
    await page.waitForURL(url => {
      const urlString = typeof url === 'string' ? url : url.toString();
      return urlString.includes('/dashboard') || urlString.includes('/onboarding');
    });
    
    // Verify still authenticated (not redirected to login)
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should handle logout correctly', async ({ page, context }) => {
    // Navigate to page first
    await page.goto('/login');
    
    // Set auth token in localStorage
    await page.evaluate(() => {
      localStorage.setItem('token', 'test_jwt_token');
    });
    
    // Also set auth cookie for middleware
    await context.addCookies([{
      name: 'auth_token',
      value: 'test_jwt_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }]);

    // Mock GraphQL endpoint for user query
    await context.route('**/graphql', async route => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      if (postData?.operationName === 'GetCurrentUser') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              me: {
                id: '1',
                email: 'test@geulpi.com',
                name: '테스트 사용자',
                onboardingCompleted: true
              }
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for user email to be visible
    await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
    
    // Click logout button (use first one if multiple exist)
    await page.locator('[data-testid="logout-button"]').first().click();
    
    // Should be redirected to login (with or without error parameter)
    await expect(page).toHaveURL(/\/login/);
    
    // Verify that auth tokens are cleared
    const tokenInStorage = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenInStorage).toBeNull();
    
    // Try to access dashboard again - should be redirected to login
    await page.goto('/dashboard');
    
    // Should be redirected back to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should handle authentication errors gracefully', async ({ page, context }) => {
    await page.goto('/login');
    
    // Mock backend OAuth endpoint to return error
    await context.route('**/auth/google**', async route => {
      await route.fulfill({
        status: 302,
        headers: {
          'Location': 'http://localhost:3000/login?error=no_token'
        }
      });
    });

    // Click Google login button
    await page.locator('button:has-text("Google로 로그인")').click();
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('로그인에 실패했습니다');
    
    // Should stay on login page
    await expect(page).toHaveURL(/.*\/login/);
  });
});