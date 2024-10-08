import { NextResponse } from "next/server";
import connect from "@/lib/db";
import Plan from "@/lib/models/plan";

export const GET = async () => {
  try {
    // establish a connection with database
    await connect();

    // extract all the available plans
    const plans = await Plan.find();

    // send them to the frontend
    return new NextResponse(
      JSON.stringify({ message: "plans fetched successfully!", data: plans }),
      { status: 200 }
    );
  } catch (err) {
    return new NextResponse("Error in fetching plans " + err, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const { planId, name, features, price } = await request.json();
    // establish the connection with database
    await connect();

    // create the new plan object
    const newPlan = new Plan({ planId, name, features, price });
    // save the info in the dabatabse
    await newPlan.save();

    // send the confirmation to frontend
    return new NextResponse(
      JSON.stringify({ message: "Plan created successfully!", data: newPlan }),
      {
        status: 201,
      }
    );
  } catch (err) {
    return new NextResponse("Error in creating plan " + err, { status: 500 });
  }
};
