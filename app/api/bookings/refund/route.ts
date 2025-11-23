import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { handlePrismaError } from "@/lib/errors";
import { BOOKING_PRICES, BOOKING_STATUS } from "@/constants/bookings";
import Stripe from "stripe";
import { BookingStatus } from "@/src/generated/prisma/enums";
import { ROLES } from "@/constants/roles";

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

    if (session.user.role !== ROLES.ADMIN) {
      return NextResponse.json(
        { message: "No tienes permiso para realizar esta acción" },
        { status: 403 }
      );
    }

    const { bookingId, refundAmount } = await req.json();

    if (!bookingId || refundAmount === undefined) {
      return NextResponse.json(
        { message: "Id de reserva e importe de reembolso requeridos" },
        { status: 400 }
      );
    }

    const maxRefund = BOOKING_PRICES.DEPOSIT;
    if (refundAmount < 0 || refundAmount > maxRefund) {
      return NextResponse.json(
        { message: `El reembolso debe estar entre €0 y €${maxRefund}` },
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

    if (booking.status !== BookingStatus.PAID) {
      return NextResponse.json(
        { message: "Solo se pueden reembolsar reservas pagadas" },
        { status: 400 }
      );
    }

    const refundAmountCents = Math.round(refundAmount * 100);

    let stripeRefundId: string | null = null;

    if (booking.stripePaymentIntentId && refundAmountCents > 0) {
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
        amount: refundAmountCents,
      });
      stripeRefundId = refund.id;
    }

    const newStatus =
      refundAmount > 0 ? BOOKING_STATUS.REFUNDED : BOOKING_STATUS.DEPOSIT_LOST;

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus as BookingStatus,
        stripeRefundId,
        refundedAt: new Date(),
        refundAmountCents,
        refundedById: session.user.id,
      },
    });

    return NextResponse.json({
      message: "Reembolso procesado correctamente",
      refundAmount,
      status: newStatus,
    });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ message }, { status });
  }
}
