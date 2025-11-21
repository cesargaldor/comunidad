"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PollDetail } from "@/components/poll-detail";
import { ROLES } from "@/constants/roles";
import { useSessionContext } from "@/components/session-provider";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import Link from "next/link";
import { MoveLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PollPage() {
  const session = useSessionContext();
  const isAdmin = session?.user?.role === ROLES.ADMIN;
  const params = useParams();
  const router = useRouter();

  const {
    data: poll,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["poll", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/polls/${params.id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Votación no encontrada");
        return null;
      }
      return res.json();
    },
    enabled: !!params.id && !!session?.user?.id,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      return router.replace("/dashboard/polls");
    }
  }, [isError]);

  return (
    <div>
      {isLoading && <div className="py-8">Cargando...</div>}

      {poll && (
        <div className="space-y-8">
          <Link href="/dashboard/polls">
            <Button variant="ghost">
              <MoveLeftIcon /> Volver
            </Button>
          </Link>
          <PollDetail initialPoll={poll} isAdmin={isAdmin} />
        </div>
      )}
    </div>
  );
}
