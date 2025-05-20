import { useEffect, useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import {
  obtenerCategoria,
  filtrarEventos,
  listarFuncionarios,
} from "../services/eventService";
import { useParams } from "react-router-dom";
import schedulerConfig from "../services/schedulerConfig";
import { es } from "date-fns/locale";
import { FaPowerOff, FaMapLocationDot } from "react-icons/fa6";
import { IoTimeSharp } from "react-icons/io5";
import { showHistorialModal } from "../helpers/eventModals";
export default function VistaCategoria() {
  const { id_categoria } = useParams();
  const [eventos, setEventos] = useState([]);
  const [categoria, setCategoria] = useState({});
  const [funcionarios, setFuncionarios] = useState([]);
  const [filtros, setFiltros] = useState({
    id_empleado: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "",
    fue_trasladado: "",
  });
  const [loading, setLoading] = useState(true);
  const buttonStyle = {
    backgroundColor: "black",
    color: "white",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    paddingTop: "0.5rem",
    paddingBottom: "0.5rem",
    borderRadius: "0.25rem",
    width: "auto",
    whiteSpace: "nowrap",
  };

  useEffect(() => {
    listarFuncionarios().then((res) => {
      if (res.success) setFuncionarios(res.data);
    });
    obtenerCategoria(id_categoria).then((res) => {
      if (res.success) setCategoria(res.data);
    });
  }, [id_categoria]);

  useEffect(() => {
    if (!id_categoria) return;

    async function fetchEventos() {
      setLoading(true);
      try {
        const filtrosCompletos = { ...filtros, id_categoria: id_categoria };
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
            estado: ev.estado,
            ubicacion: ev.ubicacion,
            fue_trasladado: ev.fue_trasladado,
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
  }, [filtros, id_categoria]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row justify-center gap-2 mb-6">
        <a
          href={`httphttps://sucasainmobiliaria.com.co/mi-cuenta/menu-calendario/`}
          style={buttonStyle}
          className="flex-1 sm:flex-none text-center"
        >
          Regresar a mi cuenta
        </a>
      </div>
      <h1 className="text-sm md:text-5xl font-bold">
        Calendario de {categoria.nombre}
      </h1>
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
        <select
          value={filtros.estado}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, estado: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">¿Fue realizado?</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
        </select>
        <select
          value={filtros.fue_trasladado}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, fue_trasladado: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">¿Fue trasladado?</option>
          <option value="Si">Si</option>
          <option value="No">No</option>
        </select>
        <button
          onClick={() =>
            setFiltros({
              id_categoria: "",
              fecha_inicio: "",
              fecha_fin: "",
              estado: "",
              fue_trasladado: "",
            })
          }
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded"
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
                  <li className="flex items-center">
                    {event?.estado === "Si" ? (
                      <FaPowerOff className="mr-2 text-green-500 transform rotate-180" />
                    ) : (
                      <FaPowerOff className="mr-2 text-red-500" />
                    )}

                    <span
                      className={`block text-xs font-semibold px-3 py-1 rounded-full ${
                        event?.estado === "Si"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {event?.estado === "Si" ? "Realizado" : "Sin realizar"}
                    </span>
                  </li>
                  {event?.fue_trasladado === "Si" ? (
                    <li className="flex items-center mt-2">
                      <IoTimeSharp className="mr-2 text-red-500 transform rotate-180" />
                      <span
                        className={`block text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-red-700`}
                      >
                        Fue trasladado
                      </span>
                    </li>
                  ) : null}
                  {event?.ubicacion && (
                    <li>
                      <FaMapLocationDot className="inline" /> {event?.ubicacion}
                    </li>
                  )}

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
                  <li>
                    <a
                      href={`/evento/${event?.event_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver evento
                    </a>
                  </li>
                </ul>
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    className="px-2 py-1 bg-gray-500 text-white rounded"
                    onClick={() => showHistorialModal(event.event_id)}
                  >
                    Ver cambios
                  </button>
                </div>
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
