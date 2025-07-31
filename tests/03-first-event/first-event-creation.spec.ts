import { test, expect } from '@playwright/test';

test.describe('First Event Creation Journey', () => {
  test.beforeEach(async ({ page, context }) => {
    // Navigate to page first to set localStorage
    await page.goto('/');
    
    // Set up authentication in localStorage
    await page.evaluate(() => {
      localStorage.setItem('token', 'test_jwt_token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@geulpi.com',
        onboardingCompleted: true // Already completed onboarding
      }));
    });
    
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
                onboardingCompleted: true
              }
            }
          })
        });
      } else if (postData?.includes('events') || postData?.includes('GetEvents')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              events: [] // No events initially
            }
          })
        });
      } else if (postData?.includes('createEvent')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              createEvent: {
                id: 'new-event-1',
                title: '첫 번째 일정',
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
                description: '나의 첫 일정입니다',
                location: '온라인',
                category: '업무',
                lifeAreaId: '1',
                isAllDay: false,
                isRecurring: false,
                priority: 'MEDIUM',
                visibility: 'PRIVATE',
                owner: {
                  id: '1',
                  name: 'Test User',
                  email: 'test@geulpi.com'
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            }
          })
        });
      } else if (postData?.includes('chatWithEventManagement')) {
        // Mock AI chat response for event creation
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              chatWithEventManagement: {
                response: '네, 일정을 생성했습니다.',
                events: [{
                  id: 'ai-event-1',
                  title: '회의',
                  startTime: new Date().toISOString(),
                  endTime: new Date(Date.now() + 3600000).toISOString()
                }],
                suggestions: []
              }
            }
          })
        });
      } else {
        await route.continue();
      }
    });
  });

  test('should show empty calendar for new users', async ({ page }) => {
    await page.goto('/calendar');
    
    // Wait for page to load and check for calendar view
    await page.waitForLoadState('networkidle');
    
    // Should see calendar view
    await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();
    
    // Should see empty state or helper text
    const emptyMessage = page.locator('text=이 기간에 일정이 없습니다.');
    const welcomeMessage = page.locator('text=일정 관리 도우미입니다');
    await expect(emptyMessage.or(welcomeMessage)).toBeVisible();
  });

  test('should create event via chat interface', async ({ page }) => {
    await page.goto('/calendar');
    
    // Find chat input
    const chatInput = page.locator('[data-testid="chat-input"]');
    await expect(chatInput).toBeVisible();
    
    // Type event creation message
    await chatInput.fill('내일 오후 2시에 팀 미팅 일정 추가해줘');
    
    // Send message (Enter key or send button)
    await chatInput.press('Enter');
    
    // Wait for AI response
    await expect(page.locator('text=일정을 생성했습니다')).toBeVisible();
    
    // Verify event appears on calendar
    await expect(page.locator('[data-testid="calendar-event"]').first()).toBeVisible();
  });

  test('should create event via manual form', async ({ page }) => {
    await page.goto('/calendar');
    
    // Click add event button
    const addButton = page.locator('[data-testid="add-event-button"]');
    await addButton.click();
    
    // Fill event form
    await page.fill('[data-testid="event-title"]', '첫 번째 일정');
    await page.fill('[data-testid="event-description"]', '나의 첫 일정입니다');
    
    // Select date and time
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Select life area
    await page.selectOption('[data-testid="event-category"]', '업무');
    
    // Submit form
    await page.click('[data-testid="create-event-submit"]');
    
    // Verify event was created
    await expect(page.locator('[data-testid="calendar-event"]').first()).toBeVisible();
    await expect(page.locator('text=첫 번째 일정')).toBeVisible();
  });

  test('should show created event in calendar view', async ({ page }) => {
    // Mock response with one event
    await page.route('**/graphql', async route => {
      const postData = route.request().postData();
      if (postData?.includes('events') || postData?.includes('GetEvents')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              events: [{
                id: '1',
                title: '팀 미팅',
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 3600000).toISOString(),
                description: '주간 팀 미팅',
                location: '회의실 A',
                category: '업무',
                lifeAreaId: '1',
                isAllDay: false,
                owner: {
                  id: '1',
                  name: 'Test User'
                }
              }]
            }
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/calendar');
    
    // Verify event is displayed
    await expect(page.locator('text=팀 미팅')).toBeVisible();
    
    // Click on event to see details
    await page.click('text=팀 미팅');
    
    // Verify event details modal/popup
    await expect(page.locator('text=주간 팀 미팅')).toBeVisible();
    await expect(page.locator('text=회의실 A')).toBeVisible();
  });

  test('should edit created event', async ({ page }) => {
    // Setup page with existing event
    await page.goto('/calendar');
    
    // Mock initial event
    await page.route('**/graphql', async route => {
      const postData = route.request().postData();
      if (postData?.includes('updateEvent')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              updateEvent: {
                id: '1',
                title: '수정된 미팅',
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours
                description: '시간이 변경되었습니다'
              }
            }
          })
        });
      } else {
        await route.continue();
      }
    });
    
    // Click on existing event
    await page.click('[data-testid="calendar-event"]');
    
    // Click edit button
    await page.click('[data-testid="edit-event-button"]');
    
    // Update title
    await page.fill('[data-testid="event-title"]', '수정된 미팅');
    
    // Save changes
    await page.click('[data-testid="save-event-button"]');
    
    // Verify update
    await expect(page.locator('text=수정된 미팅')).toBeVisible();
  });
});