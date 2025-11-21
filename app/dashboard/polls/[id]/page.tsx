import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { PollDetail } from "@/components/poll-detail";
import { ROLES } from "@/constants/roles";
import { getPoll } from "@/actions/polls";

export default async function PollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const poll = await getPoll(id, session?.user?.id!);

  if (!poll) {
    redirect("/dashboard/polls");
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

  const isAdmin = session?.user?.role === ROLES.ADMIN;

  return (
    <div className="py-8">
      <PollDetail initialPoll={formattedPoll} isAdmin={isAdmin} />
    </div>
  );
}
