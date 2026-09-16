// Google OAuth 2.0 PKCE Client Configuration
// Web Client ID authorized for https://connectwithaniruddh.github.io
export const GOOGLE_CLIENT_ID = '897358453930-ei1mpjk3c8a60k7nr0jkgliltg7hncsk.apps.googleusercontent.com';
export const GOOGLE_API_KEY = ''; // Restricted Client-side API Key (optional for public endpoints)

export const GOOGLE_SCOPES = {
  DRIVE_APPDATA: 'https://www.googleapis.com/auth/drive.appdata',
  CALENDAR_EVENTS: 'https://www.googleapis.com/auth/calendar.events',
  TASKS: 'https://www.googleapis.com/auth/tasks',
  GMAIL_SEND: 'https://www.googleapis.com/auth/gmail.send',
};

export const ALL_SCOPES_STRING = [
  GOOGLE_SCOPES.DRIVE_APPDATA,
  GOOGLE_SCOPES.CALENDAR_EVENTS,
  GOOGLE_SCOPES.TASKS,
  GOOGLE_SCOPES.GMAIL_SEND,
].join(' ');
