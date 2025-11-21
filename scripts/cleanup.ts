import { PrismaClient } from "@prisma/client/scripts/default-index.js";
import { subHours } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const cutoff = subHours(new Date(), 1);

  const deleted = await prisma.booking.deleteMany({
    where: {
      status: "PENDING",
      createdAt: {
        lt: cutoff,
      },
    },
  });

  console.log(
    `🧹 Eliminadas ${
      deleted.count
    } reservas pendientes sin pagar creadas antes de ${cutoff.toISOString()}`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
