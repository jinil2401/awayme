import { convertUtcToLocal } from "@/utils/time";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

interface IEventTypes {
  accessToken: string;
  refreshToken: string;
  maxTime: string;
  timeZone: string;
}

interface IStoreEventTypes {
  accessToken: string;
  refreshToken: string;
  events: any;
}

function googleClient({
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

export async function getGoogleEvents({
  accessToken,
  refreshToken,
  maxTime,
  timeZone,
}: IEventTypes) {
  const calendar = googleClient({
    accessToken,
    refreshToken,
  });

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    timeMax: maxTime,
    singleEvents: true,
    orderBy: "startTime",
  });

  // extract the events to format
  const response = res.data.items;

  // format the events for the calendar component
  const events = response?.map((eventData: any) => {
    // convert the timezone to the user's local time
    const start = {
      dateTime: convertUtcToLocal(eventData?.start?.dateTime, timeZone),
      timeZone: timeZone,
    };
    const end = {
      dateTime: convertUtcToLocal(eventData?.end?.dateTime, timeZone),
      timeZone: timeZone,
    };
    return {
      summary: eventData?.summary,
      start,
      end,
    };
  });

  // return the events
  return events;
}

// Utility function to process promises sequentially
async function processSequentially(promises: any) {
  const results = [];
  for (const promise of promises) {
    results.push(await promise());
  }
  return results;
}

export async function storeGoogleEvents({
  events,
  accessToken,
  refreshToken,
}: IStoreEventTypes) {
  const calendar = googleClient({ accessToken, refreshToken });

  const promises = events.map((event: any) => async () => {
    try {
      return await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });
    } catch (error) {
      return { error, event }; // Return error with the event
    }
  });

  const results = await processSequentially(promises);
  const errors = results.filter((result) => result && result.error);

  return { success: errors.length === 0, errors };
}
