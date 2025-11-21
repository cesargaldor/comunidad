import { getNextsBookings, getUserBookings } from "@/actions/bookings";
import ReservationCalendar from "@/components/booking-calendar";
import BookingList from "@/components/booking-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isAfter, isBefore, isSameDay, startOfDay } from "date-fns";

export default async function AgoraClub() {
  let bookings = [];
  let userBookings = [];

  try {
    bookings = await getNextsBookings();
    userBookings = await getUserBookings();
  } catch (err: any) {
    return (
      <div>
        <h1 className="text-xl 2xl:text-3xl mb-8">Reservar Ágora Club</h1>
        <p className="text-red-500">
          No se pudieron cargar las reservas. Intenta más tarde.
        </p>
      </div>
    );
  }

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
