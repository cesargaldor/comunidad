import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { handlePrismaError } from "@/lib/errors";

const voteSchema = z.object({
  optionId: z.string().min(1, "La opción a votar es obligatoria"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    ("use cache");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "No puedes realizar" },
        { status: 401 }
      );
    }

    const { pollId } = await params;
    const body = await req.json();
    const validation = voteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
    }

    const { optionId } = validation.data;

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return NextResponse.json(
        { message: "No se encontró la votación" },
        { status: 404 }
      );
    }

    if (poll.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "La votación no está activa" },
        { status: 400 }
      );
    }

    const option = await prisma.pollOption.findUnique({
      where: { id: optionId },
    });

    if (!option || option.pollId !== pollId) {
      return NextResponse.json({ message: "Opción inválida" }, { status: 400 });
    }

    await prisma.vote.create({
      data: {
        pollId,
        optionId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "¡Voto guardado!" });
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ message }, { status });
  }
}
