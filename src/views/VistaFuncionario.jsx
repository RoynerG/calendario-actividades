import { useEffect, useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import Swal from "sweetalert2";
import {
  listarCategorias,
  obtenerFuncionario,
  filtrarEventos,
  crearEvento,
} from "../services/eventService";
import { useParams } from "react-router-dom";
import schedulerConfig from "../services/schedulerConfig";
import { es } from "date-fns/locale";

export default function VistaFuncionario() {
  const { id_funcionario } = useParams();
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [funcionario, setFuncionario] = useState({});
  const [filtros, setFiltros] = useState({
    id_categoria: "",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    id_categoria: "",
    id_empleado: id_funcionario,
    id_ticket: "",
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    listarCategorias().then((res) => {
      if (res.success) setCategorias(res.data);
    });
    obtenerFuncionario(id_funcionario).then((res) => {
      if (res.success) setFuncionario(res.data);
      sessionStorage.setItem("id_funcionario", id_funcionario);
    });
  }, [id_funcionario]);

  useEffect(() => {
    if (!id_funcionario) return;

    async function fetchEventos() {
      setLoading(true);
      try {
        const filtrosCompletos = { ...filtros, id_empleado: id_funcionario };
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
  }, [filtros, id_funcionario]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    document.activeElement?.blur();

    try {
      // Ocultamos el formulario temporalmente para mostrar SweetAlert
      setShowForm(false);

      Swal.fire({
        title: "Guardando...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          container: "z-[100000]", // Aseguramos que esté por encima de todo
        },
      });

      const res = await crearEvento(formData);
      if (res.data.success) {
        await Swal.fire({
          title: "¡Éxito!",
          text: "El evento fue agregado correctamente",
          icon: "success",
          customClass: {
            container: "z-[100000]",
          },
        });
        setFormData({
          titulo: "",
          descripcion: "",
          fecha_inicio: "",
          fecha_fin: "",
          id_categoria: "",
          id_empleado: id_funcionario,
          id_ticket: "",
        });
        setFiltros({ ...filtros });
      } else {
        await Swal.fire({
          title: "Error",
          text: "No se pudo agregar el evento",
          icon: "error",
          customClass: {
            container: "z-[100000]",
          },
        });
        setShowForm(true); // Volvemos a mostrar el formulario si hay error
      }
    } catch (error) {
      console.error(error);
      await Swal.fire({
        title: "Error",
        text: "Ocurrió un error al agregar el evento",
        icon: "error",
        customClass: {
          container: "z-[100000]",
        },
      });
      setShowForm(true);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">
        Calendario de {funcionario.nombre || "Funcionario"}
      </h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-500 hover:bg-blue-600 text-gray p-2 rounded shadow"
      >
        {showForm ? "Cerrar formulario" : "+ Crear Evento"}
      </button>

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
        <button
          onClick={() =>
            setFiltros((f) => ({
              ...f,
              id_categoria: "",
              fecha_inicio: "",
              fecha_fin: "",
            }))
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
      )}

      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
            onClick={() => setShowForm(false)}
          />

          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-[10000]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Crear nuevo evento
              </h2>
              <input
                type="text"
                placeholder="Título"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                className="border p-2 rounded w-full"
                required
              />
              <textarea
                placeholder="Descripcion"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className="border p-2 rounded w-full"
                required
              ></textarea>
              <input
                type="datetime-local"
                value={formData.fecha_inicio}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_inicio: e.target.value })
                }
                className="border p-2 rounded w-full"
                required
              />
              <input
                type="datetime-local"
                value={formData.fecha_fin}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_fin: e.target.value })
                }
                className="border p-2 rounded w-full"
                required
              />
              <input
                type="text"
                placeholder="ID Ticket"
                value={formData.id_ticket}
                onChange={(e) =>
                  setFormData({ ...formData, id_ticket: e.target.value })
                }
                className="border p-2 rounded w-full"
                required
              />
              <select
                value={formData.id_categoria}
                onChange={(e) =>
                  setFormData({ ...formData, id_categoria: e.target.value })
                }
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-gray px-4 py-2 rounded"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
