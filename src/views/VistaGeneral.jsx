import { useEffect, useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import { listarEventos } from "../services/eventService";

export default function VistaGeneral() {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    listarEventos()
      .then((res) => {
        if (res.data.success) {
          const formateados = res.data.data.map((ev) => ({
            event_id: ev.id,
            title: ev.titulo,
            start: new Date(ev.fecha_inicio),
            end: new Date(ev.fecha_fin),
            description: ev.descripcion,
            color: ev.color,
            nombre: ev.nombre,
          }));
          setEventos(formateados);
        }
      })
      .catch((err) => {
        console.error("Error al cargar eventos:", err);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Calendario General de Eventos</h1>
      <Scheduler
        view="week"
        events={eventos}
        editable={false}
        deletable={false}
        draggable={false}
      />
    </div>
  );
}
