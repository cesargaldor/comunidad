"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useQueryClient } from "@tanstack/react-query";

const pollSchema = z.object({
  question: z.string().min(1, "La pregunta es obligatoria"),
  options: z
    .array(
      z.object({
        value: z.string().min(1, "La opción no puede estar vacía"),
      })
    )
    .min(2, "Se requieren al menos 2 opciones"),
});

type PollFormValues = z.infer<typeof pollSchema>;

export function CreatePollDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { execute: executeCreatePoll } = useApiRequest();
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PollFormValues>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      question: "",
      options: [{ value: "" }, { value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const onSubmit = async (data: PollFormValues) => {
    try {
      await executeCreatePoll({
        url: `/api/polls`,
        method: "POST",
        body: {
          question: data.question,
          options: data.options.map((o) => o.value),
        },
        successMessage: "¡Votación creada!",
        errorMessage: "Ha habido un error al crear la votación.",
        onSuccess: (data: any) => {
          router.push(`/dashboard/polls/${data.id}`);
          queryClient.invalidateQueries({
            queryKey: ["polls"],
          });
        },
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Crear votación
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[550px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Crear votación</DialogTitle>
            <DialogDescription>
              Crea una nueva votación para que la comunidad participe.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label
                htmlFor="question"
                className={cn(errors.question && "text-destructive")}
              >
                Pregunta
              </Label>
              <Input
                id="question"
                {...register("question")}
                placeholder="¿Qué deberíamos hacer?"
                className={cn(
                  errors.question &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              {errors.question && (
                <p className="text-sm text-destructive">
                  {errors.question.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label className={cn(errors.options && "text-destructive")}>
                Opciones
              </Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-1">
                  <div className="flex gap-2">
                    <Input
                      {...register(`options.${index}.value`)}
                      placeholder={`Opción ${index + 1}`}
                      className={cn(
                        errors.options?.[index]?.value &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                  {errors.options?.[index]?.value && (
                    <p className="text-sm text-destructive">
                      {errors.options[index]?.value?.message}
                    </p>
                  )}
                </div>
              ))}
              {errors.options?.root && (
                <p className="text-sm text-destructive">
                  {errors.options.root.message}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1 w-full border-dashed"
                onClick={() => append({ value: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir opción
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Crear votación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
