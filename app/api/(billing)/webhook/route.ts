import connect from "@/lib/db";
import User from "@/lib/models/user";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const POST = async (req: NextRequest) => {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return new NextResponse("Webhook Error: ", { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const planId = session.metadata?.planType;
      console.log("userId: ", userId);
      console.log("planId: ", planId);

      if (userId && planId) {
        try {
          await connect();
          await User.findOneAndUpdate(
            { _id: userId },
            {
              plan: new Types.ObjectId(planId),
            }
          );
        } catch (dbErr) {
          return new NextResponse("User update failed", { status: 500 });
        }
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
      return new NextResponse("Received", { status: 200 });
  }
};
