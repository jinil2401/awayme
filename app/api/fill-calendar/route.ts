import { CalendarTypes } from "@/constants/calendarTypes";
import connect from "@/lib/db";
import googleClient from "@/lib/googleClient";
import Calendar from "@/lib/models/calendar";
import User from "@/lib/models/user";
import { decrypt } from "@/utils/crypto";
import moment from "moment";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

interface IStoreEventTypes {
  accessToken: string;
  refreshToken: string;
  events: any;
}

const storeGoogleEvents = async ({
  events,
  accessToken,
  refreshToken,
}: IStoreEventTypes) => {
  const calendar = googleClient({
    accessToken,
    refreshToken,
  });

  try {
    for (const event of events) {
      await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });
    }
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export async function POST(request: Request) {
  const { events, userId, calendarId } = await request.json();

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
  } else if (calendar?.provider.toLowerCase() === CalendarTypes.OUTLOOK.toLowerCase()) {
    // fetch the encrpted access token and refresh token
    const { access_token, refresh_token } = calendar;

    // decrypt the access token and refresh token
    const accessToken = decrypt(access_token);
    const refreshToken = decrypt(refresh_token);
    
    console.log("add events for outlook");
    // pass it to the function
    // result = await storeGoogleEvents({ accessToken, refreshToken, events });
  }

  // 

  if (result) {
    try {
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

      return new NextResponse(
        JSON.stringify({
          message: "Events stored successfully!",
          data: {
            events,
          },
        }),
        {
          status: 201,
        }
      );
    } catch (err) {
      return new NextResponse("Error in storing event " + err, { status: 500 });
    }
  } else {
    return new NextResponse("Error in storing event ", { status: 500 });
  }
}