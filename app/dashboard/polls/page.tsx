"use client";
import { PollCard } from "@/components/poll-card";
import { CreatePollDialog } from "@/components/create-poll-dialog";
import { ROLES } from "@/constants/roles";
import { useSessionContext } from "@/components/session-provider";
import { useQuery } from "@tanstack/react-query";

export default function PollsPage() {
  const session = useSessionContext();
  const isAdmin = session?.user?.role === ROLES.ADMIN;

  const { data: pollsData = [], isLoading } = useQuery({
    queryKey: ["polls", session?.user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/polls`);
      if (!res.ok) throw new Error("Error al obtener las votaciones");
      const data = await res.json();

      return data?.map((poll: any) => {
        const totalVotes = poll.options.reduce(
          (acc: number, option: any) => acc + option._count.votes,
          0
        );

        return {
          ...poll,
          totalVotes,
        };
      });
    },
    enabled: !!session?.user?.id,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl 2xl:text-3xl">Votaciones</h1>
        {isAdmin && <CreatePollDialog />}
      </div>

      <div className="grid gap-6 mt-10">
        {isLoading ? (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">Cargando votaciones...</p>
          </div>
        ) : pollsData?.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <p className="text-muted-foreground">
              No hay votaciones activas por el momento.
            </p>
          </div>
        ) : (
          pollsData?.map((poll: any) => <PollCard key={poll.id} poll={poll} />)
        )}
      </div>
    </div>
  );
}
