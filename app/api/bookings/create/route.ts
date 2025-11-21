import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { BOOKING_PRICES, BOOKING_STATUS } from "@/constants/bookings";
import { handlePrismaError } from "@/lib/errors";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const TOTAL_AMOUNT_CENTS = BOOKING_PRICES.TOTAL * 100;

export async function POST(req: NextRequest) {
  try {
    ("use cache");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { date, name, phone } = await req.json();

    const booking = await prisma.booking.create({
      data: {
        userId: session?.user.id!,
        date: new Date(date),
        status: BOOKING_STATUS.PENDING as any,
        formName: name,
        formPhone: phone,
        totalAmountCents: TOTAL_AMOUNT_CENTS,
        usageFeeCents: BOOKING_PRICES.ROOM * 100,
        depositCents: BOOKING_PRICES.DEPOSIT * 100,
      },
    });

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
        booking_id: booking.id,
        form_name: name,
        form_phone: phone,
      },
      customer_email: session?.user.email!,
      success_url: `${process.env.BASE_URL}/dashboard/agora-club/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/dashboard/agora-club/checkout?canceled=true&booking_id=${booking.id}`,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err: any) {
    const { message, status } = handlePrismaError(err);
    return NextResponse.json({ message }, { status });
  }
}
