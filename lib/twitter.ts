import crypto from 'crypto';
import { cookies } from 'next/headers';

export type TwitterProfile = {
  id: string;
  username: string;
  name?: string;
};

const COOKIE_NAME = 'suicred_twitter';
const STATE_COOKIE = 'suicred_twitter_state';
const VERIFIER_COOKIE = 'suicred_twitter_verifier';

const BASE_URL = 'https://twitter.com/i/oauth2';
const AUTH_URL = `${BASE_URL}/authorize`;
const TOKEN_URL = 'https://api.twitter.com/2/oauth2/token';
const ME_URL = 'https://api.twitter.com/2/users/me?user.fields=profile_image_url,verified';

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export function getCallbackUrl() {
  const base = getEnv('NEXT_PUBLIC_SITE_URL');
  return `${base}/api/auth/twitter/callback`;
}

export function generatePkcePair() {
  const verifier = crypto.randomBytes(32).toString('hex');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return { verifier, challenge };
}

export function createState() {
  return crypto.randomBytes(16).toString('hex');
}

export function setOAuthCookies(state: string, verifier: string) {
  const store = cookies();
  store.set(STATE_COOKIE, state, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 600 });
  store.set(VERIFIER_COOKIE, verifier, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 600 });
}

export function readOAuthCookies() {
  const store = cookies();
  const state = store.get(STATE_COOKIE)?.value;
  const verifier = store.get(VERIFIER_COOKIE)?.value;
  return { state, verifier };
}

export function clearOAuthCookies() {
  const store = cookies();
  store.set(STATE_COOKIE, '', { path: '/', maxAge: 0 });
  store.set(VERIFIER_COOKIE, '', { path: '/', maxAge: 0 });
}

function signPayload(payload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function setSessionCookie(profile: TwitterProfile) {
  const secret = getEnv('TWITTER_SESSION_SECRET');
  const payload = Buffer.from(JSON.stringify(profile)).toString('base64url');
  const signature = signPayload(payload, secret);
  const value = `${payload}.${signature}`;

  cookies().set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

export function getSessionProfile(): TwitterProfile | null {
  const secret = process.env.TWITTER_SESSION_SECRET;
  if (!secret) return null;

  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [payload, signature] = raw.split('.');
  if (!payload || !signature) return null;

  const expected = signPayload(payload, secret);
  if (expected !== signature) return null;

  try {
    const json = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(json) as TwitterProfile;
  } catch {
    return null;
  }
}

export function buildAuthUrl(state: string, challenge: string) {
  const clientId = getEnv('TWITTER_CLIENT_ID');
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: getCallbackUrl(),
    scope: 'tweet.read users.read offline.access',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256'
  });

  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, verifier: string) {
  const clientId = getEnv('TWITTER_CLIENT_ID');
  const clientSecret = getEnv('TWITTER_CLIENT_SECRET');

  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    redirect_uri: getCallbackUrl(),
    code_verifier: verifier,
    client_id: clientId
  });

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`
    },
    body
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  return res.json() as Promise<{ access_token: string }>;
}

export async function fetchProfile(accessToken: string): Promise<TwitterProfile> {
  const res = await fetch(ME_URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Profile fetch failed: ${text}`);
  }

  const json = (await res.json()) as { data: { id: string; username: string; name?: string } };
  return json.data;
}
