"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";
import useHandleError from "@/hooks/useHandleError";

export default function Checkout({
  canceled,
  bookingId,
}: {
  canceled: boolean;
  bookingId?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { handleError } = useHandleError();

  const handleRetryPayment = async () => {
    if (!bookingId) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/bookings/retry", {
        method: "POST",
        body: JSON.stringify({
          bookingId,
        }),
      });
      const data = await handleError(res);
      if (data.url) router.replace(data.url);
    } catch (error: any) {
      toast.error("Error al reintentar el pago. Inténtelo más tarde");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[70vh] flex justify-center items-center">
      {canceled ? (
        <div>
          <h1 className="text-2xl xl:text-3xl font-semibold text-center">
            El pago ha sido cancelado. Puede que se haya tratado de un error.
            ¿Quieres reintentarlo?
          </h1>

          <div className="flex justify-center gap-6 mt-8">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/agora-club")}
            >
              Volver
            </Button>
            <Button onClick={handleRetryPayment}>
              {isLoading ? "Reintando..." : "Reintentar pago"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h1 className="text-2xl xl:text-3xl font-semibold text-center">
            El pago ha sido completado con éxito. Recibirá un email con la
            confirmación.
          </h1>

          <Button
            className="mt-6"
            variant="outline"
            onClick={() => router.push("/dashboard/agora-club")}
          >
            Volver
          </Button>
        </div>
      )}
    </div>
  );
}
