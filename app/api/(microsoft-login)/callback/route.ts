import { CalendarTypes } from "@/constants/calendarTypes";
import connect from "@/lib/db";
import { msalConfig } from "@/lib/microsoftConfig";
import Calendar from "@/lib/models/calendar";
import User from "@/lib/models/user";
import { encrypt } from "@/utils/crypto";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { Types } from "mongoose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const cca = new ConfidentialClientApplication(msalConfig);

export async function GET(req: NextRequest) {
  const code: string = req.nextUrl.searchParams.get("code") as string;

  if (!code) {
    return new NextResponse(
      JSON.stringify({
        message: "Authorization code is missing!",
      }),
      { status: 400 }
    );
  }
  try {
    const cookieStore = cookies();
    // fetch the user details from the cookie store
    const userData = JSON.parse(cookieStore.get("userData")?.value || "{}");
    // fetch the calendar name for the cookie store
    const calendarName = cookieStore.get("calendarName")?.value;

    // establish the connection with database
    await connect();

    // check if the store exists in the database
    const selectedUser = await User.findById(userData._id);
    if (!selectedUser) {
      return new NextResponse(
        JSON.stringify({ message: "User does not exist!" }),
        { status: 400 }
      );
    }

    // get the user details from the code
    const result = await cca.acquireTokenByCode({
      code,
      scopes: ["User.Read", "Calendars.Read"],
      redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback`,
    });
    
    // extract the name, email, access token and expiry from result
    const { account, accessToken, expiresOn } = result;

    // check if the calendar exists in the database
    const selectedCalendar = await Calendar.findOne({
      email: account?.username,
      user: new Types.ObjectId(selectedUser._id),
    });

    // if the calendar exists in the database
    if (selectedCalendar) {
      // delete the calendar name from the cookies
      cookieStore.delete("calendarName");
      // throw an error stating that the calendar is already in the database
      return new NextResponse(
        JSON.stringify({ message: "user calendar is already imported!" }),
        { status: 400 }
      );
    }

    // excrypt the access token and refresh token
    const access_token = encrypt(accessToken);

    // fetch refresh token

    const refreshToken = () => {
      const tokenCache = cca.getTokenCache().serialize();
      const refreshTokenObject = JSON.parse(tokenCache).RefreshToken;
      const refreshToken =
        refreshTokenObject[Object.keys(refreshTokenObject)[0]].secret;
      return refreshToken;
    };

    const refresh_token = encrypt(refreshToken());

    // add a new calendar in the database
    // create the new calendar object
    // assign user id to the calendar
    const newCalendar = new Calendar({
      name: calendarName,
      email: account?.username,
      access_token,
      refresh_token,
      provider: CalendarTypes.OUTLOOK,
      expires_at: expiresOn,
      user: new Types.ObjectId(selectedUser._id),
    });

    // save the info in the dabatabse
    await newCalendar.save();

    // delete the calendar name from the cookies
    cookieStore.delete("calendarName");

    // redirect to the calendar dashboard with user id
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/application/${userData?._id}/calendars`
    );
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        message: error.message,
      }),
      { status: 500 }
    );
  }
}
