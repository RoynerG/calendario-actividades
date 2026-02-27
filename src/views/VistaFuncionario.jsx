import { useEffect, useState, useRef } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import Swal from "sweetalert2";
import {
  listarCategorias,
  obtenerFuncionario,
  filtrarEventos,
  crearEvento,
  crearEventos,
  crearRecordatorioLibre,
  obtenerTicketsFuncionario,
  verificarBloqueo,
  listarPendientesVencidos,
  cambiarEstadoEvento,
} from "../services/eventService";
import { useParams, useNavigate } from "react-router-dom";
import schedulerConfig from "../services/schedulerConfig";
import { es } from "date-fns/locale";
import Select from "react-select";
import GuiaCategorias from "../components/GuiaCategorias";
import GuiaEventosRecurrentes from "../components/GuiaEventosRecurrentes";
import GuiaRecordatorios from "../components/GuiaRecordatorios";
import EventoViewer from "../components/EventoViewer";
import { showSwal, swalBaseOptions } from "../helpers/swalUtils";
import { FaClipboardList, FaExclamationTriangle } from "react-icons/fa";
import {
  showVerSeguimientosModal,
  showCrearSeguimientoModal,
} from "../helpers/seguimientoModals";

import { checkAdminAndExecute } from "../helpers/auth";

