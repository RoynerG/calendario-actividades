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
  const [filtros, setFiltros] = useState({
    id_categoria: "",
    id_empleado: "",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarCategorias().then((res) => {
      if (res.success) setCategorias(res.data);
    });
    listarFuncionarios().then((res) => {
      if (res.success) setFuncionarios(res.data);
    });
  }, []);

  useEffect(() => {
    async function fetchEventos() {
      setLoading(true);
      try {
        const res = await filtrarEventos(filtros);
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
      } catch (err) {
        console.error("Error al cargar eventos:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEventos();
  }, [filtros]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Calendario</h1>
      <div className="flex gap-4">
        <input
          type="date"
          value={filtros.fecha_inicio}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, fecha_inicio: e.target.value }))
          }
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={filtros.fecha_fin}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, fecha_fin: e.target.value }))
          }
          className="border p-2 rounded"
        />
        <select
          value={filtros.id_categoria}
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
          value={filtros.id_empleado}
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
        <button
          onClick={() =>
            setFiltros((f) => ({
              ...f,
              id_empleado: "",
              id_categoria: "",
              fecha_inicio: "",
              fecha_fin: "",
            }))
          }
          className="border p-2 rounded"
        >
          Eliminar filtros
        </button>
      </div>
      {loading ? (
        <div className="text-center text-xl py-10 text-gray-500">
          Cargando calendario...
        </div>
      ) : (
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
      )}
    </div>
  );
}
