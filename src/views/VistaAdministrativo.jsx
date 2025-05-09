import { useEffect, useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import { filtrarEventos, listarFuncionarios } from "../services/eventService";
import { useParams } from "react-router-dom";
import schedulerConfig from "../services/schedulerConfig";
import { es } from "date-fns/locale";
export default function VistaAdministrativo() {
  const { categorias } = useParams();
  const [eventos, setEventos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [filtros, setFiltros] = useState({
    id_empleado: "",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarFuncionarios().then((res) => {
      if (res.success) setFuncionarios(res.data);
    });
  }, []);

  useEffect(() => {
    if (!categorias) return;

    async function fetchEventos() {
      setLoading(true);
      try {
        const categoriasArray = categorias.split(",").map(Number);
        const filtrosCompletos = { ...filtros, categorias: categoriasArray };
        const res = await filtrarEventos(filtrosCompletos);
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
  }, [filtros, categorias]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold ">Calendario Administrativo</h1>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
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
          value={filtros.id_empleado}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, id_empleado: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">Todos los funcionarios</option>
          {funcionarios.map((emple) => (
            <option key={emple.id_empleado} value={emple.id_empleado}>
              {emple.nombre}
            </option>
          ))}
        </select>
        <button
          onClick={() =>
            setFiltros((f) => ({
              ...f,
              id_empleado: "",
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
        <div className="w-full overflow-auto">
          <Scheduler
            view="week"
            events={eventos}
            week={schedulerConfig.week}
            day={schedulerConfig.day}
            translations={{
              navigation: schedulerConfig.navigation,
              event: schedulerConfig.event,
              moreEvents: schedulerConfig.moreEvents,
              noDataToDisplay: schedulerConfig.noDataToDisplay,
              loading: schedulerConfig.loading,
            }}
            locale={es}
            viewerExtraComponent={(fields, event) => (
              <div>
                <ul>
                  <li>
                    <strong>Categoría:</strong> {event?.categoria}
                  </li>
                  {event?.id_ticket > 0 ? (
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
                  ) : null}
                </ul>
              </div>
            )}
            editable={false}
            deletable={false}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}
