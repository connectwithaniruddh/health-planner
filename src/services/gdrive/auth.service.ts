import { GOOGLE_CLIENT_ID, ALL_SCOPES_STRING } from '../../config/gdrive.config';

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

let tokenClient: any = null;
let currentAccessToken: string | null = null;

export async function initGoogleAuthSDK(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if scripts are already loaded
    if (window.google?.accounts?.oauth2) {
      setupTokenClient();
      return resolve(true);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setupTokenClient();
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function setupTokenClient() {
  if (!window.google?.accounts?.oauth2) return;

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: ALL_SCOPES_STRING,
    callback: (tokenResponse: any) => {
      if (tokenResponse.error) {
        console.error('OAuth Token Response Error:', tokenResponse);
        return;
      }
      currentAccessToken = tokenResponse.access_token;
      window.dispatchEvent(new CustomEvent('google-auth-success', { detail: tokenResponse }));
    },
  });
}

export function requestGoogleAccessToken(prompt = '') {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt });
  } else {
    console.warn('Google Token Client not initialized');
  }
}

export function getAccessToken(): string | null {
  return currentAccessToken;
}

export function isAuthenticatedWithGoogle(): boolean {
  return currentAccessToken !== null;
}