export default function VistaFuncionario() {
  const { id_funcionario } = useParams();
  const navigate = useNavigate();
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
    recordatorio_activo: false,
    recordatorio_minutos: "",
    recordatorio_canal: "whatsapp",
  });
  const [relacionadoConTicket, setRelacionadoConTicket] = useState(null);
  const [ticketSelecionado, setTicketSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showRecordatorioLibreForm, setShowRecordatorioLibreForm] =
    useState(false);
  const [recordatorioLibreData, setRecordatorioLibreData] = useState({
    titulo: "",
    mensaje: "",
    fecha: "",
    hora: "",
    canal: "whatsapp",
  });
  const [esCita, setEsCita] = useState(null);
  const [pendientesCount, setPendientesCount] = useState(0);
  const schedulerRef = useRef(null);

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
    "bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-3 shadow-sm transition";

  // Función para mostrar modal de eventos pendientes
  const mostrarPendientes = async () => {
    // Mostrar loading
    Swal.fire({
      title: "Cargando pendientes...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      ...swalBaseOptions,
    });

    try {
      const res = await listarPendientesVencidos(id_funcionario);
      Swal.close();

      if (res.success) {
        const pendientes = res.data;
        setPendientesCount(pendientes.length);
        if (pendientes.length === 0) {
          Swal.fire({
            title: "¡Todo al día!",
            text: "No tienes eventos pendientes vencidos.",
            icon: "success",
            ...swalBaseOptions,
          });
          return;
        }

        // Construir HTML del listado
        // Usaremos un div contenedor con ID para poder actualizarlo si es necesario,
        // aunque con SweetAlert es más fácil regenerar el modal completo tras una acción.
        // Pero como Swal es una promesa, manejaremos la acción dentro de preConfirm o html con eventos delegados.
        // Mejor opción: Renderizar HTML y usar eventos delegados en el didOpen del Swal.

        let htmlList = `<div class="text-left max-h-[60vh] overflow-y-auto space-y-3 p-2">`;
        pendientes.forEach((ev) => {
          htmlList += `
            <div class="bg-red-50 p-3 rounded border-l-4 border-red-500 shadow-sm mb-2 flex flex-col sm:flex-row justify-between items-center gap-2">
              <div class="flex-1">
                <div class="font-bold text-red-700 text-sm">${ev.titulo}</div>
                <div class="text-xs text-gray-600">
                  ${new Date(ev.fecha_inicio).toLocaleString()}
                </div>
                <div class="text-xs text-gray-500 mt-1">${ev.categoria}</div>
              </div>
              <button 
                class="btn-marcar-realizado bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded shadow"
                data-id="${ev.id}"
              >
                Marcar Realizado
              </button>
            </div>
          `;
        });
        htmlList += `</div>`;

        await Swal.fire({
          title: "Eventos Pendientes Vencidos",
          html: htmlList,
          width: "700px",
          showCloseButton: true,
          showConfirmButton: false,
          ...swalBaseOptions,
          didOpen: (modalElement) => {
            // Agregar listeners a los botones
            const buttons = modalElement.querySelectorAll(
              ".btn-marcar-realizado"
            );
            buttons.forEach((btn) => {
              btn.addEventListener("click", async () => {
                const idEvento = btn.getAttribute("data-id");

                // Pedir observación
                const { value: observacion } = await Swal.fire({
                  title: "Finalizar Evento",
                  input: "textarea",
                  inputLabel: "Observación / Motivo",
                  inputPlaceholder: "Escribe una observación...",
                  inputAttributes: {
                    "aria-label": "Escribe una observación",
                  },
                  showCancelButton: true,
                  ...swalBaseOptions,
                });

                if (observacion) {
                  try {
                    // Mostrar loading pequeño
                    Swal.showLoading();
                    const resp = await cambiarEstadoEvento(
                      idEvento,
                      observacion
                    );
                    if (resp.success) {
                      await Swal.fire({
                        title: "¡Evento finalizado!",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                        ...swalBaseOptions,
                      });
                      // Recargar la lista de pendientes (llamada recursiva a mostrarPendientes)
                      mostrarPendientes();
                      // Recargar eventos del calendario
                      // No podemos llamar fetchEventos directamente porque está en useEffect, pero podemos forzar reload o actualizar estado si lo sacamos.
                      // Por simplicidad, recargaremos la página al cerrar todo, o confiamos en que el usuario refresque.
                      // O mejor: window.location.reload() si queremos ser drásticos, o dejamos así.
                    } else {
                      Swal.fire({
                        title: "Error",
                        text: resp.message || "Error al finalizar",
                        icon: "error",
                        ...swalBaseOptions,
                      });
                    }
                  } catch (e) {
                    console.error(e);
                    Swal.fire({
                      title: "Error",
                      text: "Ocurrió un error al finalizar el evento",
                      icon: "error",
                      ...swalBaseOptions,
                    });
                  }
                }
              });
            });
          },
        });
      } else {
        Swal.fire({
          title: "Error",
          text: res.message || "No se pudieron cargar pendientes",
          icon: "error",
          ...swalBaseOptions,
        });
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        title: "Error",
        text: "Error de conexión",
        icon: "error",
        ...swalBaseOptions,
      });
    }
  };

  // Funciones wrapper para verificar Admin antes de abrir modales de seguimiento
  const handleVerSeguimiento = (idEvento = null) => {
    const tipo = idEvento ? "evento" : "funcionario";
    showVerSeguimientosModal(idEvento, tipo, id_funcionario);
  };

  const handleHacerSeguimiento = (idEvento = null) => {
    const tipo = idEvento ? "evento" : "funcionario";
    checkAdminAndExecute(() => {
      showCrearSeguimientoModal(idEvento, tipo, "Admin", id_funcionario);
    });
  };

  const handleVerSeguimientoGlobal = () => {
    checkAdminAndExecute(() => {
      navigate("/consolidado-seguimientos");
    });
  };

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

  // Efecto para detectar evento_id en la URL y abrir modal de seguimiento
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventoId = params.get("evento_id");
    if (eventoId) {
      // Pequeño delay para asegurar que Swal no entre en conflicto con otros
      setTimeout(() => {
        handleVerSeguimiento(eventoId);
      }, 500);
    }
  }, []);

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
        if (res.success) {
          setPendientesCount(res.data.cantidad || 0);
          if (res.data.bloqueado) {
            Swal.fire({
              title: "¡Atención!",
              html: `
              <p class="mb-4">Tienes <b>${res.data.cantidad}</b> evento(s) sin realizar con más de 2 días de antigüedad.</p>
              <p class="mb-4 text-sm text-red-600 font-bold">No puedes agendar nuevos eventos hasta resolverlos.</p>
              <button id="btn-ver-pendientes-alert" class="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 shadow-lg transition-all">
                Ver Pendientes y Resolver
              </button>
            `,
              icon: "warning",
              showConfirmButton: false,
              allowOutsideClick: false,
              allowEscapeKey: false,
              ...swalBaseOptions,
              didOpen: (modalElement) => {
                const btn = modalElement.querySelector(
                  "#btn-ver-pendientes-alert"
                );
                if (btn) {
                  btn.addEventListener("click", () => {
                    Swal.close(); // Cerrar alerta de bloqueo
                    mostrarPendientes(); // Abrir modal de pendientes
                  });
                }
              },
            });
          }
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

  const resetFormState = () => {
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

    // Combina fecha y horas a formato ISO local: "YYYY-MM-DDTHH:mm"
    const { fecha, hora_inicio, hora_fin } = formData;

    if (formData.recordatorio_activo && !formData.recordatorio_minutos) {
      setShowForm(false);
      await showSwal({
        title: "Error",
        text: "Selecciona la anticipación del recordatorio.",
        icon: "error",
      });
      setShowForm(true);
      return;
    }

    if (esRecurrente) {
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

      eventosParaCrear = eventosParaCrear.map((ev) => {
        const copia = { ...ev };
        delete copia.fecha;
        delete copia.hora_inicio;
        delete copia.hora_fin;
        return copia;
      });

      try {
        setShowForm(false);
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
          const count = res.data?.count || eventosParaCrear.length;
          await Swal.fire({
            title: "¡Éxito!",
            text: `Se crearon ${count} eventos correctamente.`,
            icon: "success",
            ...swalBaseOptions,
          });
          resetFormState();
          setFiltros({ ...filtros });
        } else {
          await Swal.fire({
            title: "Error",
            text: res.message || "Error al crear eventos.",
            icon: "error",
            ...swalBaseOptions,
          });
          setShowForm(true);
        }
      } catch (error) {
        console.error(error);
        await Swal.fire({
          title: "Error",
          text: "Ocurrió un error al procesar la solicitud.",
          icon: "error",
          ...swalBaseOptions,
        });
        setShowForm(true);
      }
      return;
    }

    const fecha_inicio = fecha && hora_inicio ? `${fecha}T${hora_inicio}` : "";
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

    const eventoData = {
      ...formData,
      fecha_inicio,
      fecha_fin,
    };

    delete eventoData.fecha;
    delete eventoData.hora_inicio;
    delete eventoData.hora_fin;

    try {
      setShowForm(false);
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
        resetFormState();
        setFiltros({ ...filtros });
      } else {
        const mensaje = res.data.message || "No se pudo agregar el evento";
        await Swal.fire({
          title: "No se puede crear el evento",
          html: mensaje,
          icon: "warning",
          ...swalBaseOptions,
        });
        setShowForm(true);
      }
    } catch (error) {
      console.error(error);
      await Swal.fire({
        title: "Error",
        text: "Ocurrió un error al agregar el evento",
        icon: "error",
        ...swalBaseOptions,
      });
      setShowForm(true);
    }
  };

  const handleCrearRecordatorioLibre = async (e) => {
    e.preventDefault();
    document.activeElement?.blur();

    const { titulo, mensaje, fecha, hora, canal } = recordatorioLibreData;

    if (!titulo || !mensaje || !fecha || !hora) {
      await showSwal({
        title: "Error",
        text: "Completa todos los campos del recordatorio.",
        icon: "error",
      });
      return;
    }

    const fecha_programada = `${fecha}T${hora}`;
    const fechaProgramadaDate = new Date(fecha_programada);
    const ahora = new Date();

    if (isNaN(fechaProgramadaDate.getTime())) {
      await showSwal({
        title: "Error",
        text: "La fecha u hora no son válidas.",
        icon: "error",
      });
      return;
    }

    if (fechaProgramadaDate < ahora) {
      await showSwal({
        title: "Error",
        text: "La fecha programada no puede ser pasada.",
        icon: "error",
      });
      return;
    }

    try {
      setShowRecordatorioLibreForm(false);
      Swal.fire({
        title: "Guardando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        ...swalBaseOptions,
      });

      const res = await crearRecordatorioLibre({
        id_empleado: id_funcionario,
        titulo,
        mensaje,
        canal,
        fecha_programada,
      });

      if (res.success) {
        await Swal.fire({
          title: "¡Éxito!",
          text: "El recordatorio fue creado correctamente",
          icon: "success",
          ...swalBaseOptions,
        });
        setRecordatorioLibreData({
          titulo: "",
          mensaje: "",
          fecha: "",
          hora: "",
          canal: "whatsapp",
        });
      } else {
        await Swal.fire({
          title: "Error",
          text: res.message || "No se pudo crear el recordatorio",
          icon: "error",
          ...swalBaseOptions,
        });
        setShowRecordatorioLibreForm(true);
      }
    } catch (error) {
      console.error(error);
      await Swal.fire({
        title: "Error",
        text: "Ocurrió un error al crear el recordatorio",
        icon: "error",
        ...swalBaseOptions,
      });
      setShowRecordatorioLibreForm(true);
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
        <GuiaEventosRecurrentes buttonStyle={buttonStyle} />
        <GuiaRecordatorios buttonStyle={buttonStyle} />
      </div>
      <h1 className="text-sm md:text-5xl font-bold">
        Calendario de {funcionario.nombre || "Funcionario"}
      </h1>
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <button
          onClick={() => {
            resetFormState();
            setEsRecurrente(false);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          + Crear Evento
        </button>

        <button
          onClick={() => {
            resetFormState();
            setEsRecurrente(true);
            setShowForm(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          + Eventos Recurrentes
        </button>

        <button
          onClick={() => setShowRecordatorioLibreForm(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          + Recordatorio Libre
        </button>

        {/* Botón de Pendientes */}
        <button
          onClick={mostrarPendientes}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-md flex items-center transition duration-300 ease-in-out transform hover:-translate-y-1 relative"
        >
          <FaExclamationTriangle className="mr-2" />
          Eventos Pendientes
          {pendientesCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm border border-white">
              {pendientesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleHacerSeguimiento(null)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded shadow-md flex items-center transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          <FaClipboardList className="mr-2" />
          Hacer Seguimiento Global
        </button>
        <button
          onClick={() => handleVerSeguimiento(null)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md flex items-center transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          <FaClipboardList className="mr-2" />
          Ver Mi Seguimiento
        </button>
        <button
          onClick={handleVerSeguimientoGlobal}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded shadow-md flex items-center transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          <FaClipboardList className="mr-2" />
          Ver Seguimiento Global
        </button>
      </div>
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
                onVerSeguimiento={() => handleVerSeguimiento(event.event_id)}
                onHacerSeguimiento={() =>
                  handleHacerSeguimiento(event.event_id)
                }
                allowActions={true}
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
        <div className="fixed inset-0 z-[120000] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120000]"
            onClick={() => setShowForm(false)}
          />
          <div
            className={`relative bg-white rounded-2xl shadow-2xl w-full ${
              esRecurrente ? "max-w-2xl" : "max-w-xl"
            } max-h-[90vh] overflow-y-auto z-[120001]`}
          >
            <div
              className={`px-6 py-5 text-white ${
                esRecurrente
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {esRecurrente
                      ? "Crear eventos recurrentes"
                      : "Crear evento"}
                  </h2>
                  <p className="text-sm text-white/80">
                    {esRecurrente
                      ? "Programa varias fechas en un solo paso."
                      : "Agenda una actividad puntual en tu calendario."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center text-white"
                >
                  ✕
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/15">
                  {esRecurrente ? "Recurrente" : "Único"}
                </span>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/10">
                  {esRecurrente
                    ? "Diario, días específicos o fechas personalizadas"
                    : "Fecha y horario único"}
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
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
                required={
                  !(esRecurrente && tipoRecurrencia === "personalizado")
                }
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
                required={
                  !(esRecurrente && tipoRecurrencia === "personalizado")
                }
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
                required={
                  !(esRecurrente && tipoRecurrencia === "personalizado")
                }
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

              {esRecurrente && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <div className="rounded-xl border border-emerald-100 bg-white p-4">
                    <p className="mb-2 text-sm font-bold text-gray-900">
                      Tipo de recurrencia:
                    </p>
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center">
                        <input
                          id="tipo-diario"
                          type="radio"
                          name="tipoRecurrencia"
                          value="diario"
                          checked={tipoRecurrencia === "diario"}
                          onChange={(e) => setTipoRecurrencia(e.target.value)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="tipo-diario"
                          className="ml-2 text-sm font-medium text-gray-900"
                        >
                          Todos los días
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="tipo-semanal"
                          type="radio"
                          name="tipoRecurrencia"
                          value="semanal"
                          checked={tipoRecurrencia === "semanal"}
                          onChange={(e) => setTipoRecurrencia(e.target.value)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="tipo-semanal"
                          className="ml-2 text-sm font-medium text-gray-900"
                        >
                          Días específicos
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="tipo-personalizado"
                          type="radio"
                          name="tipoRecurrencia"
                          value="personalizado"
                          checked={tipoRecurrencia === "personalizado"}
                          onChange={(e) => setTipoRecurrencia(e.target.value)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="tipo-personalizado"
                          className="ml-2 text-sm font-medium text-gray-900"
                        >
                          Fechas personalizadas
                        </label>
                      </div>
                    </div>

                    {tipoRecurrencia === "semanal" && (
                      <div className="mb-4">
                        <p className="mb-2 text-sm text-gray-700">
                          Selecciona los días:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Dom",
                            "Lun",
                            "Mar",
                            "Mié",
                            "Jue",
                            "Vie",
                            "Sáb",
                          ].map((dia, index) => (
                            <label
                              key={index}
                              className="inline-flex items-center"
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
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="ml-1 text-sm text-gray-900 mr-3">
                                {dia}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {tipoRecurrencia !== "personalizado" && (
                      <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-900">
                          Fecha fin de recurrencia
                        </label>
                        <input
                          type="date"
                          value={fechaFinRecurrencia}
                          onChange={(e) =>
                            setFechaFinRecurrencia(e.target.value)
                          }
                          className={inputStyle}
                          required={tipoRecurrencia !== "personalizado"}
                        />
                      </div>
                    )}

                    {tipoRecurrencia === "personalizado" && (
                      <div className="mb-4">
                        <p className="mb-2 text-sm text-gray-700">
                          Agrega fechas y horas específicas:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                          <input
                            type="date"
                            value={fechaPersonalizada}
                            onChange={(e) =>
                              setFechaPersonalizada(e.target.value)
                            }
                            className={inputStyle}
                            placeholder="Fecha"
                          />
                          <input
                            type="time"
                            value={horaInicioPersonalizada}
                            onChange={(e) =>
                              setHoraInicioPersonalizada(e.target.value)
                            }
                            className={inputStyle}
                            placeholder="Hora Inicio"
                          />
                          <input
                            type="time"
                            value={horaFinPersonalizada}
                            onChange={(e) =>
                              setHoraFinPersonalizada(e.target.value)
                            }
                            className={inputStyle}
                            placeholder="Hora Fin"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
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
                            setHoraInicioPersonalizada("");
                            setHoraFinPersonalizada("");
                          }}
                          className="text-white bg-emerald-600 hover:bg-emerald-700 font-medium rounded-lg text-sm px-4 py-2 text-center"
                        >
                          Agregar fecha
                        </button>

                        {fechasPersonalizadas.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-semibold mb-1">
                              Fechas agregadas:
                            </p>
                            <ul className="list-disc pl-5 text-sm text-gray-700 max-h-32 overflow-y-auto">
                              {fechasPersonalizadas.map((item, idx) => (
                                <li
                                  key={idx}
                                  className="flex justify-between items-center mb-1"
                                >
                                  <span>
                                    {item.fecha} ({item.hora_inicio} -{" "}
                                    {item.hora_fin})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFechasPersonalizadas(
                                        fechasPersonalizadas.filter(
                                          (_, i) => i !== idx
                                        )
                                      );
                                    }}
                                    className="text-red-600 hover:text-red-800 ml-2 text-xs font-semibold px-2 py-1 rounded-full hover:bg-red-50"
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
                  </div>
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
      {showRecordatorioLibreForm && (
        <div className="fixed inset-0 z-[120000] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120000]"
            onClick={() => setShowRecordatorioLibreForm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto z-[120001]">
            <div className="px-6 py-5 text-white bg-gradient-to-r from-orange-600 to-amber-500">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Crear recordatorio libre
                  </h2>
                  <p className="text-sm text-white/80">
                    Programa un recordatorio sin evento asociado.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRecordatorioLibreForm(false)}
                  className="h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <form
              onSubmit={handleCrearRecordatorioLibre}
              className="space-y-4 p-6"
            >
              <label
                htmlFor="recordatorio_libre_titulo"
                className="block mb-3 mt-3 text-sm font-medium text-gray-900 dark:text-white"
              >
                Título
              </label>
              <input
                id="recordatorio_libre_titulo"
                type="text"
                placeholder="Escribe el título del recordatorio"
                value={recordatorioLibreData.titulo}
                onChange={(e) =>
                  setRecordatorioLibreData({
                    ...recordatorioLibreData,
                    titulo: e.target.value,
                  })
                }
                className={inputStyle}
                required
              />
              <label
                htmlFor="recordatorio_libre_mensaje"
                className="block mb-3 text-sm font-medium text-gray-900 dark:text-white"
              >
                Mensaje
              </label>
              <textarea
                id="recordatorio_libre_mensaje"
                rows={5}
                placeholder="Describe el recordatorio"
                value={recordatorioLibreData.mensaje}
                onChange={(e) =>
                  setRecordatorioLibreData({
                    ...recordatorioLibreData,
                    mensaje: e.target.value,
                  })
                }
                className={inputStyle}
                required
              />
              <label
                htmlFor="recordatorio_libre_fecha"
                className="block mb-3 text-sm font-medium text-gray-900 dark:text-white"
              >
                Fecha programada
              </label>
              <input
                id="recordatorio_libre_fecha"
                type="date"
                value={recordatorioLibreData.fecha}
                onChange={(e) =>
                  setRecordatorioLibreData({
                    ...recordatorioLibreData,
                    fecha: e.target.value,
                  })
                }
                className={inputStyle}
                required
              />
              <label
                htmlFor="recordatorio_libre_hora"
                className="block mb-3 text-sm font-medium text-gray-900 dark:text-white"
              >
                Hora programada
              </label>
              <input
                id="recordatorio_libre_hora"
                type="time"
                value={recordatorioLibreData.hora}
                onChange={(e) =>
                  setRecordatorioLibreData({
                    ...recordatorioLibreData,
                    hora: e.target.value,
                  })
                }
                className={inputStyle}
                required
              />
              <label
                htmlFor="recordatorio_libre_canal"
                className="block mb-3 text-sm font-medium text-gray-900 dark:text-white"
              >
                Canal
              </label>
              <select
                id="recordatorio_libre_canal"
                value={recordatorioLibreData.canal}
                onChange={(e) =>
                  setRecordatorioLibreData({
                    ...recordatorioLibreData,
                    canal: e.target.value,
                  })
                }
                className={inputStyle}
                required
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Correo</option>
                <option value="ambos">WhatsApp y correo</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRecordatorioLibreForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
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
