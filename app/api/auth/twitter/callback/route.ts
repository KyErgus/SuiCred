import { NextResponse } from 'next/server';
import {
  clearOAuthCookies,
  exchangeCodeForToken,
  fetchProfile,
  readOAuthCookies,
  setSessionCookie
} from '@/lib/twitter';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const { state: storedState, verifier } = readOAuthCookies();

  if (!code || !state || !storedState || !verifier || state !== storedState) {
    clearOAuthCookies();
    return NextResponse.redirect(new URL('/?twitter=error', req.url));
  }

  try {
    const { access_token } = await exchangeCodeForToken(code, verifier);
    const profile = await fetchProfile(access_token);
    setSessionCookie(profile);
  } catch {
    clearOAuthCookies();
    return NextResponse.redirect(new URL('/?twitter=error', req.url));
  }

  clearOAuthCookies();
  return NextResponse.redirect(new URL('/?twitter=connected', req.url));
}
