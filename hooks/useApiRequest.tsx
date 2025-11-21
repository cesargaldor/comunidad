"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ApiRequestOptions = {
  url: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: any;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
};

export function useApiRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const execute = async ({
    url,
    method = "POST",
    body,
    successMessage,
    errorMessage,
    onSuccess,
  }: ApiRequestOptions) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? errorMessage ?? "Ha habido un error");
        return;
      }

      if (successMessage) {
        toast.success(successMessage);
      }

      router.refresh();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(
        errorMessage ??
          "Ha habido un error en el servidor. Inténtelo más tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
