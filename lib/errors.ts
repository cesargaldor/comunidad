import { Prisma } from "../src/generated/prisma/client";

export function handlePrismaError(err: any) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return {
          status: 409,
          message: "Ya existe un reserva para ese día.",
          meta: err.meta,
        };

      case "P2003":
        return {
          status: 400,
          message: "No se puede crear o relacionar este registro.",
          meta: err.meta,
        };

      case "P2025":
        return {
          status: 404,
          message: "Recurso no encontrado.",
          meta: err.meta,
        };

      default:
        return {
          status: 500,
          message: "Error desconocido de la base de datos. Inténtelo más tarde",
          meta: err.meta,
        };
    }
  }

  return {
    status: 500,
    message: "Ha habido un error en el servidor. Inténtelo más tarde.",
  };
}
