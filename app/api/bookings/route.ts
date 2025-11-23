import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getNextsBookings,
  getUserBookings,
  getAllBookingsWithUsers,
} from "@/actions/bookings";
import { handlePrismaError } from "@/lib/errors";
import { ROLES } from "@/constants/roles";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const bookings = await getNextsBookings();

    // If admin, return all bookings with user info
    if (session.user.role === ROLES.ADMIN) {
      const allBookings = await getAllBookingsWithUsers();
      return NextResponse.json({ bookings, userBookings: allBookings });
    }

    // For regular users, return only their bookings
    const userBookings = await getUserBookings(session.user.id);

    return NextResponse.json({ bookings, userBookings });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ message }, { status });
  }
}
