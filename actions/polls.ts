import prisma from "@/lib/prisma";

export async function getPolls(userId: string) {
  return await prisma.poll.findMany({
    include: {
      options: {
        include: {
          _count: {
            select: { votes: true },
          },
        },
      },
      votes: {
        where: { userId },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPoll(id: string, userId: string) {
  return await prisma.poll.findUnique({
    where: { id },
    include: {
      options: {
        include: {
          _count: {
            select: { votes: true },
          },
        },
      },
      votes: {
        where: { userId },
      },
    },
  });
}
