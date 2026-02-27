import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";

export default function GuiaRecordatorios({ buttonStyle }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <a href="#" style={buttonStyle} onClick={() => setOpen(true)}>
        Guía de recordatorios
      </a>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Guía de recordatorios</DialogTitle>
        <DialogContent dividers>
          <Typography component="div" gutterBottom>
            <div className="space-y-3 text-sm text-gray-800">
              <p>
                Hay dos tipos de recordatorios: los del evento y los libres. Los
                del evento se envían antes de la fecha y hora del evento según
                la anticipación. Los libres se envían exactamente en la fecha y
                hora que indiques.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold mb-1">Anticipación (evento)</p>
                  <p>
                    Define cuántos minutos u horas antes se enviará el mensaje.
                    Ejemplo: si el evento es a las 5:00 pm y eliges 30 minutos,
                    el recordatorio se envía a las 4:30 pm.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold mb-1">Canal</p>
                  <p>
                    Puedes enviar por WhatsApp, por correo o por ambos canales.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold mb-1">Recordatorio libre</p>
                  <p>
                    Se envía exactamente en la fecha y hora que eliges. No
                    depende de ningún evento.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold mb-1">Ventana de envío</p>
                  <p>
                    El sistema revisa cada pocos minutos y busca recordatorios
                    dentro de una ventana. Eso evita que se pierdan si el cron
                    no cae justo en el minuto.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 sm:col-span-2">
                  <p className="font-semibold mb-1">Límites para evitar spam</p>
                  <p>
                    Cada funcionario tiene límites diarios y por ventana de
                    tiempo para que no lleguen demasiados mensajes seguidos.
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                <p className="font-semibold mb-1">Recomendaciones</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Verifica que el funcionario tenga celular y correo
                    actualizados.
                  </li>
                  <li>
                    Usa anticipaciones cortas para eventos urgentes y largas
                    para eventos importantes.
                  </li>
                  <li>
                    Si eliges ambos canales, recibirá WhatsApp y correo.
                  </li>
                  <li>
                    Para recordatorios libres, revisa la fecha y hora antes de
                    guardar.
                  </li>
                </ul>
              </div>
            </div>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
