
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  // In a real application, this is where you would construct the
  // Google OAuth URL using your credentials from environment variables.
  
  // 1. Get credentials from environment variables (NEVER hardcode them)
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI 
  );
  
  // 2. Define the scopes (permissions) you are asking for.
  // This scope allows read-only access to calendar events.
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events.readonly'
  ];
  
  // 3. Generate the URL that the user will be sent to for authorization.
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'offline' is needed to get a refresh token
    scope: scopes
  });

  // 4. Redirect the user to the generated URL.
  // In a real implementation, you would uncomment the line below:
  // return NextResponse.redirect(url);

  // For this simulation, we'll just redirect back to the calendar
  // with a success query parameter, as before.
  const redirectUrl = new URL('/dashboard/calendar', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002');
  redirectUrl.searchParams.set('gcal_connected', 'true');

  return NextResponse.redirect(redirectUrl.toString());
}

