import prisma from "@/lib/prisma";
import { addMonths } from "date-fns";

export const getNextsBookings = async () => {
  const bookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: new Date(),
        lte: addMonths(new Date(), 2),
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return bookings;
};

export const getUserBookings = async (userId: string) => {
  const bookings = await prisma.booking.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: "asc",
    },
  });

  return bookings;
};
