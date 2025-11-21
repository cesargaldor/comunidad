"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Lock, Unlock, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApiRequest } from "@/hooks/useApiRequest";
import { Poll, PollOption } from "@/src/generated/prisma/client";

interface PollDetailProps {
  initialPoll: Poll & {
    options: (PollOption & { votes: number })[];
    userVotedOptionId?: string | null;
    totalVotes: number;
  };
  isAdmin: boolean;
}

export function PollDetail({ initialPoll, isAdmin }: PollDetailProps) {
  const { execute: executeVote, isLoading: isVoting } = useApiRequest();
  const { execute: executeStatusChange, isLoading: isUpdatingStatus } =
    useApiRequest();
  const queryClient = useQueryClient();

  const { data: poll } = useQuery({
    queryKey: ["poll", initialPoll.id],
    queryFn: async () => {
      const res = await fetch(`/api/polls/${initialPoll.id}`);
      if (!res.ok) throw new Error("Error al obtener la votación");
      return res.json() as Promise<PollDetailProps["initialPoll"]>;
    },
    initialData: initialPoll,
    refetchInterval: (data) =>
      data?.state.data?.status === "ACTIVE" ? 10000 : false,
    refetchOnWindowFocus: false,
    enabled: !!initialPoll,
  });

  const hasVoted = !!poll.userVotedOptionId;
  const isFinished = poll.status === "FINISHED";

  const handleVote = async (optionId: string) => {
    await executeVote({
      url: `/api/polls/${poll.id}/vote`,
      method: "POST",
      body: { optionId },
      successMessage: "¡Voto registrado!",
      errorMessage: "Ha habido un error al votar.",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["poll", poll.id] });
      },
    });
  };

  const handleStatusChange = async (newStatus: "ACTIVE" | "FINISHED") => {
    await executeStatusChange({
      url: `/api/polls/${poll.id}/status`,
      method: "PATCH",
      body: { status: newStatus },
      successMessage: `Votación marcada como ${
        newStatus.toLowerCase() === "active" ? "activa" : "finalizada"
      }`,
      errorMessage: "Ha habido un error al actualizar el estado.",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["poll", poll.id] });
      },
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card
        className={cn(
          "w-full transition-all",
          isFinished && "opacity-80 bg-muted/30"
        )}
      >
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-xl 2xl:text-3xl font-bold leading-tight">
              {poll.question}
            </CardTitle>
            {isFinished && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground whitespace-nowrap">
                Finalizada
              </span>
            )}
          </div>
          <CardDescription>
            {poll.totalVotes} voto{poll.totalVotes !== 1 && "s"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {poll.options?.map((option) => {
            const percentage =
              poll.totalVotes > 0
                ? Math.round((option.votes / poll.totalVotes) * 100)
                : 0;
            const isSelected = poll.userVotedOptionId === option.id;

            return (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span
                    className={cn("font-medium", isSelected && "text-primary")}
                  >
                    {option.text} {isSelected && "(Tu voto)"}
                  </span>
                  <span className="text-muted-foreground">
                    {percentage}% ({option.votes})
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 ease-out",
                      isSelected ? "bg-primary" : "bg-primary/60"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
        {isAdmin && (
          <CardFooter className="justify-end pt-0">
            {poll.status === "ACTIVE" ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => handleStatusChange("FINISHED")}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                Cerrar votación
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Unlock className="h-4 w-4 mr-2" />
                )}
                Reabrir votación
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {!hasVoted && !isFinished && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {poll.options?.map((option) => (
            <Button
              key={option.id}
              variant="outline"
              className="h-32 text-xl font-medium whitespace-normal hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => handleVote(option.id)}
              disabled={isVoting}
            >
              {option.text}
            </Button>
          ))}
        </div>
      )}

      {hasVoted && (
        <div className="text-center p-8 border rounded-lg bg-muted/10">
          <Check className="h-12 w-12 mx-auto text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">¡Ya has votado!</h3>
          <p className="text-muted-foreground">
            Gracias por participar. Puedes ver los resultados en tiempo real
            arriba.
          </p>
        </div>
      )}
    </div>
  );
}
