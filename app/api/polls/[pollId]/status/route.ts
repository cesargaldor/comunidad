import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { ROLES } from "@/constants/roles";
import { handlePrismaError } from "@/lib/errors";

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "FINISHED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    ("use cache");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== ROLES.ADMIN) {
      return NextResponse.json(
        { message: "No autenticado" },
        { status: !session ? 401 : 403 }
      );
    }

    const { pollId } = await params;
    const body = await req.json();
    const validation = statusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Estado inválido" }, { status: 400 });
    }

    const poll = await prisma.poll.update({
      where: { id: pollId },
      data: { status: validation.data.status },
    });

    return NextResponse.json(poll);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ message }, { status });
  }
}
