import { NextResponse } from "next/server";
import connect from "@/lib/db";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import Calendar from "@/lib/models/calendar";

// get all calendars for a user id
export const GET = async (request: Request) => {
  try {
    // extract the user id from the search params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // check if the userId exist and is valid
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid or missing userId!" }),
        { status: 400 }
      );
    }

    // establish the database connection
    await connect();

    // check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "user does not exist!" }),
        { status: 400 }
      );
    }

    // fetch all the calendars where userId is equal to params user id
    const calendars = await Calendar.find({
      user: new Types.ObjectId(userId),
    });

    return new NextResponse(
      JSON.stringify({ message: "Calendars fetched successfully!", data: calendars }),
      { status: 200 }
    );
  } catch (err) {
    return new NextResponse("Error in fetching calendars " + err, { status: 500 });
  }
};

export const DELETE = async (request: Request) => {
    try {
      // extract the fields from the request object
      const { calendarId, userId } = await request.json();
  
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
  
      const deleteCalendar = await Calendar.findByIdAndDelete({
        _id: calendar._id,
      });
  
      // check if the process successed
      if (!deleteCalendar) {
        return new NextResponse(
          JSON.stringify({ message: "Calendar not deleted!" }),
          { status: 400 }
        );
      }
  
      return new NextResponse(
        JSON.stringify({
          message: `${calendar.name} has been deleted successfully!`,
        }),
        {
          status: 200,
        }
      );
    } catch (err) {
      return new NextResponse("Error in deleting calendar " + err, {
        status: 500,
      });
    }
  };