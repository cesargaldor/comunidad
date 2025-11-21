import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ClubTermsDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose?: (read: boolean) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Términos de uso del Vía Ágora Club</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <p>
            1. El espacio está disponible para residentes. Solo podrán hacerse
            reservas a nombre de los propietarios y el uso de la sala no podrá
            cederse a NO propietarios.
          </p>
          <p>
            2. Los organizadores de actividades serán responsables del
            comportamiento de los asistentes.
          </p>
          <p>
            3. Queda prohibido fumar, consumir bebidas alcohólicas o realizar
            actividades que perturben la tranquilidad del entorno.
          </p>
          <p>
            4. Queda prohibido cocinar al no existir salida de humos ni estar la
            cocina equipada para este fin.
          </p>
          <p>
            5. No se permite dejar materiales, equipos o residuos en el espacio
            al finalizar cada actividad.
          </p>
          <p>6. Prohibido entrar mojados a la sala.</p>
          <p>7. Aforo máximo 30 personas. </p>
        </div>
        <DialogFooter>
          <Button onClick={() => onClose?.(true)}>Lo he leído</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
