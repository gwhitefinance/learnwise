
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function GET() {
  // Ensure that the necessary environment variables are set.
  if (
    !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  ) {
    console.error("Missing Google OAuth environment variables.");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }
  
  // Create a new OAuth2 client.
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  // Define the scopes for the Google Calendar API.
  // 'readonly' is sufficient if you only need to display calendar events.
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events.readonly'
  ];

  // Generate the authorization URL.
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'offline' is necessary to get a refresh token
    scope: scopes,
  });

  // Redirect the user to the Google consent screen.
  return NextResponse.redirect(url);
}
