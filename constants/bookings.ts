export const BOOKING_PRICES = {
  ROOM: 30,
  DEPOSIT: 90,
  TOTAL: 120,
};

export const BOOKING_STATUS = {
  PENDING: "PENDING", // Reserva creada, pago pendiente.
  PAID: "PAID", // Pago confirmado (uso + fianza).
  // -- Fases Post-Uso (Gestión de Fianza) --
  REFUNDED: "REFUNDED", // Reembolso de la fianza (90€) completado en Stripe.
  DEPOSIT_LOST: "DEPOSIT_LOST", // Fianza no devuelta por decisión del administrador (ej. daños).
  CANCELLED: "CANCELLED",
};

export const BOOKING_STATUS_LABEL = {
  PENDING: "Pendiente de pago",
  PAID: "Pagado",
  REFUNDED: "Reembolsado",
  DEPOSIT_LOST: "Fianza perdida",
  CANCELLED: "Cancelado",
};

export const BOOKING_STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  REFUNDED: "bg-gray-100 text-gray-800",
  DEPOSIT_LOST: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export const CANCELLATION_FULL_REFUND_DAYS = 5;

export const calculateRefundAmount = (daysUntilBooking: number) => {
  if (daysUntilBooking > CANCELLATION_FULL_REFUND_DAYS) {
    return BOOKING_PRICES.TOTAL;
  }
  return BOOKING_PRICES.DEPOSIT;
};
