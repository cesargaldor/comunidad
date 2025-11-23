import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/errors";
import { differenceInDays, startOfDay } from "date-fns";
import { BOOKING_STATUS, calculateRefundAmount } from "@/constants/bookings";
import Stripe from "stripe";
import { BookingStatus } from "@/src/generated/prisma/enums";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { message: "Id de reserva requerido" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { message: "No tienes permiso para cancelar esta reserva" },
        { status: 403 }
      );
    }

    if (booking.status !== "PAID") {
      return NextResponse.json(
        { message: "Solo se pueden cancelar reservas pagadas" },
        { status: 400 }
      );
    }

    const daysUntilBooking = differenceInDays(
      startOfDay(new Date(booking.date)),
      startOfDay(new Date())
    );

    if (daysUntilBooking < 0) {
      return NextResponse.json(
        { message: "No se pueden cancelar reservas pasadas" },
        { status: 400 }
      );
    }

    const refundAmountEuros = calculateRefundAmount(daysUntilBooking);
    const refundAmountCents = refundAmountEuros * 100;

    let stripeRefundId: string | null = null;

    if (booking.stripePaymentIntentId) {
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
        amount: refundAmountCents,
      });
      stripeRefundId = refund.id;
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BOOKING_STATUS.CANCELLED as BookingStatus,
        canceledById: session.user.id,
        stripeRefundId,
        refundedAt: new Date(),
        refundAmountCents,
      },
    });

    return NextResponse.json({
      message: "Reserva cancelada correctamente",
      refundAmount: refundAmountEuros,
    });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ message }, { status });
  }
}
