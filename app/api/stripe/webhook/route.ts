import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { BOOKING_STATUS } from "@/constants/bookings";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export const POST = async (req: NextRequest) => {
  const signature = req.headers.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const bookingId = session.metadata?.booking_id;
    const paymentIntentId = session.payment_intent as string;

    if (bookingId) {
      try {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: BOOKING_STATUS.PAID as any,
            stripePaymentIntentId: paymentIntentId,
          },
        });
        console.log(`✅ Booking ${bookingId} marcado como PAID`);
      } catch (err) {
        console.error("Error actualizando la reserva:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
};
