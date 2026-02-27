import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";

export default function GuiaEventosRecurrentes({ buttonStyle }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <a href="#" style={buttonStyle} onClick={() => setOpen(true)}>
        Guía de eventos recurrentes
      </a>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Guía para crear eventos recurrentes</DialogTitle>
        <DialogContent dividers>
          <Typography component="div" gutterBottom>
            <div className="space-y-3 text-sm text-gray-800">
              <p>
                Usa esta opción cuando necesitas crear varias fechas similares
                en un solo paso.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold mb-1">Diario</p>
                  <p>
                    Crea un evento todos los días desde la fecha inicial hasta
                    la fecha fin.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="font-semibold mb-1">Semanal</p>
                  <p>
                    Escoge días específicos de la semana y se repetirán hasta
                    la fecha fin.
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 p-3 sm:col-span-2">
                  <p className="font-semibold mb-1">Personalizado</p>
                  <p>
                    Selecciona fechas puntuales no consecutivas y crea eventos
                    solo en esas fechas.
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                <p className="font-semibold mb-1">Recomendaciones</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Verifica categoría y horario antes de guardar para evitar
                    bloqueos.
                  </li>
                  <li>
                    Usa “Personalizado” si necesitas fechas no regulares.
                  </li>
                  <li>
                    Revisa eventos pendientes antes de crear nuevos eventos.
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
