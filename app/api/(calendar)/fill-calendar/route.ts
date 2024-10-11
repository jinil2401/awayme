import { CalendarTypes } from "@/constants/calendarTypes";
import connect from "@/lib/db";
import Calendar from "@/lib/models/calendar";
import User from "@/lib/models/user";
import { decrypt, encrypt } from "@/utils/crypto";
import moment from "moment";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { msalConfig, storeOutlookEvents } from "@/lib/microsoftClient";
import { storeGoogleEvents } from "@/lib/googleClient";

const cca = new ConfidentialClientApplication(msalConfig);

export async function POST(request: Request) {
  const { events, userId, calendarId, isPaidUser } = await request.json();

  // check if the userId exist and is valid
  if (!userId || !Types.ObjectId.isValid(userId)) {
    return new NextResponse(
      JSON.stringify({ message: "Invalid or missing userId!" }),
      { status: 400 }
    );
  }

  // establish the connection with database
  await connect();

  // check if the user exists in the database
  const user = await User.findById(userId);
  if (!user) {
    return new NextResponse(
      JSON.stringify({ message: "User does not exist!" }),
      { status: 400 }
    );
  }

  // check if the calendarId is valid
  if (!calendarId || !Types.ObjectId.isValid(calendarId)) {
    return new NextResponse(
      JSON.stringify({ message: "Invalid or missing calendarId!" }),
      { status: 400 }
    );
  }

  // check if the calendar exists in the database
  const calendar = await Calendar.findById(calendarId);
  if (!calendar) {
    return new NextResponse(
      JSON.stringify({ message: "Calendar does not exist!" }),
      { status: 400 }
    );
  }

  // check if the calendar belongs to this user or not
  if (String(calendar.user) !== String(userId)) {
    return new NextResponse(
      JSON.stringify({ message: "Calendar does not belong to this user!" }),
      { status: 400 }
    );
  }

  // check if the current date is greater than the nextCalendarUpdateDate date
  // extract the two weeks later date
  const today = new Date();
  const nextCalendarUpdateDate = new Date(user?.nextCalendarUpdateDate);

  if (today.getTime() < nextCalendarUpdateDate.getTime()) {
    return new NextResponse(
      JSON.stringify({
        message: `You have already filled the calendar. your next calendar update date is ${moment(
          nextCalendarUpdateDate
        ).format("YYYY-MM-DD")}!`,
      }),
      { status: 400 }
    );
  }

  let result;

  //   store events based on the provider
  if (calendar?.provider.toLowerCase() === CalendarTypes.GOOGLE.toLowerCase()) {
    // fetch the encrpted access token and refresh token
    const { access_token, refresh_token } = calendar;

    // decrypt the access token and refresh token
    const accessToken = decrypt(access_token);
    const refreshToken = decrypt(refresh_token);

    // pass it to the function
    result = await storeGoogleEvents({ accessToken, refreshToken, events });
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
    result = await storeOutlookEvents({
      accessToken,
      refreshToken,
      events: events?.map((event: any) => {
        return {
          start: event.start,
          end: event.end,
          subject: event.summary,
        };
      }),
    });
  }

  if (result?.success) {
    if (!isPaidUser) {
      const twoWeeksLater = new Date(today);
      twoWeeksLater.setDate(today.getDate() + 14);
      // update the user account with nextUpdateDate timestamp
      // this is needed because we will not allow to update if the current date
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        {
          nextCalendarUpdateDate: twoWeeksLater,
        },
        {
          new: true,
        }
      );

      // check if the process successed
      if (!updatedUser) {
        return new NextResponse(
          JSON.stringify({ message: "User next calendar date not updated!" }),
          { status: 400 }
        );
      }
    }

    return new NextResponse(
      JSON.stringify({
        message: "Events stored successfully!",
        data: {
          events,
        },
      }),
      { status: 201 }
    );
  } else {
    return new NextResponse(
      JSON.stringify({
        message: "Error storing events.",
        errors: result?.errors?.map(({ error, event }) => ({
          message: error.message,
          event,
        })),
      }),
      { status: 500 }
    );
  }
}
