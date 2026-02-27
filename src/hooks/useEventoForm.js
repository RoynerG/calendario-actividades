import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  listarCategorias,
  listarFuncionarios,
  obtenerTicket,
  crearEvento,
  crearEventos,
} from "../services/eventService";
import { swalBaseOptions } from "../helpers/swalUtils";

export function useEventoForm(mode = "simple", id) {
  // Campos de formulario, ahora con fecha y horas separadas
  const initialData = {
    titulo: "",
    descripcion: "",
    ubicacion: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    fecha_inicio: "",
    fecha_fin: "",
    id_categoria: "",
    id_empleado: "",
    id_ticket: mode === "ticket" ? id : "",
    estado_administrativo: "",
    estado_comercial: "",
    contrato: "",
    inmueble: "",
    es_cita: "",
    empleados: [],
  };

  const [categorias, setCategorias] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialData);

  // Cargar categorías y, si aplica, datos del ticket o funcionarios
  useEffect(() => {
    setLoading(true);
    const tasks = [
      listarCategorias().then((res) => res.success && setCategorias(res.data)),
    ];
    if (mode === "ticket") {
      tasks.push(
        obtenerTicket(id).then((res) => {
          if (res.success) {
            setFormData((f) => ({ ...f, id_empleado: res.data.id_empleado }));
            setTicketData(res.data);
          }
        })
      );
    } else if (mode === "multiple") {
      tasks.push(
        listarFuncionarios().then(
          (res) => res.success && setFuncionarios(res.data)
        )
      );
    }
    Promise.all(tasks).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [mode, id]);

  // Generar automáticamente la descripción para citas
  useEffect(() => {
    if (mode !== "ticket") return;
    const { id_categoria, fecha, hora_inicio, hora_fin, es_cita } = formData;
    const cat = categorias.find((c) => c.id === id_categoria);
    if (es_cita === "si" && cat && fecha && hora_inicio && hora_fin) {
      const f1 = new Date(`${fecha}T${hora_inicio}`);
      const f2 = new Date(`${fecha}T${hora_fin}`);
      const optsDate = { day: "2-digit", month: "2-digit", year: "numeric" };
      const optsTime = { hour: "2-digit", minute: "2-digit" };
      const fechaStr = f1.toLocaleDateString("es-CO", optsDate);
      const hora1 = f1.toLocaleTimeString("es-CO", optsTime);
      const hora2 = f2.toLocaleTimeString("es-CO", optsTime);
      setFormData((f) => ({
        ...f,
        descripcion: `Por medio de la presente, le confirmo que he dispuesto de un espacio con el propósito de reunirnos, ya sea de forma presencial o por medios virtuales, a fin de atender cualquier inquietud o asunto pendiente.</br></br>En cumplimiento de <b>${cat.nombre}</b>, la cita ha quedado agendada para el día <b>${fechaStr}</b>, de <b>${hora1}</b> a <b>${hora2}</b>. En caso de no ser posible contar con su atención en la fecha indicada, le agradecemos nos lo comunique por este mismo medio con al menos 3 horas de antelación.`,
      }));
    } else if (mode === "ticket" && formData.es_cita === "no") {
      setFormData((f) => ({ ...f, descripcion: "" }));
    }
    // eslint-disable-next-line
  }, [
    formData.id_categoria,
    formData.fecha,
    formData.hora_inicio,
    formData.hora_fin,
    formData.es_cita,
    categorias,
    mode,
  ]);

  // Submit con validación y armado de payload para API
  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    // Unir fecha y horas para enviar a la API
    const { fecha, hora_inicio, hora_fin } = formData;
    const fecha_inicio = fecha && hora_inicio ? `${fecha}T${hora_inicio}` : "";
    const fecha_fin = fecha && hora_fin ? `${fecha}T${hora_fin}` : "";

    // Validaciones robustas
    if (
      !formData.titulo ||
      !formData.ubicacion ||
      !fecha_inicio ||
      !fecha_fin ||
      !formData.id_categoria
    ) {
      return Swal.fire({
        title: "Error",
        text: "Todos los campos obligatorios.",
        icon: "warning",
        ...swalBaseOptions,
      });
    }

    const fInicio = new Date(fecha_inicio);
    const fFin = new Date(fecha_fin);
    const ahora = new Date();

    if (isNaN(fInicio.getTime()) || isNaN(fFin.getTime())) {
      return Swal.fire({
        title: "Error",
        text: "Debes ingresar fechas y horas válidas.",
        icon: "warning",
        ...swalBaseOptions,
      });
    }

    if (
      fInicio.getFullYear() !== fFin.getFullYear() ||
      fInicio.getMonth() !== fFin.getMonth() ||
      fInicio.getDate() !== fFin.getDate()
    ) {
      return Swal.fire({
        title: "Error",
        text: "La fecha de inicio y la de finalización deben ser el mismo día.",
        icon: "warning",
        ...swalBaseOptions,
      });
    }

    if (fFin < fInicio) {
      return Swal.fire({
        title: "Error",
        text: "La hora de finalización no puede ser menor que la de inicio.",
        icon: "warning",
        ...swalBaseOptions,
      });
    }

    // No permite fechas pasadas
    const inicioSinHoras = new Date(
      fInicio.getFullYear(),
      fInicio.getMonth(),
      fInicio.getDate()
    );
    const hoySinHoras = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate()
    );
    if (inicioSinHoras < hoySinHoras) {
      return Swal.fire({
        title: "Error",
        text: "No puedes seleccionar una fecha pasada.",
        icon: "warning",
        ...swalBaseOptions,
      });
    }
    if (fFin < ahora) {
      return Swal.fire({
        title: "Error",
        text: "No puedes seleccionar una hora de finalización pasada.",
        icon: "warning",
        ...swalBaseOptions,
      });
    }

    // Horas entre 8:00 y 21:00
    const hInicio = fInicio.getHours() + fInicio.getMinutes() / 60;
    const hFin = fFin.getHours() + fFin.getMinutes() / 60;
    if (hInicio < 8 || hInicio > 21) {
      return Swal.fire({
        title: "Error",
        text: "La hora de inicio debe estar entre las 8:00 am y las 9:00 pm.",
        icon: "warning",
        ...swalBaseOptions,
      });
    }
    if (hFin < 8 || hFin > 21) {
      return Swal.fire({
        title: "Error",
        text:
          "La hora de finalización debe estar entre las 8:00 am y las 9:00 pm.",
        icon: "warning",
        ...swalBaseOptions,
      });
    }

    // Si no es cita, descripción obligatoria
    if (formData.es_cita === "no" && !formData.descripcion) {
      return Swal.fire({
        title: "Error",
        text: "La descripción es obligatoria si el evento no es una cita.",
        icon: "warning",
        ...swalBaseOptions,
      });
    }

    Swal.fire({
      title: "Guardando…",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      ...swalBaseOptions,
    });
    try {
      // Solo envía los campos requeridos por la API
      const payload = {
        ...formData,
        fecha_inicio,
        fecha_fin,
      };
      delete payload.fecha;
      delete payload.hora_inicio;
      delete payload.hora_fin;

      let resp;
      if (mode === "multiple")
        resp = await crearEventos({
          eventos: [payload],
          empleados: formData.empleados,
        });
      else resp = (await crearEvento(payload)).data;
      Swal.close();
      if (resp.success) {
        Swal.fire({
          title: "¡Éxito!",
          text: resp.message || "Evento creado.",
          icon: "success",
          ...swalBaseOptions,
        });
        setFormData({
          ...initialData,
          id_ticket: mode === "ticket" ? id : "",
          id_empleado: ticketData?.id_empleado || "",
        });
      } else {
        const mensaje = resp.message || "No se pudo crear el evento.";
        await Swal.fire({
          title: "No se puede crear el evento",
          html: mensaje,
          icon: "warning",
          ...swalBaseOptions,
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Hubo un error.",
        icon: "error",
        ...swalBaseOptions,
      });
    }
  };

  return {
    categorias,
    funcionarios,
    ticketData,
    formData,
    setFormData,
    loading,
    handleSubmit,
  };
}
