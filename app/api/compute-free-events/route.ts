import { CalendarTypes } from "@/constants/calendarTypes";
import Calendar from "@/lib/models/calendar";
import User from "@/lib/models/user";
import { decrypt, encrypt } from "@/utils/crypto";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { getGoogleEvents, getMicrosoftEvents } from "../calendar-events/route";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { msalConfig } from "@/lib/microsoftClient";

const cca = new ConfidentialClientApplication(msalConfig);

function findFreeSlots(events: any) {
  const busyTimes = events.map((event: any) => ({
    start: new Date(event.start),
    end: new Date(event.end),
  }));

  const freeSlots = [];
  const now = new Date();

  for (
    let d = new Date(now);
    d <= new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    d.setDate(d.getDate() + 1)
  ) {
    const day = d.getDay();

    if (day >= 1 && day <= 5) {
      let lastEndTime = new Date(d.setHours(8, 0, 0));
      const workingHoursEnd = new Date(d.setHours(18, 0, 0));

      for (const busy of busyTimes) {
        if (
          lastEndTime < busy.start &&
          busy.start >= lastEndTime &&
          busy.start <= workingHoursEnd
        ) {
          freeSlots.push({ start: lastEndTime, end: busy.start });
        }
        if (
          lastEndTime < busy.end &&
          busy.start >= lastEndTime &&
          busy.start <= workingHoursEnd
        ) {
          lastEndTime = busy.end;
        }
      }

      if (lastEndTime < workingHoursEnd) {
        freeSlots.push({ start: lastEndTime, end: workingHoursEnd });
      }
    }
  }

  return freeSlots;
}

function createRandomEvents({
  freeSlots,
  minDuration,
  maxDuration,
  percentage,
  timeZone,
}: {
  freeSlots: any;
  minDuration: any;
  maxDuration: any;
  percentage: any;
  timeZone: any;
}) {
  const randomEvents = [];

  const numberOfEvents = Math.floor(freeSlots.length * (percentage / 100));

  const shuffledSlots = freeSlots
    .sort(() => 0.5 - Math.random())
    .slice(0, numberOfEvents);

  for (const slot of shuffledSlots) {
    const randomDuration =
      Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;

    const randomStartOffset = Math.floor(
      Math.random() * ((slot.end - slot.start) / (60 * 1000) - randomDuration)
    );
    const eventStart = new Date(
      slot.start.getTime() + randomStartOffset * 60 * 1000
    );
    const eventEnd = new Date(
      eventStart.getTime() + randomDuration * 60 * 1000
    );

    randomEvents.push({
      summary: "Awayme Event",
      description: "This event is created by Awayme",
      start: { dateTime: eventStart.toISOString(), timeZone: timeZone },
      end: { dateTime: eventEnd.toISOString(), timeZone: timeZone },
    });
  }

  return randomEvents;
}

export async function GET(request: Request) {
  try {
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
    if (
      calendar?.provider.toLowerCase() === CalendarTypes.GOOGLE.toLowerCase()
    ) {
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
      events = await getMicrosoftEvents({ accessToken, refreshToken });
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get user's timezone
    const now = new Date();
    const twoWeeksLater = new Date(now);
    twoWeeksLater.setDate(now.getDate() + 14);

    const freeSlots = findFreeSlots(events);

    const minDuration = 60;
    const maxDuration = 360;

    const computedEvents = createRandomEvents({
      freeSlots,
      minDuration,
      maxDuration,
      percentage: 20,
      timeZone,
    });

    return new NextResponse(
      JSON.stringify({
        message: "Events computed successfully!",
        data: {
          events,
          computedEvents
        },
      }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new NextResponse("Error in populating event " + err, {
      status: 500,
    });
  }
}
