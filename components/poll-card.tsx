"use client";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Poll } from "@/src/generated/prisma/client";
import Link from "next/link";

interface PollCardProps {
  poll: Omit<Poll, "updatedAt"> & { totalVotes: number };
}

export function PollCard({ poll }: PollCardProps) {
  const isFinished = poll.status === "FINISHED";

  return (
    <Link href={`/dashboard/polls/${poll.id}`} className="block group/card">
      <Card
        className={cn(
          "w-full transition-all hover:border-primary/50",
          isFinished && "opacity-80 bg-muted/30"
        )}
      >
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-lg font-medium leading-tight group-hover/card:text-primary transition-colors">
              {poll.question}
            </CardTitle>
            {isFinished && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground whitespace-nowrap">
                Finalizada
              </span>
            )}
          </div>
          <CardDescription>
            {poll.totalVotes} voto{poll.totalVotes !== 1 && "s"} •{" "}
            {new Date(poll.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
