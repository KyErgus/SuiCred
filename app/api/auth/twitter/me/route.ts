import { NextResponse } from 'next/server';
import { getSessionProfile } from '@/lib/twitter';

export const runtime = 'nodejs';

export async function GET() {
  const profile = getSessionProfile();
  return NextResponse.json({ profile });
}
