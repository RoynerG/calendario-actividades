import { useEffect, useState, useRef } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import Swal from "sweetalert2";
import {
  listarCategorias,
  obtenerFuncionario,
  filtrarEventos,
  crearEvento,
  obtenerTicketsFuncionario,
  verificarBloqueo,
} from "../services/eventService";
import { useParams } from "react-router-dom";
import schedulerConfig from "../services/schedulerConfig";
import { es } from "date-fns/locale";
import Select from "react-select";
import GuiaCategorias from "../components/GuiaCategorias";
import EventoViewer from "../components/EventoViewer";
import { showSwal } from "../helpers/swalUtils";

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
    estado: "",
    fue_trasladado: "",
  });
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    ubicacion: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    fecha_inicio: "",
    fecha_fin: "",
    id_categoria: "",
    id_empleado: id_funcionario,
    id_ticket: "",
    estado_administrativo: "",
    estado_comercial: "",
    contrato: "",
    inmueble: "",
    es_cita: "",
  });
  const [relacionadoConTicket, setRelacionadoConTicket] = useState(null);
  const [ticketSelecionado, setTicketSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [esCita, setEsCita] = useState(null);
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
  const inputStyle =
    "border p-2 rounded w-bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

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
            descripcion: ev.descripcion,
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
  }, [filtros, id_funcionario]);

  useEffect(() => {
    if (!id_funcionario) return;

    async function revisarBloqueo() {
      try {
        const res = await verificarBloqueo(id_funcionario);
        console.log(res);
        if (res.success && res.data.bloqueado) {
          Swal.fire({
            title: "¡Atención!",
            html: `Tienes <b>${res.data.cantidad}</b> evento(s) sin realizar con más de 2 días de antigüedad. No puedes agendar nuevos eventos hasta resolverlos.`,
            icon: "warning",
            customClass: { container: "z-[100000]" },
          });
        }
      } catch (err) {
        console.error("Error verificando bloqueo:", err);
      }
    }

    revisarBloqueo();
  }, [id_funcionario]);

  useEffect(() => {
    if (
      esCita &&
      formData.id_categoria &&
      formData.fecha &&
      formData.hora_inicio &&
      formData.hora_fin
    ) {
      const categoriaSeleccionada = categorias.find(
        (cat) => cat.id === formData.id_categoria
      );
      if (categoriaSeleccionada) {
        const fechaInicio = new Date(
          `${formData.fecha}T${formData.hora_inicio}`
        );
        const fechaFin = new Date(`${formData.fecha}T${formData.hora_fin}`);
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
    }
  }, [
    esCita,
    formData.id_categoria,
    formData.fecha,
    formData.hora_inicio,
    formData.hora_fin,
    categorias,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    document.activeElement?.blur();

    // Combina fecha y horas a formato ISO local: "YYYY-MM-DDTHH:mm"
    const { fecha, hora_inicio, hora_fin } = formData;
    const fecha_inicio = fecha && hora_inicio ? `${fecha}T${hora_inicio}` : "";
    const fecha_fin = fecha && hora_fin ? `${fecha}T${hora_fin}` : "";

    // Validaciones
    const fechaInicio = new Date(fecha_inicio);
    const fechaFin = new Date(fecha_fin);
    const ahora = new Date();

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      setShowForm(false);
      await showSwal({
        title: "Error",
        text: "Debes ingresar fechas y horas válidas.",
        icon: "error",
      });
      setShowForm(true);
      return;
    }

    // Solo permite el mismo día (si así lo quieres)
    if (
      fechaInicio.getFullYear() !== fechaFin.getFullYear() ||
      fechaInicio.getMonth() !== fechaFin.getMonth() ||
      fechaInicio.getDate() !== fechaFin.getDate()
    ) {
      setShowForm(false);
      await showSwal({
        title: "Error",
        text: "La fecha de inicio y la fecha de finalización deben ser el mismo día.",
        icon: "error",
      });
      setShowForm(true);
      return;
    }

    if (fechaFin < fechaInicio) {
      setShowForm(false);
      await showSwal({
        title: "Error",
        text: "La hora de finalización no puede ser menor que la de inicio.",
        icon: "error",
      });
      setShowForm(true);
      return;
    }

    // No permite fechas pasadas
    const inicioSinHoras = new Date(
      fechaInicio.getFullYear(),
      fechaInicio.getMonth(),
      fechaInicio.getDate()
    );
    const hoySinHoras = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate()
    );
    if (inicioSinHoras < hoySinHoras) {
      setShowForm(false);
      await showSwal({
        title: "Error",
        text: "No puedes seleccionar una fecha pasada.",
        icon: "error",
      });
      setShowForm(true);
      return;
    }
    if (fechaFin < ahora) {
      setShowForm(false);
      await showSwal({
        title: "Error",
        text: "No puedes seleccionar una hora de finalización pasada.",
        icon: "error",
      });
      setShowForm(true);
      return;
    }

    // Valida horas permitidas
    const horaInicio = fechaInicio.getHours() + fechaInicio.getMinutes() / 60;
    const horaFin = fechaFin.getHours() + fechaFin.getMinutes() / 60;
    if (horaInicio < 8 || horaInicio > 21) {
      setShowForm(false);
      await showSwal({
        title: "Error",
        text: "La hora de inicio debe estar entre las 8:00 am y las 9:00 pm.",
        icon: "error",
      });
      setShowForm(true);
      return;
    }
    if (horaFin < 8 || horaFin > 21) {
      setShowForm(false);
      await showSwal({
        title: "Error",
        text: "La hora de finalización debe estar entre las 8:00 am y las 9:00 pm.",
        icon: "error",
      });
      setShowForm(true);
      return;
    }

    // Prepara datos para enviar (solo los campos que tu API necesita)
    const eventoData = {
      ...formData,
      fecha_inicio,
      fecha_fin,
    };

    // Opcional: borra los auxiliares para que no se envíen al backend si no los necesitas
    delete eventoData.fecha;
    delete eventoData.hora_inicio;
    delete eventoData.hora_fin;

    try {
      setShowForm(false);
      Swal.fire({
        title: "Guardando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: { container: "z-[100000]" },
      });
      const res = await crearEvento(eventoData);
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
          ubicacion: "",
          fecha: "",
          hora_inicio: "",
          hora_fin: "",
          fecha_inicio: "",
          fecha_fin: "",
          id_categoria: "",
          id_empleado: id_funcionario,
          id_ticket: "",
          estado_administrativo: "",
          estado_comercial: "",
          contrato: "",
          inmueble: "",
          es_cita: "",
        });
        setRelacionadoConTicket(null);
        setEsCita(null);
        setTicketSelecionado(null);
        setFiltros({ ...filtros });
      } else {
        const mensaje = res.data.message || "No se pudo agregar el evento";
        await Swal.fire({
          title: "No se puede crear el evento",
          html: mensaje,
          icon: "warning",
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
          href={`https://sucasainmobiliaria.com.co/mi-cuenta/menu-calendario`}
          style={buttonStyle}
          className="flex-1 sm:flex-none text-center"
        >
          Regresar a mi cuenta
        </a>
        <GuiaCategorias buttonStyle={buttonStyle} />
      </div>
      <h1 className="text-sm md:text-5xl font-bold">
        Calendario de {funcionario.nombre || "Funcionario"}
      </h1>
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded shadow"
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
          {loading === false && (
            <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 rounded px-4 py-2 mb-4">
              Recuerda marcar como realizados tus eventos anteriores. Los
              eventos sin realizar con más de 2 días te bloquearán para crear
              nuevos.
            </div>
          )}
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
              <EventoViewer
                event={event}
                categorias={categorias}
                setFiltros={setFiltros}
              />
            )}
            editable={false}
            deletable={false}
            draggable={false}
          />
        </div>
      )}
      {/* Crear evento */}
      {showForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
            onClick={() => setShowForm(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto z-[10000]">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Título */}
              <label
                htmlFor="titulo"
                className="block mb-3 mt-3 text-sm font-medium text-gray-900 dark:text-white"
              >
                Título
              </label>
              <input
                id="titulo"
                type="text"
                placeholder="Escribe en 3 palabras la actividad a realizar"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                className={inputStyle}
                required
              />
              {/* Ubicación */}
              <label
                htmlFor="ubicacion"
                className="block mb-3 text-sm font-medium text-gray-900 dark:text-white"
              >
                Ubicación / dirección del evento
              </label>
              <input
                id="ubicacion"
                type="text"
                placeholder="Escribe dónde será realizado el evento"
                value={formData.ubicacion}
                onChange={(e) =>
                  setFormData({ ...formData, ubicacion: e.target.value })
                }
                className={inputStyle}
                required
              />
              {/* Fecha */}
              <label
                htmlFor="fecha"
                className="block mb-3 text-sm font-medium text-gray-900 dark:text-white"
              >
                Fecha
              </label>
              <input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
                className={inputStyle}
                required
              />
              {/* Hora de inicio */}
              <label
                htmlFor="hora_inicio"
                className="block mb-3 text-sm font-medium text-gray-900 dark:text-white"
              >
                Hora de inicio
              </label>
              <input
                id="hora_inicio"
                type="time"
                value={formData.hora_inicio}
                onChange={(e) =>
                  setFormData({ ...formData, hora_inicio: e.target.value })
                }
                className={inputStyle}
                required
              />
              {/* Hora de fin */}
              <label
                htmlFor="hora_fin"
                className="block mb-3 text-sm font-medium text-gray-900 dark:text-white"
              >
                Hora de finalización
              </label>
              <input
                id="hora_fin"
                type="time"
                value={formData.hora_fin}
                onChange={(e) =>
                  setFormData({ ...formData, hora_fin: e.target.value })
                }
                className={inputStyle}
                required
              />
              {/* Categoría */}
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
              {/* ¿Relacionado con ticket? */}
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
              {/* Selección del ticket si aplica */}
              {relacionadoConTicket && (
                <Select
                  options={tickets.map((t) => ({ value: t._ID, label: t._ID }))}
                  value={
                    formData.id_ticket
                      ? { value: formData.id_ticket, label: formData.id_ticket }
                      : null
                  }
                  onChange={(opt) => {
                    const id = opt?.value || "";
                    setFormData((prev) => ({ ...prev, id_ticket: id }));

                    // Buscar el objeto completo y guardarlo
                    const ticketObj = tickets.find((t) => t._ID === id);
                    setTicketSelecionado(ticketObj || null);
                  }}
                  className="w-full"
                  classNamePrefix="react-select"
                  placeholder="Selecciona un ticket"
                  isClearable
                />
              )}
              {/* ¿Es una cita? */}
              {relacionadoConTicket && (
                <Select
                  options={[
                    { value: "si", label: "Sí, es una cita" },
                    { value: "no", label: "No, no es una cita" },
                  ]}
                  value={
                    esCita === null
                      ? null
                      : esCita
                      ? { value: "si", label: "Sí, es una cita" }
                      : { value: "no", label: "No, no es una cita" }
                  }
                  onChange={(opt) => {
                    const valor = opt?.value ?? "";
                    const es = valor === "si";
                    setEsCita(es);
                    setFormData((prev) => ({
                      ...prev,
                      es_cita: valor,
                      descripcion: es ? prev.descripcion : "",
                    }));
                  }}
                  className="w-full"
                  classNamePrefix="react-select"
                  placeholder="¿Es una cita?"
                  isClearable
                />
              )}
              {/* Estado comercial si el departamento es servicio al cliente */}
              {relacionadoConTicket &&
                ticketSelecionado &&
                ticketSelecionado.departamento === "Servicio al cliente" && (
                  <Select
                    options={[
                      {
                        value: "Contactado",
                        label: "Contactado",
                      },
                      { value: "En busqueda", label: "En busqueda" },
                      { value: "En cierre", label: "En cierre" },
                      { value: "En estudio", label: "En estudio" },
                      { value: "Prospectado", label: "Prospectado" },
                      { value: "Mostrando", label: "Mostrando" },
                      { value: "En ruta", label: "En ruta" },
                      { value: "Retocando", label: "Retocando" },
                      {
                        value: "En actividad comercial",
                        label: "En actividad comercial",
                      },
                      {
                        value: "Por publicar",
                        label: "Por publicar",
                      },
                      {
                        value: "Pendiente colocar aviso",
                        label: "Pendiente colocar aviso",
                      },
                    ]}
                    onChange={(opt) => {
                      const estadoComercial = opt?.value ?? "";
                      setFormData((prev) => {
                        const solicitante = ticketSelecionado.solicitante;
                        const baseTitle = prev.titulo.split(" - ")[0];

                        return {
                          ...prev,
                          estado_comercial: estadoComercial,
                          titulo: `${baseTitle} - ${solicitante}`,
                        };
                      });
                    }}
                    className="w-full"
                    classNamePrefix="react-select"
                    placeholder="Selecciona el estado comercial"
                    isClearable
                  />
                )}
              {/* Estado administrativo si el departamento es servicio al propietario y propietario */}
              {relacionadoConTicket &&
                ticketSelecionado &&
                ticketSelecionado.departamento !== "Servicio al cliente" && (
                  <Select
                    options={[
                      {
                        value: "Por inspecccionar",
                        label: "Por inspecccionar",
                      },
                      { value: "Inspeccionado", label: "Inspeccionado" },
                      { value: "Cotizado", label: "Cotizado" },
                      { value: "En ejecucion", label: "En ejecucion" },
                    ]}
                    onChange={(opt) => {
                      const estadoAdministrativo = opt?.value ?? "";
                      const { contrato, inmueble, direccion } =
                        ticketSelecionado;
                      const prefix = `Contrato #${contrato} - `;
                      setFormData((prev) => {
                        const prevTitle = prev.titulo;
                        const suffix = prevTitle.startsWith(prefix)
                          ? prevTitle.slice(prefix.length)
                          : prevTitle;
                        return {
                          ...prev,
                          estado_administrativo: estadoAdministrativo,
                          contrato,
                          inmueble,
                          ubicacion: direccion,
                          titulo: `${prefix}${suffix}`.trim(),
                        };
                      });
                    }}
                    className="w-full"
                    classNamePrefix="react-select"
                    placeholder="Selecciona el administrativo"
                    isClearable
                  />
                )}
              {/* Descripción */}
              <label
                htmlFor="descripcion"
                className="block mb-3 text-sm font-medium text-gray-900 dark:text-white"
              >
                Descripción
              </label>
              <textarea
                rows={6}
                id="descripcion"
                placeholder="Describe detalladamente qué se va a realizar en esta actividad"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className={inputStyle}
                required
              />
              {/* Botones */}
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
