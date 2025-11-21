"use client";
import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from "@/components/session-provider";
import ReservationCalendar from "@/components/booking-calendar";
import BookingList from "@/components/booking-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isAfter, isBefore, isSameDay, startOfDay } from "date-fns";
import { Booking } from "@/src/generated/prisma/client";

export default function AgoraClub() {
  const session = useSessionContext();

  const { data, isLoading, isError } = useQuery<{
    bookings: Booking[];
    userBookings: Booking[];
  }>({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Error al obtener las reservas");
      return res.json();
    },
    enabled: !!session?.user?.id,
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-xl 2xl:text-3xl mb-8">Reservar Ágora Club</h1>
        <p className="text-muted-foreground">Cargando reservas...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-xl 2xl:text-3xl mb-8">Reservar Ágora Club</h1>
        <p className="text-red-500">
          No se pudieron cargar las reservas. Intenta más tarde.
        </p>
      </div>
    );
  }

  const { bookings = [], userBookings = [] } = data ?? {};

  return (
    <div>
      <h1 className="text-xl 2xl:text-3xl mb-8">Reservar Ágora Club</h1>
      <ReservationCalendar
        disabledDates={bookings.map((booking) => new Date(booking.date))}
      />

      {userBookings?.length > 0 && (
        <div>
          <h2 className="text-lg 2xl:text-2xl mt-12 mb-6 underline">
            Mis Reservas
          </h2>
          <Tabs defaultValue="current">
            <TabsList>
              <TabsTrigger value="old">Pasadas</TabsTrigger>
              <TabsTrigger value="current">Actuales</TabsTrigger>
            </TabsList>
            <TabsContent value="old">
              <BookingList
                bookings={userBookings?.filter((booking) =>
                  isBefore(
                    startOfDay(new Date(booking.date)),
                    startOfDay(new Date())
                  )
                )}
              />
            </TabsContent>
            <TabsContent value="current">
              <BookingList
                bookings={userBookings?.filter(
                  (booking) =>
                    isSameDay(
                      startOfDay(new Date(booking.date)),
                      startOfDay(new Date())
                    ) ||
                    isAfter(
                      startOfDay(new Date(booking.date)),
                      startOfDay(new Date())
                    )
                )}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
