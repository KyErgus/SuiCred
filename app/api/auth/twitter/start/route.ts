import { NextResponse } from 'next/server';
import { buildAuthUrl, createState, generatePkcePair, setOAuthCookies } from '@/lib/twitter';

export const runtime = 'nodejs';

export async function GET() {
  const state = createState();
  const { verifier, challenge } = generatePkcePair();
  setOAuthCookies(state, verifier);

  const url = buildAuthUrl(state, challenge);
  return NextResponse.redirect(url);
}
