import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

type GoogleAuthState = {
  accessToken?: string;
  expiresAt?: number;
  user?: { email?: string; name?: string };
};

let inMemoryState: GoogleAuthState | null = null;

export async function getAuthState(): Promise<GoogleAuthState | null> {
  return inMemoryState;
}

export async function signOutGoogle(): Promise<void> {
  inMemoryState = null;
}

export async function signInWithGoogle(): Promise<GoogleAuthState | null> {
  try {
    const redirectUri = AuthSession.makeRedirectUri({ scheme: 'LOAF' });
    const discovery = Google.discovery;
    const request = new AuthSession.AuthRequest({
  clientId: '229104397794-4055r0jsp7mqbcmpdqaj50sn53ojt0dj.apps.googleusercontent.com',
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
      scopes: ['openid', 'email', 'profile'],
    });
    await request.makeAuthUrlAsync(discovery);
    const result = await request.promptAsync(discovery);
    if (result.type !== 'success' || !result.authentication?.accessToken) {
      return null;
    }
    inMemoryState = {
      accessToken: result.authentication.accessToken,
      expiresAt: result.authentication.expiresIn ? Date.now() + result.authentication.expiresIn * 1000 : undefined,
    };
    return inMemoryState;
  } catch {
    return null;
  }
}
