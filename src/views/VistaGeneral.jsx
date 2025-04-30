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
            subtitle: ev.nombre,
            start: new Date(ev.fecha_inicio),
            end: new Date(ev.fecha_fin),
            color: ev.color,
            nombre: ev.nombre,
            categoria: ev.categoria,
            id_ticket: ev.id_ticket,
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
      <h1 className="text-xl font-bold mb-4">Calendario</h1>
      <Scheduler
        view="week"
        events={eventos}
        viewerExtraComponent={(fields, event) => (
          <div>
            <ul>
              <li>
                <strong>Categoría:</strong> {event?.categoria}
              </li>
              <li>
                <strong>Ticket: </strong>
                <a
                  href={`https://sucasainmobiliaria.com.co/ticket/?id_ticket=${event?.id_ticket}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver ticket
                </a>
              </li>
            </ul>
          </div>
        )}
        editable={false}
        deletable={false}
        draggable={false}
      />
    </div>
  );
}
