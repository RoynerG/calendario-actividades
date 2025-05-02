import { useEffect, useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import {
  listarCategorias,
  listarFuncionarios,
  filtrarEventos,
} from "../services/eventService";

export default function VistaGeneral() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [filtros, setFiltros] = useState({ id_categoria: "", id_empleado: "" });

  useEffect(() => {
    listarCategorias().then((res) => {
      if (res.success) setCategorias(res.data);
    });
    listarFuncionarios().then((res) => {
      if (res.success) setFuncionarios(res.data);
    });
  }, []);

  useEffect(() => {
    filtrarEventos(filtros)
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
  }, [filtros]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Calendario</h1>
      <div className="flex gap-4">
        <select
          onChange={(e) =>
            setFiltros((f) => ({ ...f, id_categoria: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>

        <select
          onChange={(e) =>
            setFiltros((f) => ({ ...f, id_empleado: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">Todos los funcionarios</option>
          {funcionarios.map((f) => (
            <option key={f.id_empleado} value={f.id_empleado}>
              {f.nombre}
            </option>
          ))}
        </select>
      </div>
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
