"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Booking } from "@/src/generated/prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_COLOR,
  BOOKING_STATUS_LABEL,
} from "@/constants/bookings";
import { cn, formatDate } from "@/lib/utils";
import { differenceInDays, startOfDay } from "date-fns";
import { useApiRequest } from "@/hooks/useApiRequest";
import RefundModal from "./refund-modal";
import CancelBookingModal from "./cancel-booking-modal";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";

interface BookingWithUser extends Booking {
  user?: {
    name: string | null;
    email: string | null;
  };
  canceledBy?: {
    name: string | null;
    email: string | null;
  } | null;
  refundedBy?: {
    name: string | null;
    email: string | null;
  } | null;
}

interface BookingsTableProps {
  bookings: BookingWithUser[];
  isAdmin: boolean;
}

export default function BookingsTable({
  bookings,
  isAdmin,
}: BookingsTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [selectedBookingDate, setSelectedBookingDate] = useState<Date | null>(
    null
  );
  const { execute, isLoading } = useApiRequest();
  const queryClient = useQueryClient();

  const handleRetryPayment = async (
    id: string,
    name: string,
    phone: string
  ) => {
    setLoadingId(id);
    await execute({
      url: "/api/bookings/retry",
      method: "POST",
      body: {
        bookingId: id,
        name,
        phone,
      },
      errorMessage: "Error al reintentar el pago. Inténtelo más tarde.",
      onSuccess: (data) => {
        if (data?.url) router.replace(data.url);
      },
    });
    setLoadingId(null);
  };

  const handleOpenCancelModal = (bookingId: string, bookingDate: Date) => {
    setSelectedBookingId(bookingId);
    setSelectedBookingDate(bookingDate);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedBookingId) return;
    await execute({
      url: "/api/bookings/cancel",
      method: "POST",
      body: { bookingId: selectedBookingId },
      successMessage: "Reserva cancelada correctamente",
      errorMessage: "Error al cancelar la reserva",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["bookings"] });
        setCancelModalOpen(false);
      },
    });
  };

  const handleOpenRefundModal = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setRefundModalOpen(true);
  };

  return (
    <>
      {!bookings?.length ? (
        <p className="mt-4">No hay reservas</p>
      ) : (
        <div className="rounded-md border bg-white mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                {isAdmin && <TableHead>Usuario</TableHead>}
                <TableHead>Cancelado/Reembolsado por</TableHead>
                <TableHead>Cantidad reembolsada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => {
                const canCancel =
                  booking.status === BOOKING_STATUS.PAID &&
                  differenceInDays(
                    startOfDay(new Date(booking.date)),
                    startOfDay(new Date())
                  ) >= 0;

                const canRefund =
                  isAdmin && booking.status === BOOKING_STATUS.PAID;

                const canRetry = booking.status === BOOKING_STATUS.PENDING;

                const hasActions = canCancel || canRefund || canRetry;

                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {formatDate(booking.date, "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "p-1 rounded text-xs",
                          BOOKING_STATUS_COLOR[booking.status]
                        )}
                      >
                        {BOOKING_STATUS_LABEL[booking.status]}
                      </span>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>{`${booking.user?.name} (${booking.user?.email})`}</TableCell>
                    )}
                    <TableCell>
                      {booking.status === BOOKING_STATUS.CANCELLED &&
                      booking.canceledBy
                        ? booking.canceledBy.name
                        : (booking.status === BOOKING_STATUS.REFUNDED ||
                            booking.status === BOOKING_STATUS.DEPOSIT_LOST) &&
                          booking.refundedBy
                        ? booking.refundedBy.name
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {booking.status === BOOKING_STATUS.REFUNDED ||
                      booking.status === BOOKING_STATUS.DEPOSIT_LOST ||
                      booking.status === BOOKING_STATUS.CANCELLED
                        ? `${(booking.refundAmountCents ?? 0) / 100}€`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {hasActions ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={loadingId === booking.id}
                            >
                              {loadingId === booking.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canRetry && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRetryPayment(
                                    booking.id,
                                    booking.formName,
                                    booking.formPhone
                                  )
                                }
                                disabled={loadingId === booking.id}
                              >
                                {loadingId === booking.id
                                  ? "Reintentando..."
                                  : "Reintentar pago"}
                              </DropdownMenuItem>
                            )}
                            {canCancel && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleOpenCancelModal(
                                    booking.id,
                                    booking.date
                                  )
                                }
                                className="text-red-600"
                              >
                                Cancelar reserva
                              </DropdownMenuItem>
                            )}
                            {canRefund && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleOpenRefundModal(booking.id)
                                }
                              >
                                Reembolsar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedBookingId && (
        <RefundModal
          open={refundModalOpen}
          onOpenChange={setRefundModalOpen}
          bookingId={selectedBookingId}
        />
      )}

      {selectedBookingDate && (
        <CancelBookingModal
          open={cancelModalOpen}
          onOpenChange={setCancelModalOpen}
          bookingDate={selectedBookingDate}
          onConfirm={handleCancelConfirm}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
