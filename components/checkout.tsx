"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useApiRequest } from "@/hooks/useApiRequest";
import { ROUTES_PATHS } from "@/constants/routes";

export default function Checkout({
  canceled,
  bookingId,
}: {
  canceled: boolean;
  bookingId?: string;
}) {
  const router = useRouter();
  const { execute, isLoading } = useApiRequest();

  const handleRetryPayment = async () => {
    if (!bookingId) return;

    await execute({
      url: "/api/bookings/retry",
      method: "POST",
      body: { bookingId },
      errorMessage: "Error al reintentar el pago. Inténtelo más tarde",
      onSuccess: (data) => {
        if (data?.url) router.replace(data.url);
      },
    });
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
              onClick={() => router.push(ROUTES_PATHS.AGORA_CLUB)}
            >
              Volver
            </Button>
            <Button onClick={handleRetryPayment} disabled={isLoading}>
              {isLoading ? "Reintentando..." : "Reintentar pago"}
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
            onClick={() => router.push(ROUTES_PATHS.AGORA_CLUB)}
          >
            Volver
          </Button>
        </div>
      )}
    </div>
  );
}
