import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { ROLES } from "@/constants/roles";
import { getPolls } from "@/actions/polls";
import { handlePrismaError } from "@/lib/errors";

const createPollSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z
    .array(z.string().min(1, "Option text is required"))
    .min(2, "At least 2 options are required"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const polls = await getPolls(session?.user?.id!);
    return NextResponse.json(polls);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== ROLES.ADMIN) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const validation = createPollSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { question, options } = validation.data;

    const poll = await prisma.poll.create({
      data: {
        question,
        options: {
          create: options.map((text) => ({ text })),
        },
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json(poll);
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
