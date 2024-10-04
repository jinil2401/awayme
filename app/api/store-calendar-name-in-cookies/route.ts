import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const { name } = await request.json();

    cookies().set({
      name: "calendarName",
      value: name,
      httpOnly: true,
      path: "/",
    });

    return new NextResponse(
      JSON.stringify({ message: "calendar name stored successfully!", data: {name} }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new NextResponse("Error in storing calendar name " + err, { status: 500 });
  }
};
