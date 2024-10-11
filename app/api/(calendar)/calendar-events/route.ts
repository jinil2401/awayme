import { NextResponse } from "next/server";
import googleClient from "@/lib/googleClient";
import { Types } from "mongoose";
import Calendar from "@/lib/models/calendar";
import User from "@/lib/models/user";
import { decrypt, encrypt } from "@/utils/crypto";
import { CalendarTypes } from "@/constants/calendarTypes";
import axios from "axios";
import { msalConfig } from "@/lib/microsoftClient";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { convertUtcToLocal } from "@/utils/time";
interface IEventTypes {
  accessToken: string;
  refreshToken: string;
  maxTime: string;
}

const cca = new ConfidentialClientApplication(msalConfig);

export const getGoogleEvents = async ({ accessToken, refreshToken, maxTime }: IEventTypes) => {
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
  const events = response?.map((eventData: any) => ({
    summary: eventData?.summary,
    start: eventData?.start,
    end: eventData?.end,
  }));

  // return the events
  return events;
};

export const getMicrosoftEvents = async ({
  accessToken,
  refreshToken,
  maxTime
}: IEventTypes) => {
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
    // convert the timezone to the user's local time
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const start = {
      dateTime: convertUtcToLocal(eventData?.start?.dateTime, timezone),
      timeZone: timezone,
    }
    const end = {
      dateTime: convertUtcToLocal(eventData?.end?.dateTime, timezone),
      timeZone: timezone,
    }
    return {
      summary: eventData?.subject,
      start,
      end,
    }
  });

  // return the events
  return events;
};

// get exents for a calendar based on given id
export async function GET(request: Request) {
  // extract the store id from the search params
  const { searchParams } = new URL(request.url);
  const calendarId = searchParams.get("calendarId") as string;
  const userId = searchParams.get("userId") as string;
  const maxTime = searchParams.get("maxTime") as string;

  if (!maxTime) {
    return new NextResponse(
      JSON.stringify({ message: "Missing maxTime!" }),
      { status: 400 }
    );
  }

  // check if the calendarId exist and is valid
  if (!calendarId || !Types.ObjectId.isValid(calendarId)) {
    return new NextResponse(
      JSON.stringify({ message: "Invalid or missing calendarId!" }),
      { status: 400 }
    );
  }

  // check if the calendarId exist and is valid
  if (!userId || !Types.ObjectId.isValid(userId)) {
    return new NextResponse(
      JSON.stringify({ message: "Invalid or missing calendarId!" }),
      { status: 400 }
    );
  }

  // check if the calendar exists
  const calendar = await Calendar.findById(calendarId);
  if (!calendar) {
    return new NextResponse(
      JSON.stringify({ message: "Calendar does not exist!" }),
      { status: 400 }
    );
  }

  // check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    return new NextResponse(
      JSON.stringify({ message: "User does not exist!" }),
      { status: 400 }
    );
  }

  // check if the user has the calendar
  if (String(calendar.user) !== userId) {
    return new NextResponse(
      JSON.stringify({ message: "User does not belong to the calendar!" }),
      { status: 400 }
    );
  }

  // fetch the calendar based on the both id
  let events;
  //   Fetch events based on the provider
  if (calendar?.provider.toLowerCase() === CalendarTypes.GOOGLE.toLowerCase()) {
    // fetch the encrpted access token and refresh token
    const { access_token, refresh_token } = calendar;

    // decrypt the access token and refresh token
    const accessToken = decrypt(access_token);
    const refreshToken = decrypt(refresh_token);
    // pass it to the function
    events = await getGoogleEvents({ accessToken, refreshToken, maxTime });
  } else if (
    calendar?.provider.toLowerCase() === CalendarTypes.OUTLOOK.toLowerCase()
  ) {
    // fetch the encrpted access token and refresh token
    const { access_token, refresh_token, expires_at } = calendar;

    const current_date = new Date().getTime();
    const expires_at_time = new Date(expires_at).getTime();

    // decrypt the access token and refresh token
    let accessToken = decrypt(access_token);
    const refreshToken = decrypt(refresh_token);

    if (expires_at_time < current_date) {
      // fetch latest access token.
      const result: any = await cca.acquireTokenByRefreshToken({
        refreshToken: refreshToken,
        scopes: ["User.Read", "Calendars.Read"],
      });

      // extract the name, email, access token and expiry from result
      const { accessToken: access_token, expiresOn } = result;
      accessToken = access_token;
      const token = encrypt(access_token);

      calendar.access_token = token;
      calendar.expires_at = expiresOn;
      await calendar.save();
    }
    // pass it to the function
    events = await getMicrosoftEvents({ accessToken, refreshToken, maxTime });
  }

  return new NextResponse(
    JSON.stringify(
      {
        message: "Events fetched successfully!",
        data: events,
      },
      null,
      4
    ),
    {
      status: 200,
    }
  );
}
