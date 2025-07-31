import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Navigate to page first to set localStorage
    await page.goto('/');
    
    // Set up authentication in localStorage (AuthContext checks this)
    await page.evaluate(() => {
      localStorage.setItem('token', 'test_jwt_token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@geulpi.com',
        onboardingCompleted: false
      }));
    });
    
    // Also set cookie for consistency
    await context.addCookies([{
      name: 'auth_token',
      value: 'test_jwt_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax'
    }]);

    // Mock GraphQL responses
    await context.route('**/graphql', async route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData?.includes('me') || postData?.includes('GetCurrentUser')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              me: {
                id: '1',
                name: 'Test User',
                email: 'test@geulpi.com',
                picture: null,
                onboardingCompleted: false, // Not completed yet
                createdAt: new Date().toISOString()
              }
            }
          })
        });
      } else if (postData?.includes('completeOnboarding')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              completeOnboarding: {
                id: '1',
                name: 'Test User',
                email: 'test@geulpi.com',
                onboardingCompleted: true,
                lifePhilosophy: {
                  areas: [
                    { id: '1', name: '업무', color: '#3B82F6', icon: 'briefcase', targetPercentage: 40 },
                    { id: '2', name: '가족', color: '#EF4444', icon: 'home', targetPercentage: 30 },
                    { id: '3', name: '성장', color: '#10B981', icon: 'graduation-cap', targetPercentage: 20 },
                    { id: '4', name: '기타', color: '#F59E0B', icon: 'star', targetPercentage: 10 }
                  ],
                  idealBalance: {
                    '업무': 40,
                    '가족': 30,
                    '성장': 20,
                    '기타': 10
                  }
                }
              }
            }
          })
        });
      } else {
        await route.continue();
      }
    });
  });

  test('should show onboarding for new users', async ({ page }) => {
    // Navigate to any protected route
    await page.goto('/dashboard');
    
    // Should redirect to onboarding since onboardingCompleted is false
    await expect(page).toHaveURL('/onboarding');
    
    // Check onboarding elements
    await expect(page.locator('text=환영합니다!')).toBeVisible();
    await expect(page.locator('text=삶의 영역 설정')).toBeVisible();
  });

  test('should complete first onboarding step', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Should see life areas
    await expect(page.locator('text=업무')).toBeVisible();
    await expect(page.locator('text=가족')).toBeVisible();
    await expect(page.locator('text=성장')).toBeVisible();
    
    // Should have a next button
    const nextButton = page.locator('button:has-text("다음")');
    await expect(nextButton).toBeVisible();
    
    // Click next to go to balance step
    await nextButton.click();
    
    // Should see balance step
    await expect(page.locator('text=이상적인 균형 설정')).toBeVisible();
  });

  test('should redirect to calendar after completing onboarding', async ({ page, context }) => {
    // Mock completed onboarding response
    await context.route('**/graphql', async route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData?.includes('completeOnboarding')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              completeOnboarding: {
                id: '1',
                name: 'Test User',
                email: 'test@geulpi.com',
                onboardingCompleted: true,
                lifePhilosophy: {
                  areas: [
                    { id: '1', name: '업무', color: '#3B82F6', icon: 'briefcase', targetPercentage: 40 },
                    { id: '2', name: '가족', color: '#EF4444', icon: 'home', targetPercentage: 30 },
                    { id: '3', name: '성장', color: '#10B981', icon: 'graduation-cap', targetPercentage: 20 },
                    { id: '4', name: '기타', color: '#F59E0B', icon: 'star', targetPercentage: 10 }
                  ],
                  idealBalance: {
                    '업무': 40,
                    '가족': 30,
                    '성장': 20,
                    '기타': 10
                  }
                }
              }
            }
          })
        });
      } else if (postData?.includes('me')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              me: {
                id: '1',
                name: 'Test User',
                email: 'test@geulpi.com',
                profileImage: null,
                onboardingCompleted: true, // Now completed
                createdAt: new Date().toISOString()
              }
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/onboarding');
    
    // Complete life areas step
    const nextButton = page.locator('button:has-text("다음")');
    await nextButton.click();
    
    // Complete balance step
    const completeButton = page.locator('button:has-text("완료하기")');
    await expect(completeButton).toBeVisible();
    // Wait for button to be stable before clicking
    await page.waitForTimeout(500);
    await completeButton.click({ force: true });
    
    // Should see suggestions step
    await expect(page.locator('text=AI 추천 일정')).toBeVisible();
    
    // Complete suggestions
    const startButton = page.locator('button:has-text("시작하기")');
    await startButton.click();
    
    // Should redirect to calendar
    await expect(page).toHaveURL('/calendar');
  });
});