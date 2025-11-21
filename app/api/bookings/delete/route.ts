import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { handlePrismaError } from "@/lib/errors";

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const { id } = await req.json();

    await prisma.booking.delete({
      where: {
        id,
        userId: session?.user.id!,
      },
    });

    return NextResponse.json({ message: "Booking deleted" });
  } catch (err: any) {
    const { message, status } = handlePrismaError(err);
    return NextResponse.json({ message }, { status });
  }
}
