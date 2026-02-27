import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  listarCategorias,
  crearEvento,
  crearEventos,
  obtenerTicketsFuncionario,
  verificarBloqueo,
  obtenerFuncionario,
} from "../services/eventService";
import Select from "react-select";
import { useParams } from "react-router-dom";
import { showSwal, swalBaseOptions } from "../helpers/swalUtils";

export default function CrearEventoFuncionario() {
  const { id_funcionario } = useParams();
  const [categorias, setCategorias] = useState([]);
  const [funcionario, setFuncionario] = useState({});
  const [tickets, setTickets] = useState([]);
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
    recordatorio_activo: false,
    recordatorio_minutos: "",
    recordatorio_canal: "whatsapp",
  });
  const [relacionadoConTicket, setRelacionadoConTicket] = useState(null);
  const [ticketSelecionado, setTicketSelecionado] = useState(null);
  const [esCita, setEsCita] = useState(null);

  // Estados para recurrencia
  const [esRecurrente, setEsRecurrente] = useState(false);
  const [tipoRecurrencia, setTipoRecurrencia] = useState("diario"); // diario, semanal, personalizado
  const [fechaFinRecurrencia, setFechaFinRecurrencia] = useState("");
  const [diasSemana, setDiasSemana] = useState([]); // [0, 1, 2, 3, 4, 5, 6] (Sun-Sat)
  const [fechasPersonalizadas, setFechasPersonalizadas] = useState([]);
  const [fechaPersonalizada, setFechaPersonalizada] = useState("");
  const [horaInicioPersonalizada, setHoraInicioPersonalizada] = useState("");
  const [horaFinPersonalizada, setHoraFinPersonalizada] = useState("");

  const inputStyle =
    "border p-2 rounded w-bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

  useEffect(() => {
    listarCategorias().then((res) => {
      if (res.success) setCategorias(res.data);
    });
    obtenerTicketsFuncionario(id_funcionario).then((res) => {
      if (res.success) setTickets(res.data);
    });
  }, [id_funcionario]);

  useEffect(() => {
    const cargarDatos = async () => {
      const resFuncionario = await obtenerFuncionario(id_funcionario);
      if (resFuncionario.success) {
        setFuncionario(resFuncionario.data);
        sessionStorage.setItem("id_funcionario", id_funcionario);

        const resBloqueo = await verificarBloqueo(id_funcionario);
        if (resBloqueo.success && resBloqueo.data.bloqueado) {
          Swal.fire({
            title: "¡Atención!",
            html: `El funcionario ${resFuncionario.data.nombre} tiene <b>${resBloqueo.data.cantidad}</b> evento(s) sin realizar con más de 2 días de antigüedad. No puedes agendar nuevos eventos hasta que se resuelva. Contactate con ese funcionario.`,
            icon: "warning",
            ...swalBaseOptions,
          });
        }
      }

      const resCategorias = await listarCategorias();
      if (resCategorias.success) setCategorias(resCategorias.data);

      const resTickets = await obtenerTicketsFuncionario(id_funcionario);
      if (resTickets.success) setTickets(resTickets.data);
    };

    cargarDatos();
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

  const resetForm = () => {
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
      recordatorio_activo: false,
      recordatorio_minutos: "",
      recordatorio_canal: "whatsapp",
    });
    setRelacionadoConTicket(null);
    setEsCita(null);
    setTicketSelecionado(null);
    setFiltros({ ...filtros });
    setEsRecurrente(false);
    setFechasPersonalizadas([]);
    setFechaFinRecurrencia("");
    setDiasSemana([]);
  };

  const validarEventoIndividual = (fecha, hora_inicio, hora_fin) => {
    const fechaInicio = new Date(`${fecha}T${hora_inicio}`);
    const fechaFin = new Date(`${fecha}T${hora_fin}`);
    const ahora = new Date();

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return "Debes ingresar fechas y horas válidas.";
    }

    if (fechaFin < fechaInicio) {
      return "La hora de finalización no puede ser menor que la de inicio.";
    }

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
      return "No puedes seleccionar una fecha pasada.";
    }

    if (fechaFin < ahora) {
      return "No puedes seleccionar una hora de finalización pasada.";
    }

    const horaInicioVal =
      fechaInicio.getHours() + fechaInicio.getMinutes() / 60;
    const horaFinVal = fechaFin.getHours() + fechaFin.getMinutes() / 60;

    if (horaInicioVal < 8 || horaInicioVal > 21) {
      return "La hora de inicio debe estar entre las 8:00 am y las 9:00 pm.";
    }
    if (horaFinVal < 8 || horaFinVal > 21) {
      return "La hora de finalización debe estar entre las 8:00 am y las 9:00 pm.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    document.activeElement?.blur();

    const { fecha, hora_inicio, hora_fin } = formData;

    if (formData.recordatorio_activo && !formData.recordatorio_minutos) {
      await showSwal({
        title: "Error",
        text: "Selecciona la anticipación del recordatorio.",
        icon: "error",
      });
      return;
    }

    if (!esRecurrente) {
      // Combina fecha y horas a formato ISO local: "YYYY-MM-DDTHH:mm"
      const fecha_inicio =
        fecha && hora_inicio ? `${fecha}T${hora_inicio}` : "";
      const fecha_fin = fecha && hora_fin ? `${fecha}T${hora_fin}` : "";

      const error = validarEventoIndividual(fecha, hora_inicio, hora_fin);
      if (error) {
        await showSwal({
          title: "Error",
          text: error,
          icon: "error",
        });
        return;
      }

      // Prepara datos para enviar
      const eventoData = {
        ...formData,
        fecha_inicio,
        fecha_fin,
      };

      delete eventoData.fecha;
      delete eventoData.hora_inicio;
      delete eventoData.hora_fin;

      try {
        Swal.fire({
          title: "Guardando...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
          ...swalBaseOptions,
        });
        const res = await crearEvento(eventoData);
        if (res.data.success) {
          await Swal.fire({
            title: "¡Éxito!",
            text: "El evento fue agregado correctamente",
            icon: "success",
            ...swalBaseOptions,
          });
          resetForm();
        } else {
          const mensaje = `El funcionario <b>${funcionario.nombre}</b> tiene eventos sin marcar.`;
          await Swal.fire({
            title: "No se puede crear el evento",
            html: mensaje,
            icon: "warning",
            ...swalBaseOptions,
          });
        }
      } catch (error) {
        console.error(error);
        await Swal.fire({
          title: "Error",
          text: "Ocurrió un error al agregar el evento",
          icon: "error",
          ...swalBaseOptions,
        });
      }
    } else {
      // LÓGICA RECURRENTE
      let eventosParaCrear = [];

      if (tipoRecurrencia === "personalizado") {
        if (fechasPersonalizadas.length === 0) {
          await showSwal({
            title: "Error",
            text: "Debes agregar al menos una fecha personalizada.",
            icon: "error",
          });
          return;
        }
        fechasPersonalizadas.forEach((item) => {
          eventosParaCrear.push({
            ...formData,
            fecha_inicio: `${item.fecha}T${item.hora_inicio}`,
            fecha_fin: `${item.fecha}T${item.hora_fin}`,
          });
        });
      } else {
        // Diario o Semanal
        if (!fechaFinRecurrencia) {
          await showSwal({
            title: "Error",
            text: "Debes seleccionar una fecha de fin para la recurrencia.",
            icon: "error",
          });
          return;
        }
        if (tipoRecurrencia === "semanal" && diasSemana.length === 0) {
          await showSwal({
            title: "Error",
            text: "Debes seleccionar al menos un día de la semana.",
            icon: "error",
          });
          return;
        }

        const error = validarEventoIndividual(fecha, hora_inicio, hora_fin);
        if (error) {
          await showSwal({
            title: "Error",
            text: error,
            icon: "error",
          });
          return;
        }

        const [y, m, d] = fecha.split("-").map(Number);
        const [yEnd, mEnd, dEnd] = fechaFinRecurrencia.split("-").map(Number);

        let currentDate = new Date(y, m - 1, d);
        const endDate = new Date(yEnd, mEnd - 1, dEnd);

        if (endDate < currentDate) {
          await showSwal({
            title: "Error",
            text: "La fecha fin de recurrencia no puede ser menor a la fecha de inicio.",
            icon: "error",
          });
          return;
        }

        while (currentDate <= endDate) {
          let agregar = false;
          if (tipoRecurrencia === "diario") agregar = true;
          else if (tipoRecurrencia === "semanal") {
            if (diasSemana.includes(currentDate.getDay())) agregar = true;
          }

          if (agregar) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, "0");
            const day = String(currentDate.getDate()).padStart(2, "0");
            const fechaStr = `${year}-${month}-${day}`;

            eventosParaCrear.push({
              ...formData,
              fecha_inicio: `${fechaStr}T${hora_inicio}`,
              fecha_fin: `${fechaStr}T${hora_fin}`,
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      if (eventosParaCrear.length === 0) {
        await showSwal({
          title: "Error",
          text: "No se generaron eventos con la configuración seleccionada.",
          icon: "error",
        });
        return;
      }

      // Limpieza de datos
      eventosParaCrear = eventosParaCrear.map((ev) => {
        const copia = { ...ev };
        delete copia.fecha;
        delete copia.hora_inicio;
        delete copia.hora_fin;
        return copia;
      });

      try {
        Swal.fire({
          title: "Procesando...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
          ...swalBaseOptions,
        });

        const payload = {
          eventos: eventosParaCrear,
          empleados: [id_funcionario],
        };

        const res = await crearEventos(payload);

        if (res.success) {
          // Si el backend devuelve success=true
          // res.data suele tener { count: X, ids: [...] } o similar
          const count = res.data?.count || eventosParaCrear.length;
          await Swal.fire({
            title: "¡Éxito!",
            text: `Se crearon ${count} eventos correctamente.`,
            icon: "success",
            ...swalBaseOptions,
          });
          resetForm();
        } else {
          await Swal.fire({
            title: "Error",
            text: res.message || "Error al crear eventos.",
            icon: "error",
            ...swalBaseOptions,
          });
        }
      } catch (error) {
        console.error(error);
        await Swal.fire({
          title: "Error",
          text: "Ocurrió un error al procesar la solicitud.",
          icon: "error",
          ...swalBaseOptions,
        });
      }
    }
  };

  return (
    <div className="p-4 space-y-4 mx-auto max-w-lg">
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
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
          className={inputStyle}
          required={!(esRecurrente && tipoRecurrencia === "personalizado")}
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
          required={!(esRecurrente && tipoRecurrencia === "personalizado")}
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
          required={!(esRecurrente && tipoRecurrencia === "personalizado")}
        />

        <div className="flex items-center mb-4">
          <input
            id="recordatorio_activo"
            type="checkbox"
            checked={formData.recordatorio_activo}
            onChange={(e) =>
              setFormData({
                ...formData,
                recordatorio_activo: e.target.checked,
              })
            }
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="recordatorio_activo"
            className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Enviar recordatorio
          </label>
        </div>

        {formData.recordatorio_activo && (
          <>
            <label
              htmlFor="recordatorio_minutos"
              className="block mb-3 text-sm font-medium text-gray-900 dark:text-white"
            >
              Anticipación del recordatorio
            </label>
            <select
              id="recordatorio_minutos"
              value={formData.recordatorio_minutos}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recordatorio_minutos: e.target.value,
                })
              }
              className={inputStyle}
              required
            >
              <option value="">Selecciona</option>
              <option value="10">10 minutos antes</option>
              <option value="30">30 minutos antes</option>
              <option value="60">1 hora antes</option>
              <option value="120">2 horas antes</option>
              <option value="1440">1 día antes</option>
            </select>
            <label
              htmlFor="recordatorio_canal"
              className="block mb-3 text-sm font-medium text-gray-900 dark:text-white"
            >
              Canal del recordatorio
            </label>
            <select
              id="recordatorio_canal"
              value={formData.recordatorio_canal}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recordatorio_canal: e.target.value,
                })
              }
              className={inputStyle}
              required
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Correo</option>
              <option value="ambos">WhatsApp y correo</option>
            </select>
          </>
        )}

        {/* Sección de Recurrencia */}
        <div className="flex items-center mb-4">
          <input
            id="esRecurrente"
            type="checkbox"
            checked={esRecurrente}
            onChange={(e) => setEsRecurrente(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="esRecurrente"
            className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            ¿Evento recurrente / múltiples fechas?
          </label>
        </div>

        {esRecurrente && (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              Configuración de Recurrencia
            </h3>

            {/* Tipo de Recurrencia */}
            <div className="flex flex-wrap gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoRecurrencia"
                  value="diario"
                  checked={tipoRecurrencia === "diario"}
                  onChange={(e) => setTipoRecurrencia(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                  Diario
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoRecurrencia"
                  value="semanal"
                  checked={tipoRecurrencia === "semanal"}
                  onChange={(e) => setTipoRecurrencia(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                  Días Seleccionados
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoRecurrencia"
                  value="personalizado"
                  checked={tipoRecurrencia === "personalizado"}
                  onChange={(e) => setTipoRecurrencia(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                  Personalizado
                </span>
              </label>
            </div>

            {/* Opciones para Diario y Semanal */}
            {(tipoRecurrencia === "diario" ||
              tipoRecurrencia === "semanal") && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Repetir hasta
                </label>
                <input
                  type="date"
                  value={fechaFinRecurrencia}
                  onChange={(e) => setFechaFinRecurrencia(e.target.value)}
                  className={inputStyle}
                  min={formData.fecha} // No puede ser antes de la fecha inicial
                />
              </div>
            )}

            {/* Opciones para Semanal (Días de la semana) */}
            {tipoRecurrencia === "semanal" && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Selecciona los días
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(
                    (dia, index) => (
                      <label
                        key={index}
                        className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={diasSemana.includes(index)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDiasSemana([...diasSemana, index]);
                            } else {
                              setDiasSemana(
                                diasSemana.filter((d) => d !== index)
                              );
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                          {dia}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Opciones para Personalizado */}
            {tipoRecurrencia === "personalizado" && (
              <div className="mb-4">
                <div className="grid grid-cols-1 gap-2 mb-2 sm:grid-cols-3">
                  <input
                    type="date"
                    value={fechaPersonalizada}
                    onChange={(e) => setFechaPersonalizada(e.target.value)}
                    className={inputStyle}
                    placeholder="Fecha"
                  />
                  <input
                    type="time"
                    value={horaInicioPersonalizada}
                    onChange={(e) => setHoraInicioPersonalizada(e.target.value)}
                    className={inputStyle}
                    placeholder="Hora Inicio"
                  />
                  <input
                    type="time"
                    value={horaFinPersonalizada}
                    onChange={(e) => setHoraFinPersonalizada(e.target.value)}
                    className={inputStyle}
                    placeholder="Hora Fin"
                  />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (
                      fechaPersonalizada &&
                      horaInicioPersonalizada &&
                      horaFinPersonalizada
                    ) {
                      const error = validarEventoIndividual(
                        fechaPersonalizada,
                        horaInicioPersonalizada,
                        horaFinPersonalizada
                      );
                      if (error) {
                        await showSwal({
                          title: "Error",
                          text: error,
                          icon: "error",
                        });
                        return;
                      }

                      setFechasPersonalizadas([
                        ...fechasPersonalizadas,
                        {
                          fecha: fechaPersonalizada,
                          hora_inicio: horaInicioPersonalizada,
                          hora_fin: horaFinPersonalizada,
                        },
                      ]);
                      setFechaPersonalizada("");
                    } else {
                      await showSwal({
                        title: "Error",
                        text: "Debes completar la fecha y horas para agregar.",
                        icon: "error",
                      });
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300"
                >
                  Agregar Fecha
                </button>

                {/* Lista de fechas agregadas */}
                <ul className="mt-4 space-y-2">
                  {fechasPersonalizadas.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-2 bg-white border rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                      <span className="text-sm text-gray-900 dark:text-white">
                        {item.fecha} | {item.hora_inicio} - {item.hora_fin}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFechasPersonalizadas(
                            fechasPersonalizadas.filter((_, i) => i !== index)
                          );
                        }}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

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
            onChange={(opt) => setRelacionadoConTicket(opt?.value === "si")}
            className="w-full"
            classNamePrefix="react-select"
            placeholder="¿Relacionado con ticket?"
            isClearable
          />
        )}
        {/* Selección del ticket si aplica */}
        {relacionadoConTicket && (
          <Select
            options={tickets.map((t) => {
              const label =
                t.departamento !== "Servicio al cliente"
                  ? `Ticket: #${t._ID} - Contrato: #${t.contrato} - Inmueble: #${t.inmueble}`
                  : `Ticket: #${t._ID} - Solicitante: ${t.solicitante}`;

              return {
                value: t._ID,
                label,
              };
            })}
            value={
              formData.id_ticket
                ? (() => {
                    const t = tickets.find((t) => t._ID === formData.id_ticket);
                    if (!t)
                      return {
                        value: formData.id_ticket,
                        label: formData.id_ticket,
                      };

                    const label =
                      t.departamento !== "Servicio al cliente"
                        ? `Ticket: #${t._ID} - Contrato: #${t.contrato} - Inmueble: #${t.inmueble}`
                        : `Ticket: #${t._ID} - Solicitante: ${t.solicitante}`;

                    return {
                      value: t._ID,
                      label,
                    };
                  })()
                : null
            }
            onChange={(opt) => {
              const id = opt?.value || "";
              setFormData((prev) => ({ ...prev, id_ticket: id }));

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
                const { contrato, inmueble, direccion } = ticketSelecionado;
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
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Crear
          </button>
        </div>
      </form>
    </div>
  );
}
