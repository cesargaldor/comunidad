import { getPoll } from "@/actions/polls";
import { auth } from "@/lib/auth";
import { handlePrismaError } from "@/lib/errors";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET({ params }: { params: Promise<{ pollId: string }> }) {
  try {
    const { pollId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const poll = await getPoll(pollId, session?.user?.id!);

    if (!poll) {
      return NextResponse.json(
        { message: "Votación no encontrada" },
        { status: 404 }
      );
    }

    const totalVotes = poll.options.reduce(
      (acc, option) => acc + option._count.votes,
      0
    );
    const userVotedOptionId = poll.votes[0]?.optionId || null;

    const formattedPoll = {
      ...poll,
      options: poll.options.map((o) => ({
        ...o,
        votes: o._count.votes,
      })),
      userVotedOptionId,
      totalVotes,
    };

    return NextResponse.json(formattedPoll);
  } catch (error) {
    const { message, status } = handlePrismaError(error);
    return NextResponse.json({ message }, { status });
  }
}
