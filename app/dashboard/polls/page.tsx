import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PollCard } from "@/components/poll-card";
import { CreatePollDialog } from "@/components/create-poll-dialog";
import { getPolls } from "@/actions/polls";
import { ROLES } from "@/constants/roles";

export default async function PollsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAdmin = session?.user?.role === ROLES.ADMIN;
  const pollsData = await getPolls(session?.user?.id!);

  const polls = pollsData?.map((poll) => {
    const totalVotes = poll.options.reduce(
      (acc, option) => acc + option._count.votes,
      0
    );

    return {
      ...poll,
      totalVotes,
    };
  });

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <h1 className="text-xl 2xl:text-3xl">Votaciones</h1>
        {isAdmin && <CreatePollDialog />}
      </div>

      <div className="grid gap-6 mt-10">
        {polls.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">
              No hay votaciones activas por el momento.
            </p>
          </div>
        ) : (
          polls.map((poll) => <PollCard key={poll.id} poll={poll} />)
        )}
      </div>
    </div>
  );
}
