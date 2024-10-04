import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

export default function googleClient({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const oauth2Client = new OAuth2Client({
    clientId,
    clientSecret,
  });

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // Use the provider token to authenticate with the Google Calendar API
  const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client,
  });

  return calendar;
}
