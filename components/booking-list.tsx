"use client";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_COLOR,
  BOOKING_STATUS_LABEL,
} from "@/constants/bookings";
import { cn, formatDate } from "@/lib/utils";
import { Booking } from "@/src/generated/prisma/client";
import { Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useHandleError from "@/hooks/useHandleError";

export default function BookingList({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { handleError } = useHandleError();

  const handleRetryPayment = async (
    id: string,
    name: string,
    phone: string
  ) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/bookings/retry", {
        method: "POST",
        body: JSON.stringify({
          bookingId: id,
          name,
          phone,
        }),
      });
      const data = await handleError(res);
      if (data.url) router.replace(data.url);
    } catch (error) {
      toast.error("Error al reintentar el pago. Inténtelo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!bookings?.length && <p className="mt-4">No hay reservas</p>}

      {bookings?.map((booking) => {
        return (
          <div
            className="py-6 px-6 bg-white rounded-lg flex flex-col xl:flex-row xl:items-center justify-between shadow"
            key={booking.id}
          >
            <div>
              <p className="inline-flex items-center gap-2">
                <Calendar className="size-4" />
                {formatDate(booking.date)}
              </p>
              <p
                className={cn(
                  "p-1 bg-red-100 w-fit rounded text-xs mt-2",
                  BOOKING_STATUS_COLOR[booking.status]
                )}
              >
                {BOOKING_STATUS_LABEL[booking.status]}
              </p>
            </div>

            <div className="flex items-center gap-4 mt-4 xl:mt-0">
              <p className="text-sm">
                Reservada el: {formatDate(booking.createdAt, "PPP")}
              </p>
              {booking.status === BOOKING_STATUS.PENDING && (
                <Button
                  onClick={() =>
                    handleRetryPayment(
                      booking.id,
                      booking.formName,
                      booking.formPhone
                    )
                  }
                >
                  {isLoading ? "Reintentando..." : "Reintentar pago"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
