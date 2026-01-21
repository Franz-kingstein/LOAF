import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

type GoogleAuthState = {
  accessToken?: string;
  expiresAt?: number;
  user?: { email?: string; name?: string };
};

let inMemoryState: GoogleAuthState | null = null;

// The standard Web Client ID you provided
const CLIENT_ID = '229104397794-difor30551b64fqnf50e4jgv63vglhs8.apps.googleusercontent.com';

export async function getAuthState(): Promise<GoogleAuthState | null> {
  return inMemoryState;
}

export async function signOutGoogle(): Promise<void> {
  inMemoryState = null;
}

export async function signInWithGoogle(): Promise<GoogleAuthState | null> {
  try {
    // 1. Get the exact redirect URI Expo Go wants
    const redirectUri = AuthSession.makeRedirectUri();
    
    // 2. Open the browser manually to Google's auth page.
    // This gives us 100% control over the parameters sent to Google.
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
      `response_type=token&` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent('openid email profile')}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      // Parse the token from the URL hash
      const params: any = {};
      const hash = result.url.split('#')[1];
      if (hash) {
        hash.split('&').forEach(part => {
          const [key, value] = part.split('=');
          params[key] = value;
        });
      }

      if (params.access_token) {
        inMemoryState = {
          accessToken: params.access_token,
          expiresAt: params.expires_in ? Date.now() + parseInt(params.expires_in) * 1000 : undefined,
        };
        return inMemoryState;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Sign in error:', error);
    return null;
  }
}
