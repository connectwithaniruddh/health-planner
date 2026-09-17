import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from '../../config/gdrive.config';
declare global { interface Window { google?: any; gapi?: any; } }
let token: string | null = null;
let expiresAt = 0;
let scopes = new Set<string>();
let sdk: Promise<boolean> | undefined;
let pending = false;
try { localStorage.removeItem('hp_gdrive_token'); localStorage.removeItem('hp_gdrive_token_exp'); } catch {}
export function initGoogleAuthSDK(): Promise<boolean> {
  if (window.google?.accounts?.oauth2) return Promise.resolve(true);
  if (!sdk) sdk = new Promise<boolean>(resolve => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client'; script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => { sdk = undefined; resolve(false); };
    document.head.appendChild(script);
  });
  return sdk;
}
export async function authorizeGoogle(requested: string[]): Promise<void> {
  if (pending) throw new Error('A Google connection is already in progress.');
  if (!(await initGoogleAuthSDK())) throw new Error('Google sign-in could not load. Check your connection.');
  pending = true;
  return new Promise<void>((resolve, reject) => {
    const fail = (message: string) => { pending = false; reject(new Error(message)); };
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID, scope: requested.join(' '), include_granted_scopes: true,
      error_callback: () => fail('Google sign-in was closed or blocked. Try connecting again.'),
      callback: (response: any) => {
        if (response.error) return fail(response.error_description || response.error);
        token = response.access_token; expiresAt = Date.now() + Number(response.expires_in || 3600) * 1000;
        scopes = new Set(String(response.scope || '').split(' ')); pending = false;
        window.dispatchEvent(new CustomEvent('google-auth-success'));
        if (!requested.every(scope => scopes.has(scope))) reject(new Error('Some permissions were declined. Enable the service to try again.'));
        else resolve();
      },
    });
    client.requestAccessToken({ prompt: 'consent' });
  });
}
export function requestGoogleAccessToken(_prompt = '') {
  void authorizeGoogle([GOOGLE_SCOPES.DRIVE_APPDATA]).catch(error => window.dispatchEvent(new CustomEvent('google-auth-error', { detail: String(error) })));
}
export function getAccessToken(): string | null { if (Date.now() >= expiresAt) token = null; return token; }
export function isAuthenticatedWithGoogle(): boolean { return !!getAccessToken(); }
export function hasGoogleScope(scope: string): boolean { return !!getAccessToken() && scopes.has(scope); }
export function disconnectGoogle() { if (token) window.google?.accounts?.oauth2?.revoke(token); token = null; expiresAt = 0; scopes.clear(); window.dispatchEvent(new CustomEvent('google-auth-change')); }
