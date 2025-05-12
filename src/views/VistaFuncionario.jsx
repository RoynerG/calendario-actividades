import { useEffect, useState, useRef } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import Swal from "sweetalert2";
import {
  listarCategorias,
  obtenerFuncionario,
  filtrarEventos,
  crearEvento,
  obtenerTicketsFuncionario,
  cambiarEstadoEvento,
  trasladarEvento,
} from "../services/eventService";
import { useParams } from "react-router-dom";
import schedulerConfig from "../services/schedulerConfig";
import { es } from "date-fns/locale";
import Select from "react-select";
import { FaPowerOff } from "react-icons/fa";

export default function VistaFuncionario() {
  const { id_funcionario } = useParams();
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tickets, setTickets] = useState([]);
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
  const [relacionadoConTicket, setRelacionadoConTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const schedulerRef = useRef(null);
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
    listarCategorias().then((res) => {
      if (res.success) setCategorias(res.data);
    });
    obtenerFuncionario(id_funcionario).then((res) => {
      if (res.success) setFuncionario(res.data);
      sessionStorage.setItem("id_funcionario", id_funcionario);
    });
    obtenerTicketsFuncionario(id_funcionario).then((res) => {
      if (res.success) setTickets(res.data);
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
            estado: ev.estado,
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

  useEffect(() => {
    const categoriaSeleccionada = categorias.find(
      (cat) => cat.id === formData.id_categoria
    );
    if (
      categoriaSeleccionada &&
      formData.fecha_inicio &&
      formData.fecha_fin &&
      formData.id_ticket
    ) {
      const fechaInicio = new Date(formData.fecha_inicio);
      const fechaFin = new Date(formData.fecha_fin);
      const opcionesFecha = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      const opcionesHora = { hour: "2-digit", minute: "2-digit" };
      const fechaStr = fechaInicio.toLocaleDateString("es-CO", opcionesFecha);
      const horaInicioStr = fechaInicio.toLocaleTimeString(
        "es-CO",
        opcionesHora
      );
      const horaFinStr = fechaFin.toLocaleTimeString("es-CO", opcionesHora);
      const descripcionGenerada = `Por medio de la presente, le confirmo que he dispuesto de un espacio con el propósito de reunirnos, ya sea de forma presencial o por medios virtuales, a fin de atender cualquier inquietud o asunto pendiente.<br/><br/>En cumplimiento de <b>${categoriaSeleccionada.nombre}</b>, se ha programado una visita y/o reunión, la cual ha quedado agendada para el día <b>${fechaStr}</b>, de <b>${horaInicioStr}</b> a <b>${horaFinStr}</b>. En caso de no ser posible contar con su atención en la fecha indicada, le agradecemos nos lo comunique por este mismo medio con al menos 3 horas de antelación.`;
      setFormData((prev) => ({ ...prev, descripcion: descripcionGenerada }));
    }
  }, [
    formData.id_categoria,
    formData.fecha_inicio,
    formData.fecha_fin,
    formData.id_ticket,
    categorias,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    document.activeElement?.blur();
    try {
      setShowForm(false);
      Swal.fire({
        title: "Guardando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: { container: "z-[100000]" },
      });
      const res = await crearEvento(formData);
      if (res.data.success) {
        await Swal.fire({
          title: "¡Éxito!",
          text: "El evento fue agregado correctamente",
          icon: "success",
          customClass: { container: "z-[100000]" },
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
        setRelacionadoConTicket(null);
        setFiltros({ ...filtros });
      } else {
        await Swal.fire({
          title: "Error",
          text: "No se pudo agregar el evento",
          icon: "error",
          customClass: { container: "z-[100000]" },
        });
        setShowForm(true);
      }
    } catch (error) {
      console.error(error);
      await Swal.fire({
        title: "Error",
        text: "Ocurrió un error al agregar el evento",
        icon: "error",
        customClass: { container: "z-[100000]" },
      });
      setShowForm(true);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row justify-center gap-2 mb-6">
        <a
          href={`https://sucasainmobiliaria.com.co/mi-cuenta`}
          style={buttonStyle}
          className="flex-1 sm:flex-none text-center"
        >
          Regresar a mi cuenta
        </a>
      </div>
      <h1 className="text-xl font-bold">
        Calendario de {funcionario.nombre || "Funcionario"}
      </h1>
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded shadow"
      >
        {showForm ? "Cerrar formulario" : "+ Crear Evento"}
      </button>
      {/* FILTROS */}
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
            setFiltros({ id_categoria: "", fecha_inicio: "", fecha_fin: "" })
          }
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded"
        >
          Eliminar filtros
        </button>
      </div>
      {/* CALENDARIO */}
      {loading ? (
        <div className="text-center text-xl py-10 text-gray-500">
          Cargando calendario...
        </div>
      ) : (
        <div className="w-full overflow-auto">
          <Scheduler
            ref={schedulerRef}
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
                  <li>
                    <strong>Categoría:</strong> {event?.categoria}
                  </li>
                  {event?.id_ticket > 0 && (
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
                  )}
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
                {event?.estado === "No" ? (
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      className="px-2 py-1 bg-green-600 text-white rounded"
                      onClick={async () => {
                        close();
                        const { value: obs } = await Swal.fire({
                          customClass: { container: "z-[2000]" },
                          title: `Resultado del evento #${event?.event_id}:`,
                          html: `<p>${event?.title}</p>`,
                          input: "textarea",
                          inputPlaceholder: "Escribe tu observación…",
                          showCancelButton: true,
                        });
                        if (!obs) return;
                        Swal.fire({
                          title: "Actualizando estado...",
                          allowOutsideClick: false,
                          didOpen: () => {
                            Swal.showLoading();
                          },
                          customClass: { container: "z-[2000]" },
                        });
                        const resp = await cambiarEstadoEvento(
                          event?.event_id,
                          obs
                        );
                        Swal.close();
                        if (resp.success) {
                          await Swal.fire("¡Hecho!", resp.message, "success");
                          setFiltros((prev) => ({ ...prev }));
                        } else {
                          Swal.fire("Error", resp.message, "error");
                        }
                      }}
                    >
                      Marcar como realizado
                    </button>
                    <button
                      className="px-2 py-1 bg-blue-600 text-white rounded"
                      onClick={async () => {
                        const { value: form } = await Swal.fire({
                          title: `Trasladar fecha del evento #${event?.event_id}:`,
                          html: `
                          <p>${event?.title}</p>
                          <input id="f1" type="datetime-local" class="swal2-input" placeholder="Nueva fecha inicio">
                          <input id="f2" type="datetime-local" class="swal2-input" placeholder="Nueva fecha fin">
                          <textarea id="obs" class="swal2-textarea" placeholder="Motivo"></textarea>`,
                          focusConfirm: false,
                          preConfirm: () => ({
                            fecha_inicio: document.getElementById("f1").value,
                            fecha_fin: document.getElementById("f2").value,
                            observacion: document.getElementById("obs").value,
                          }),
                          showCancelButton: true,
                          customClass: { container: "z-[2000]" },
                        });
                        if (!form?.observacion) return;
                        const fechaInicio = new Date(form.fecha_inicio);
                        const fechaFin = new Date(form.fecha_fin);
                        const opcionesFecha = {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        };
                        const opcionesHora = {
                          hour: "2-digit",
                          minute: "2-digit",
                        };
                        const fechaStr = fechaInicio.toLocaleDateString(
                          "es-CO",
                          opcionesFecha
                        );
                        const horaInicioStr = fechaInicio.toLocaleTimeString(
                          "es-CO",
                          opcionesHora
                        );
                        const horaFinStr = fechaFin.toLocaleTimeString(
                          "es-CO",
                          opcionesHora
                        );
                        const nombreCategoria = event.categoria;

                        const descripcionGenerada = `
      Por medio de la presente, le confirmo que se ha <b>reprogramado</b>
      el evento correspondiente a <b>${event.title}</b> en cumplimiento de
      <b>${nombreCategoria}</b>, para el día <b>${fechaStr}</b>,
      de <b>${horaInicioStr}</b> a <b>${horaFinStr}</b>.<br/><br/>
      <b>Motivo:</b> ${form.observacion}
    `;
                        Swal.fire({
                          title: "Trasladando evento...",
                          allowOutsideClick: false,
                          didOpen: () => Swal.showLoading(),
                          customClass: { container: "z-[2000]" },
                        });
                        const resp = await trasladarEvento(
                          event.event_id,
                          form.fecha_inicio,
                          form.fecha_fin,
                          form.observacion,
                          descripcionGenerada
                        );
                        Swal.close();
                        if (resp.success) {
                          await Swal.fire("¡Hecho!", resp.message, "success");
                          setFiltros((prev) => ({ ...prev }));
                        } else {
                          Swal.fire("Error", resp.message, "error");
                        }
                      }}
                    >
                      Trasladar fecha
                    </button>
                  </div>
                ) : null}
              </div>
            )}
            editable={false}
            deletable={false}
            draggable={false}
          />
        </div>
      )}
      {/* FORMULARIO */}
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
              <Select
                options={categorias.map((cat) => ({
                  value: cat.id,
                  label: cat.nombre,
                }))}
                value={
                  formData.id_categoria
                    ? {
                        value: formData.id_categoria,
                        label: categorias.find(
                          (cat) => cat.id === formData.id_categoria
                        )?.nombre,
                      }
                    : null
                }
                onChange={(opt) =>
                  setFormData({
                    ...formData,
                    id_categoria: opt ? opt.value : "",
                  })
                }
                className="w-full"
                classNamePrefix="react-select"
                placeholder="Selecciona una categoría"
                isClearable
              />
              {tickets.length > 0 && (
                <Select
                  options={[
                    {
                      value: "si",
                      label: "Sí, está relacionado con un ticket",
                    },
                    {
                      value: "no",
                      label: "No, no está relacionado con un ticket",
                    },
                  ]}
                  value={
                    relacionadoConTicket === null
                      ? null
                      : relacionadoConTicket
                      ? {
                          value: "si",
                          label: "Sí, está relacionado con un ticket",
                        }
                      : {
                          value: "no",
                          label: "No, no está relacionado con un ticket",
                        }
                  }
                  onChange={(opt) =>
                    setRelacionadoConTicket(opt?.value === "si")
                  }
                  className="w-full"
                  classNamePrefix="react-select"
                  placeholder="¿Relacionado con ticket?"
                  isClearable
                />
              )}
              {relacionadoConTicket && (
                <Select
                  options={tickets.map((t) => ({ value: t._ID, label: t._ID }))}
                  value={
                    formData.id_ticket
                      ? { value: formData.id_ticket, label: formData.id_ticket }
                      : null
                  }
                  onChange={(opt) =>
                    setFormData({
                      ...formData,
                      id_ticket: opt ? opt.value : "",
                    })
                  }
                  className="w-full"
                  classNamePrefix="react-select"
                  placeholder="Selecciona un ticket"
                  isClearable
                />
              )}
              {(!relacionadoConTicket || tickets.length === 0) && (
                <textarea
                  placeholder="Descripción"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                  required
                />
              )}
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
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
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
