export const BOOKING_PRICES = {
  ROOM: 30,
  DEPOSIT: 90,
  TOTAL: 120,
};

export const BOOKING_STATUS = {
  PENDING: "PENDING", // Reserva creada, pago pendiente.
  PAID: "PAID", // Pago confirmado (uso + fianza).
  // -- Fases Post-Uso (Gestión de Fianza) --
  COMPLETED_PENDING: "COMPLETED_PENDING", // Sala usada, pendiente de revisión por el administrador.
  REFUND_APPROVED: "REFUND_APPROVED", // Administrador aprueba: se debe iniciar el reembolso.
  REFUNDED: "REFUNDED", // Reembolso de la fianza (90€) completado en Stripe.
  DEPOSIT_LOST: "DEPOSIT_LOST", // Fianza no devuelta por decisión del administrador (ej. daños).
  CANCELLED: "CANCELLED",
};

export const BOOKING_STATUS_LABEL = {
  PENDING: "Pendiente de pago",
  PAID: "Pagada",
  COMPLETED_PENDING: "Pendiente de revisión",
  REFUND_APPROVED: "Reembolso aprobado",
  REFUNDED: "Reembolsada",
  DEPOSIT_LOST: "Fianza perdida",
  CANCELLED: "Cancelada",
};

export const BOOKING_STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  COMPLETED_PENDING: "bg-blue-100 text-blue-800",
  REFUND_APPROVED: "bg-purple-100 text-purple-800",
  REFUNDED: "bg-gray-100 text-gray-800",
  DEPOSIT_LOST: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};
