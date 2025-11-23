"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  calculateRefundAmount,
  CANCELLATION_FULL_REFUND_DAYS,
} from "@/constants/bookings";
import { differenceInDays, startOfDay } from "date-fns";

interface CancelBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDate: Date;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function CancelBookingModal({
  open,
  onOpenChange,
  bookingDate,
  onConfirm,
  isLoading,
}: CancelBookingModalProps) {
  const daysUntilBooking = differenceInDays(
    startOfDay(new Date(bookingDate)),
    startOfDay(new Date())
  );

  const refundAmount = calculateRefundAmount(daysUntilBooking);
  const isFullRefund = daysUntilBooking > CANCELLATION_FULL_REFUND_DAYS;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar reserva?</AlertDialogTitle>

          <p className="font-semibold text-foreground">
            Esta acción no se puede deshacer.
          </p>

          <div className="bg-muted p-3 rounded-md">
            {isFullRefund ? (
              <div className="text-sm space-y-1">
                <p>
                  ✓ Cancelación con más de {CANCELLATION_FULL_REFUND_DAYS}
                  días de antelación
                </p>
                <p>
                  Se reembolsará el importe completo:
                  <span className="font-semibold text-red-600 ml-1">
                    {refundAmount}€
                  </span>
                </p>
              </div>
            ) : (
              <div className="text-sm space-y-1">
                <p>
                  ⚠ Cancelación con {CANCELLATION_FULL_REFUND_DAYS} días o menos
                  de antelación
                </p>
                <p>
                  Se reembolsará solo la fianza:
                  <span className="font-semibold text-red-600 ml-1">
                    {refundAmount}€
                  </span>
                </p>
              </div>
            )}
          </div>

          <p className="text-sm">
            El reembolso se procesará automáticamente al método de pago
            original.
          </p>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            No, mantener reserva
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Cancelando..." : "Sí, cancelar reserva"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
