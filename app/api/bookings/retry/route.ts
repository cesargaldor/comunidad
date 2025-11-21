import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { BOOKING_PRICES } from "@/constants/bookings";
import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/errors";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const TOTAL_AMOUNT_CENTS = BOOKING_PRICES.TOTAL * 100;

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const { bookingId, name, phone } = await req.json();

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Reserva Vía Ágora Club",
              description: `${BOOKING_PRICES.ROOM}€ por uso del local + ${BOOKING_PRICES.DEPOSIT}€ de fianza (fianza reembolsable tras revisión de las instalaciones)`,
            },
            unit_amount: TOTAL_AMOUNT_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: bookingId,
        form_name: name,
        form_phone: phone,
      },
      customer_email: session?.user.email!,
      success_url: `${process.env.BASE_URL}/dashboard/agora-club/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/dashboard/agora-club/checkout?canceled=true&booking_id=${bookingId}`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err: any) {
    const { message, status } = handlePrismaError(err);
    return NextResponse.json({ message }, { status });
  }
}
