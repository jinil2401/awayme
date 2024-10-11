import { CalendarTypes } from "@/constants/calendarTypes";
import Calendar from "@/lib/models/calendar";
import User from "@/lib/models/user";
import { decrypt, encrypt } from "@/utils/crypto";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { getMicrosoftEvents, msalConfig } from "@/lib/microsoftClient";
import { getGoogleEvents } from "@/lib/googleClient";

const cca = new ConfidentialClientApplication(msalConfig);

function findFreeSlots(events: any, endDate: Date) {
  const busyTimes = events.map((event: any) => ({
    start: new Date(event.start.dateTime),
    end: new Date(event.end.dateTime),
  }));

  const freeSlots = [];
  const now = new Date();

  for (let d = new Date(now); d <= endDate; d.setDate(d.getDate() + 1)) {
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
  minDuration: number;
  maxDuration: number;
  percentage: number;
  timeZone: string;
}) {
  const randomEvents: any = [];

  // Calculate the number of events based on the percentage of free slots
  const totalFreeSlots = freeSlots.length;
  const numberOfEvents = Math.floor(totalFreeSlots * (percentage / 100));

  if (numberOfEvents <= 0) {
    return randomEvents;
  }

  const shuffledSlots = freeSlots
    .sort(() => 0.3 - Math.random())
    .slice(0, numberOfEvents);

  for (const slot of shuffledSlots) {
    const maxPossibleDuration = Math.min(
      maxDuration,
      (slot.end - slot.start) / (60 * 1000)
    );
    const randomDuration =
      Math.floor(Math.random() * (maxPossibleDuration - minDuration + 1)) +
      minDuration;

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
    const maxTime = searchParams.get("maxTime") as string;
    const percentage = parseFloat(searchParams.get("percentage") || "25");
    const startDate = new Date(
      searchParams.get("startDate") || new Date().toISOString()
    );
    const endDate = new Date(
      searchParams.get("endDate") ||
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    );

    if (!maxTime) {
      return new NextResponse(JSON.stringify({ message: "Missing maxTime!" }), {
        status: 400,
      });
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
        JSON.stringify({ message: "Invalid or missing userId!" }),
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

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // fetch all the available free slots
    const freeSlots = findFreeSlots(events, endDate);

    // Filter freeSlots based on the provided startDate and endDate
    const filteredSlots = freeSlots.filter(
      (slot) => slot.start >= startDate && slot.end <= endDate
    );

    // set min and max duration of the event
    const minDuration = 60;
    const maxDuration = 480;

    // compute the random events based on the free slots and desired percentage of events
    const computedEvents = createRandomEvents({
      freeSlots: filteredSlots,
      minDuration,
      maxDuration,
      percentage,
      timeZone,
    });

    return new NextResponse(
      JSON.stringify({
        message: "Events computed successfully!",
        data: {
          events,
          computedEvents,
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
