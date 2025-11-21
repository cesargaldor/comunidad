import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getNextsBookings, getUserBookings } from "@/actions/bookings";
import { handlePrismaError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    ("use cache");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const bookings = await getNextsBookings();
    const userBookings = await getUserBookings(session.user.id);

    return NextResponse.json({ bookings, userBookings });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ message }, { status });
  }
}
