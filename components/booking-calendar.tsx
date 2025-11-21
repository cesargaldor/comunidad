"use client";
import { useState } from "react";
import { es } from "react-day-picker/locale";
import { addMonths } from "date-fns/addMonths";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { Calendar } from "./ui/calendar";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { format } from "date-fns";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { useSession } from "@/lib/auth-client";
import { ClubTermsDialog } from "./club-terms-dialog";
import { useRouter } from "next/navigation";
import { BOOKING_PRICES } from "@/constants/bookings";
import { useApiRequest } from "@/hooks/useApiRequest";

export default function BookingCalendar({
  disabledDates,
}: {
  disabledDates: Date[];
}) {
  const [date, setDate] = useState<Date>(new Date());
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const { data: session } = useSession();
  const router = useRouter();
  const { execute: executeBooking, isLoading } = useApiRequest();

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "El nombre debe tener al menos 2 caracteres.",
    }),
    phone: z.string().regex(/^(?:\+34|0034)?\s?(?:6|7|8|9)\d{8}$/, {
      message: "Teléfono no válido.",
    }),
    terms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos y condiciones.",
    }),
  });

  const form = useForm({
    defaultValues: {
      name: session?.user?.name ?? "",
      phone: "",
      terms: false,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await executeBooking({
        url: "/api/bookings/create",
        method: "POST",
        body: {
          date,
          name: value.name,
          phone: value.phone,
        },
        successMessage: "¡Reserva creada! Redirigiendo al pago...",
        errorMessage: "Error al crear la reserva.",
        onSuccess: (data) => {
          if (data.url) router.replace(data.url);
        },
      });
    },
  });

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            locale={es}
            required
            disabled={[
              ...disabledDates,
              {
                before: new Date(),
                after: addMonths(new Date(), 2),
              },
            ]}
            className="rounded-lg border [--cell-size:--spacing(13)]"
          />
        </div>

        <div className="w-full">
          <h3 className="text-base xl:text-lg mb-8 font-medium">
            Fecha: {format(date, "PPPP", { locale: es })}.
          </h3>
          <form
            id="form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="name">Nombre</FieldLabel>
                      <Input
                        id="name"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="billing family-name"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="phone"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="phone">Teléfono*</FieldLabel>
                      <Input
                        id="phone"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="tel"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="terms"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} orientation="horizontal">
                      <Checkbox
                        id="terms"
                        name={field.name}
                        checked={field.state.value}
                        onBlur={field.handleBlur}
                        onCheckedChange={(checked) =>
                          field.handleChange(checked === true)
                        }
                        aria-invalid={isInvalid}
                      />
                      <FieldLabel>
                        Acepto los{" "}
                        <span
                          className="underline cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowTerms(true);
                          }}
                        >
                          términos y condiciones*
                        </span>
                      </FieldLabel>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />

              <Field orientation="horizontal">
                <Button type="submit" form="form">
                  {isLoading
                    ? "Reservando..."
                    : `Reservar (${BOOKING_PRICES.TOTAL}€)`}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </div>

      <ClubTermsDialog
        isOpen={showTerms}
        onClose={(read: boolean) => {
          if (read) {
            form.setFieldValue("terms", true);
          }
          setShowTerms(false);
        }}
      />
    </>
  );
}
