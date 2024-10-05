import { NextResponse } from "next/server";
import googleClient from "@/lib/googleClient";
import { Types } from "mongoose";
import Calendar from "@/lib/models/calendar";
import User from "@/lib/models/user";
import { decrypt } from "@/utils/crypto";
import { CalendarTypes } from "@/constants/calendarTypes";
import axios from "axios";
interface IEventTypes {
  accessToken: string;
  refreshToken: string;
}

const getGoogleEvents = async ({ accessToken, refreshToken }: IEventTypes) => {
  const calendar = googleClient({
    accessToken,
    refreshToken,
  });

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    timeMax: new Date(new Date().getTime() + 3600000 * 24 * 30).toISOString(), // 30 days in milliseconds
    singleEvents: true,
    orderBy: "startTime",
  });

  // extract the events to format
  const response = res.data.items;

  // format the events for the calendar component
  const events = response?.map((eventData: any) => ({
    id: eventData?.id,
    title: eventData?.summary,
    start: eventData?.start,
    end: eventData?.end,
  }));

  // return the events 
  return events;
};

const getMicrosoftEvents = async ({
  accessToken,
  refreshToken,
}: IEventTypes) => {
  const calendarResponse = await axios.get(
    "https://graph.microsoft.com/v1.0/me/events",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // extract the events to format
  const response = calendarResponse.data.value;

  // format the events for the calendar component
  const events = response?.map((eventData: any) => ({
    id: eventData?.id,
    title: eventData?.subject,
    start: eventData?.start,
    end: eventData?.end,
  }));

  // return the events
  return events;
};

// get exents for a calendar based on given id
export async function GET(request: Request) {
  // extract the store id from the search params
  const { searchParams } = new URL(request.url);
  const calendarId = searchParams.get("calendarId");
  const userId = searchParams.get("userId");

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
    events = await getGoogleEvents({ accessToken, refreshToken });
  } else if (
    calendar?.provider.toLowerCase() === CalendarTypes.OUTLOOK.toLowerCase()
  ) {
    // fetch the encrpted access token and refresh token
    const { access_token, refresh_token } = calendar;

    // decrypt the access token and refresh token
    const accessToken = decrypt(access_token);
    const refreshToken = decrypt(refresh_token);
    // pass it to the function
    events = await getMicrosoftEvents({ accessToken, refreshToken });
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
