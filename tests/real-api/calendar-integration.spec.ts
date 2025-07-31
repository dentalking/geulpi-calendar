import { test, expect } from '../e2e-real-api.config';

test.describe('Real Google Calendar Integration', () => {
  test('should create event in real Google Calendar', async ({ 
    authenticatedPage, 
    apiHelper, 
    testCalendarId 
  }) => {
    // Navigate to calendar page
    await authenticatedPage.goto('/calendar');
    
    // Create new event using magic command
    await authenticatedPage.fill('[data-testid="magic-input"]', 
      '내일 오후 2시 강남역에서 미팅 추가해줘');
    await authenticatedPage.press('[data-testid="magic-input"]', 'Enter');
    
    // Wait for OpenAI to process
    await authenticatedPage.waitForSelector('[data-testid="event-created-toast"]', {
      timeout: 10000 // Real API might be slower
    });
    
    // Verify event was created in Google Calendar
    const isRealResponse = await apiHelper.verifyRealApiResponse('googleapis.com');
    expect(isRealResponse).toBeTruthy();
    
    // Check event appears in UI
    await authenticatedPage.waitForSelector('[data-testid="event-title"]:has-text("미팅")');
    
    // Verify location was resolved via Google Places
    const eventLocation = await authenticatedPage.textContent('[data-testid="event-location"]');
    expect(eventLocation).toContain('강남역');
    
    // Test real-time sync
    await authenticatedPage.reload();
    
    // Event should still be there after reload (fetched from Google Calendar)
    await expect(authenticatedPage.locator('[data-testid="event-title"]:has-text("미팅")')).toBeVisible();
  });

  test('should handle Google Calendar API errors gracefully', async ({ 
    authenticatedPage,
    page 
  }) => {
    // Simulate API quota exceeded
    await page.route('**/calendar/v3/**', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 429,
            message: 'Quota exceeded',
            errors: [{
              domain: 'usageLimits',
              reason: 'quotaExceeded'
            }]
          }
        })
      });
    });
    
    // Try to create event
    await authenticatedPage.goto('/calendar');
    await authenticatedPage.click('[data-testid="create-event-button"]');
    
    // Should show user-friendly error
    await expect(authenticatedPage.locator('[data-testid="error-message"]'))
      .toContainText('일시적으로 캘린더 서비스를 사용할 수 없습니다');
    
    // Should offer offline mode
    await expect(authenticatedPage.locator('[data-testid="offline-mode-prompt"]'))
      .toBeVisible();
  });
});

test.describe('Real OpenAI Integration', () => {
  test('should process natural language with GPT-4', async ({ 
    authenticatedPage,
    apiHelper 
  }) => {
    await authenticatedPage.goto('/calendar');
    
    // Complex natural language input
    await authenticatedPage.fill('[data-testid="magic-input"]', 
      '매주 월수금 오전 9시에 팀 스탠드업 미팅을 추가하고, 금요일은 회고도 포함해서 30분 더 길게 잡아줘');
    await authenticatedPage.press('[data-testid="magic-input"]', 'Enter');
    
    // Wait for AI processing
    await authenticatedPage.waitForSelector('[data-testid="ai-processing"]');
    
    // Verify real OpenAI response
    const isRealAI = await apiHelper.verifyRealApiResponse('api.openai.com');
    expect(isRealAI).toBeTruthy();
    
    // Check created recurring events
    await authenticatedPage.waitForSelector('[data-testid="recurring-event-indicator"]');
    
    // Verify AI understood the context
    const mondayEvent = await authenticatedPage.locator('[data-testid="event-monday"]').first();
    expect(await mondayEvent.getAttribute('data-duration')).toBe('30');
    
    const fridayEvent = await authenticatedPage.locator('[data-testid="event-friday"]').first();
    expect(await fridayEvent.getAttribute('data-duration')).toBe('60');
  });

  test('should extract schedule from photo using Vision + GPT-4', async ({ 
    authenticatedPage,
    apiHelper 
  }) => {
    await authenticatedPage.goto('/calendar/import');
    
    // Upload schedule photo
    const fileInput = await authenticatedPage.locator('input[type="file"]');
    await fileInput.setInputFiles('./test-assets/conference-schedule.jpg');
    
    // Wait for Vision API + GPT-4 processing
    await authenticatedPage.waitForSelector('[data-testid="extraction-complete"]', {
      timeout: 20000 // Real API processing takes time
    });
    
    // Verify both APIs were called
    expect(await apiHelper.verifyRealApiResponse('vision.googleapis.com')).toBeTruthy();
    expect(await apiHelper.verifyRealApiResponse('api.openai.com')).toBeTruthy();
    
    // Check extracted events
    const extractedEvents = await authenticatedPage.locator('[data-testid="extracted-event"]').count();
    expect(extractedEvents).toBeGreaterThan(0);
    
    // Confirm import
    await authenticatedPage.click('[data-testid="import-all-button"]');
    
    // Wait for Google Calendar sync
    await authenticatedPage.waitForSelector('[data-testid="import-success"]');
  });
});

test.describe('Real Google Places Integration', () => {
  test('should find optimal meeting location', async ({ 
    authenticatedPage,
    apiHelper 
  }) => {
    await authenticatedPage.goto('/calendar/new-event');
    
    // Add attendees with different locations
    await authenticatedPage.fill('[data-testid="attendee-1"]', 'user1@geulpi.com');
    await authenticatedPage.fill('[data-testid="attendee-1-location"]', '서울역');
    
    await authenticatedPage.fill('[data-testid="attendee-2"]', 'user2@geulpi.com');
    await authenticatedPage.fill('[data-testid="attendee-2-location"]', '강남역');
    
    // Request optimal location
    await authenticatedPage.click('[data-testid="find-optimal-location"]');
    
    // Wait for Places API processing
    await authenticatedPage.waitForSelector('[data-testid="location-suggestions"]');
    
    // Verify real Google Places response
    expect(await apiHelper.verifyRealApiResponse('maps.googleapis.com')).toBeTruthy();
    
    // Check suggestions include real places
    const suggestions = await authenticatedPage.locator('[data-testid="place-suggestion"]').count();
    expect(suggestions).toBeGreaterThan(0);
    
    // Verify place details
    const firstPlace = await authenticatedPage.locator('[data-testid="place-suggestion"]').first();
    await expect(firstPlace.locator('[data-testid="place-name"]')).toBeVisible();
    await expect(firstPlace.locator('[data-testid="place-address"]')).toBeVisible();
    await expect(firstPlace.locator('[data-testid="travel-time"]')).toBeVisible();
  });
});