import { toast } from "sonner";

export default function useHandleError() {
  const handleError = (res: Response) => {
    if (!res.ok) {
      res.json().then((data) => {
        toast.error(
          data.message ??
            "Ha ocurrido un error inesperado. Inténtalo de nuevo más tarde."
        );
      });
    } else {
      return res.json().then((data) => data);
    }
  };

  return { handleError };
}
