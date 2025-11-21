import prisma from "@/lib/prisma";
import { addMonths } from "date-fns";
import { getUser } from "./user";

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

export const getUserBookings = async () => {
  const user = await getUser();
  const bookings = await prisma.booking.findMany({
    where: {
      userId: user?.id!,
    },
    orderBy: {
      date: "asc",
    },
  });

  return bookings;
};
