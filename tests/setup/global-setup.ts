import { chromium, FullConfig } from '@playwright/test';
import { sessionManager } from '../helpers/session-manager';

async function globalSetup(config: FullConfig) {
  console.log('Running global setup...');

  // Check if we already have a valid session
  const hasValidSession = await sessionManager.hasValidSession();
  
  if (hasValidSession && process.env.E2E_TEST_MODE === 'true') {
    console.log('Using existing auth session');
    return;
  }

  // If no valid session, perform login
  console.log('No valid session found, performing login...');
  
  const browser = await chromium.launch({
    headless: process.env.PLAYWRIGHT_HEADLESS !== 'false'
  });
  
  const context = await browser.newContext({
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000'
  });
  
  const page = await context.newPage();
  
  try {
    await sessionManager.performOAuthLogin(page, context);
    console.log('Login successful, session saved');
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;