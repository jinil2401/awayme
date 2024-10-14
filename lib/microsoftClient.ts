import { convertUtcToLocal } from "@/utils/time";
import axios from "axios";

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

export const msalConfig = {
  auth: {
    clientId: process.env.AZURE_AD_CLIENT_ID as string,
    authority: `https://login.microsoftonline.com/common/`,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
  },
};

export async function getMicrosoftEvents({
  accessToken,
  refreshToken,
  maxTime,
  timeZone,
}: IEventTypes) {
  const currentTime = new Date().toISOString();
  const calendarResponse = await axios.get(
    `https://graph.microsoft.com/v1.0/me/events?$top=1000&$expand=instances&$filter=start/dateTime ge '${currentTime}' and end/dateTime le '${maxTime}'`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // extract the events to format
  const response = calendarResponse.data.value;

  // format the events for the calendar component
  const events = response?.map((eventData: any) => {
    const start = {
      dateTime: convertUtcToLocal(eventData?.start?.dateTime, timeZone),
      timeZone: timeZone,
    };
    const end = {
      dateTime: convertUtcToLocal(eventData?.end?.dateTime, timeZone),
      timeZone: timeZone,
    };
    return {
      summary: eventData?.subject,
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

export async function storeOutlookEvents({
  events,
  accessToken,
  refreshToken,
}: IStoreEventTypes) {
  const url = "https://graph.microsoft.com/v1.0/me/events";

  const promises = events.map((event: any) => async () => {
    try {
      await axios.post(url, event, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      return null; // Return null for successful operations
    } catch (error) {
      return { error, event }; // Return error with the event
    }
  });

  const results = await processSequentially(promises);
  const errors = results.filter((result) => result);

  return { success: errors.length === 0, errors };
}
