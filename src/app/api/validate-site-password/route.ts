import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    
    // Temporary implementation for site access password validation.
    // This checks against an environment variable for security.
    // Note: This is a stopgap measure. Future updates should integrate with Supabase Auth or NextAuth.js for robust user authentication and role management.
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    const SITE_PASSWORD = process.env.SITE_PASSWORD;
    if (!SITE_PASSWORD) {
      console.error('SITE_PASSWORD environment variable is not set.');
      return NextResponse.json({ error: 'Server configuration error. Please contact an administrator.' }, { status: 500 });
    }
    
    if (password === SITE_PASSWORD) {
      // Set a cookie to indicate the user has passed the password gate
      const response = NextResponse.json({ success: true }, { status: 200 });
      response.cookies.set({
        name: 'site-access-granted',
        value: 'true',
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year expiration
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        httpOnly: true, // Protect against XSS attacks
      });
      return response;
    } else {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error validating site password:', error);
    return NextResponse.json({ error: 'Server error occurred. Please try again later.' }, { status: 500 });
  }
}
