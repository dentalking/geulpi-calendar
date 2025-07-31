import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';

export class GoogleAuthHelper {
  private oauth2Client: OAuth2Client;
  
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Get access token using service account or refresh token
   */
  async getAccessToken(): Promise<string> {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
      // Use service account for automated tests
      const keyFile = await fs.readFile(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH, 'utf8');
      const key = JSON.parse(keyFile);
      
      const jwtClient = new google.auth.JWT(
        key.client_email,
        undefined,
        key.private_key,
        [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ],
        process.env.GOOGLE_TEST_USER_EMAIL // Impersonate test user
      );
      
      const { access_token } = await jwtClient.getAccessToken();
      return access_token!;
    } else if (process.env.GOOGLE_TEST_USER_REFRESH_TOKEN) {
      // Use refresh token
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_TEST_USER_REFRESH_TOKEN
      });
      
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      return credentials.access_token!;
    }
    
    throw new Error('No Google authentication method configured');
  }

  /**
   * Create a test calendar for E2E tests
   */
  async createTestCalendar(): Promise<string> {
    const accessToken = await this.getAccessToken();
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    
    this.oauth2Client.setCredentials({ access_token: accessToken });
    
    const response = await calendar.calendars.insert({
      requestBody: {
        summary: `E2E Test Calendar ${Date.now()}`,
        description: 'Automated test calendar - safe to delete',
        timeZone: 'Asia/Seoul'
      }
    });
    
    return response.data.id!;
  }

  /**
   * Clean up test data from Google Calendar
   */
  async cleanupTestCalendar(calendarId: string) {
    try {
      const accessToken = await this.getAccessToken();
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      // Delete all events in the test calendar
      const events = await calendar.events.list({
        calendarId,
        maxResults: 100
      });
      
      for (const event of events.data.items || []) {
        await calendar.events.delete({
          calendarId,
          eventId: event.id!
        });
      }
      
      // Delete the calendar itself
      await calendar.calendars.delete({ calendarId });
    } catch (error) {
      console.error('Failed to cleanup test calendar:', error);
    }
  }

  /**
   * Create a mock auth token for the test user
   */
  async createTestAuthToken(): Promise<string> {
    const accessToken = await this.getAccessToken();
    
    // Your backend should validate this token and create a session
    return Buffer.from(JSON.stringify({
      googleAccessToken: accessToken,
      email: process.env.GOOGLE_TEST_USER_EMAIL,
      testMode: true
    })).toString('base64');
  }
}

export const googleAuthHelper = new GoogleAuthHelper();