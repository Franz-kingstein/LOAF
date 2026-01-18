import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

// Ensure auth session results are handled correctly on web
WebBrowser.maybeCompleteAuthSession();

type FitnessSummary = {
  steps: number;
  activeMinutes: number;
};

let accessToken: string | null = null;

const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.location.read',
  'https://www.googleapis.com/auth/fitness.body.read',
];

// OAuth Client ID configured via app.json -> expo.extra.googleOAuthClientId
// Fallback to a hardcoded ID if not provided (replace with your own client ID)
export const GOOGLE_CLIENT_ID =
  (Constants?.expoConfig as any)?.extra?.googleOAuthClientId ||
  '229104397794-difor30551b64fqnf50e4jgv63vglhs8.apps.googleusercontent.com';

// NOTE: You will need to provide a webClientId (OAuth client) from Google Cloud Console.
// For now, we request using prompt; caller can pass client IDs.
export async function ensureFitnessPermissions(): Promise<boolean> {
  try {
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };

    // Use OAuth Code + PKCE (recommended) and explicit redirect URI tied to app scheme.
    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: GOOGLE_FIT_SCOPES,
      redirectUri: AuthSession.makeRedirectUri(),
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      extraParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    });

    await request.makeAuthUrlAsync(discovery);
    const result = await request.promptAsync(discovery);

    if (result.type === 'success') {
      // Exchange the code for tokens
      const tokenRes = await AuthSession.exchangeCodeAsync(
        {
          code: result.params.code as string,
          clientId: GOOGLE_CLIENT_ID,
          redirectUri: request.redirectUri,
          extraParams: { code_verifier: request.codeVerifier! },
        },
        discovery
      );

      if (tokenRes.accessToken) {
        accessToken = tokenRes.accessToken;
        return true;
      }
    }

    return false;
  } catch (e) {
    console.warn('Google Fit permission error:', e);
    return false;
  }
}

function getMidnight(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

async function fitnessAggregate(from: Date, to: Date): Promise<FitnessSummary> {
  if (!accessToken) {
    // Not authorized; let caller handle a null result without noisy warnings
    // Returning zeros avoids throwing during initial app load before authorization.
    return { steps: 0, activeMinutes: 0 };
  }

  const body = {
    aggregateBy: [
      { dataTypeName: 'com.google.step_count.delta' },
      { dataTypeName: 'com.google.active_minutes' },
    ],
    bucketByTime: { durationMillis: to.getTime() - from.getTime() },
    startTimeMillis: from.getTime(),
    endTimeMillis: to.getTime(),
  };

  const res = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Fit API error: ${res.status} ${text}`);
  }

  const json = await res.json();
  // Parse buckets
  let steps = 0;
  let activeMinutes = 0;
  const buckets = json.bucket || [];
  for (const b of buckets) {
    const datasets = b.dataset || [];
    for (const ds of datasets) {
      const points = ds.point || [];
      for (const p of points) {
        const type = p.dataTypeName;
        const val = p.value?.[0]?.intVal ?? p.value?.[0]?.fpVal ?? 0;
        if (type === 'com.google.step_count.delta') steps += val;
        if (type === 'com.google.active_minutes') activeMinutes += val;
      }
    }
  }

  return { steps, activeMinutes };
}

export async function getTodayFitnessSummary(): Promise<FitnessSummary | null> {
  try {
    const now = new Date();
    const start = getMidnight(now);
    const end = getEndOfDay(now);
    return await fitnessAggregate(start, end);
  } catch (e) {
    // Only warn when we have an access token and the API fails; otherwise stay quiet
    if (accessToken) {
      console.warn('Fitness summary fetch error:', e);
    }
    return null;
  }
}

export function isAuthorized(): boolean {
  return !!accessToken;
}
