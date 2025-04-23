import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SITE_PASSWORD = 'TennantFam2467*/';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (password === SITE_PASSWORD) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('site_pass', SITE_PASSWORD, {
        httpOnly: true,
        secure: false,
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });
      return response;
    }
    return NextResponse.json({ success: false, message: 'Incorrect password' }, { status: 401 });
  } catch (err) {
    console.error('Error processing request:', err);
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}
