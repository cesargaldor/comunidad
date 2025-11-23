"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BOOKING_PRICES } from "@/constants/bookings";
import { toast } from "sonner";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useQueryClient } from "@tanstack/react-query";

interface RefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
}

export default function RefundModal({
  open,
  onOpenChange,
  bookingId,
}: RefundModalProps) {
  const [refundAmount, setRefundAmount] = useState<string>(
    BOOKING_PRICES.DEPOSIT.toString()
  );
  const queryClient = useQueryClient();
  const { execute, isLoading } = useApiRequest();

  const maxRefund = BOOKING_PRICES.DEPOSIT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(refundAmount);

    if (isNaN(amount) || amount < 0 || amount > maxRefund) {
      toast.error(`El reembolso debe estar entre €0 y €${maxRefund}`);
      return;
    }

    await execute({
      url: "/api/bookings/refund",
      method: "POST",
      body: {
        bookingId,
        refundAmount: amount,
      },
      successMessage: "Reembolso procesado correctamente",
      errorMessage: "Error al procesar el reembolso",
      onSuccess: () => {
        onOpenChange(false);
        queryClient.invalidateQueries({ queryKey: ["bookings"] });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Procesar reembolso</DialogTitle>
          <DialogDescription>
            Introduce el importe a reembolsar después de inspeccionar la sala.
            El importe máximo es €{maxRefund} (fianza).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="refundAmount">
                Importe a reembolsar (máximo: €{maxRefund})
              </Label>
              <Input
                id="refundAmount"
                type="number"
                min="0"
                max={maxRefund}
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={`€${maxRefund}`}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Procesando..." : "Procesar reembolso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
