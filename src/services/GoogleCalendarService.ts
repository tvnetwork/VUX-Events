
declare const google: any;

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number | null = null;

export const GoogleCalendarService = {
  isConfigured: () => !!CLIENT_ID,

  getAccessToken: (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Check if we have a valid cached token
      if (cachedAccessToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
        return resolve(cachedAccessToken);
      }

      if (!CLIENT_ID) {
        return reject(new Error('VITE_GOOGLE_CLIENT_ID is not configured in environment variables.'));
      }

      if (typeof google === 'undefined') {
        return reject(new Error('Google Identity Services library not loaded. Check index.html.'));
      }

      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response: any) => {
            if (response.access_token) {
              cachedAccessToken = response.access_token;
              // Token usually expires in 1 hour (3600 seconds)
              tokenExpiresAt = Date.now() + (response.expires_in || 3600) * 1000;
              resolve(response.access_token);
            } else {
              reject(new Error('Failed to get access token: ' + (response.error || 'Unknown error')));
            }
          },
        });
        client.requestAccessToken();
      } catch (error) {
        reject(error);
      }
    });
  },

  listEvents: async (timeMin: string = new Date().toISOString()) => {
    try {
      const token = await GoogleCalendarService.getAccessToken();
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=10&orderBy=startTime&singleEvents=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch calendar events');
      }

      return await response.json();
    } catch (error) {
      console.error('Google Calendar listEvents error:', error);
      throw error;
    }
  },

  syncEvent: async (event: {
    summary: string;
    description: string;
    start: { dateTime: string };
    end: { dateTime: string };
    location?: string;
  }) => {
    try {
      const token = await GoogleCalendarService.getAccessToken();
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to sync event to Google Calendar');
      }

      return await response.json();
    } catch (error) {
      console.error('Google Calendar syncEvent error:', error);
      throw error;
    }
  }
};
