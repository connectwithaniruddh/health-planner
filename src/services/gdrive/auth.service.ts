import { GOOGLE_CLIENT_ID, ALL_SCOPES_STRING } from '../../config/gdrive.config';

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

let tokenClient: any = null;
let currentAccessToken: string | null = null;

// Restore token from localStorage if valid
try {
  const savedToken = localStorage.getItem('hp_gdrive_token');
  const savedExp = localStorage.getItem('hp_gdrive_token_exp');
  if (savedToken && savedExp && Number(savedExp) > Date.now()) {
    currentAccessToken = savedToken;
  }
} catch (e) {
  // LocalStorage disabled or unavailable
}

export async function initGoogleAuthSDK(): Promise<boolean> {
  return new Promise((resolve) => {
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
      const expiresInSec = Number(tokenResponse.expires_in) || 3600;
      try {
        localStorage.setItem('hp_gdrive_token', currentAccessToken || '');
        localStorage.setItem('hp_gdrive_token_exp', String(Date.now() + expiresInSec * 1000));
      } catch (e) {}

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
  if (currentAccessToken) {
    const savedExp = localStorage.getItem('hp_gdrive_token_exp');
    if (savedExp && Number(savedExp) <= Date.now()) {
      currentAccessToken = null;
      try {
        localStorage.removeItem('hp_gdrive_token');
        localStorage.removeItem('hp_gdrive_token_exp');
      } catch (e) {}
    }
  }
  return currentAccessToken;
}

export function isAuthenticatedWithGoogle(): boolean {
  return getAccessToken() !== null;
}
