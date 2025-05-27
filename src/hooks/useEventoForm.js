import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  listarCategorias,
  listarFuncionarios,
  obtenerTicket,
  crearEvento,
  crearEventos,
} from "../services/eventService";

export function useEventoForm(mode = "simple", id) {
  const [categorias, setCategorias] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);

  const initialData = {
    titulo: "",
    descripcion: "",
    ubicacion: "",
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

  const [formData, setFormData] = useState(initialData);

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
  }, [mode, id]);

  useEffect(() => {
    if (mode !== "ticket") return;
    const { id_categoria, fecha_inicio, fecha_fin, es_cita } = formData;
    const cat = categorias.find((c) => c.id === id_categoria);
    if (es_cita === "si" && cat && fecha_inicio && fecha_fin) {
      const f1 = new Date(fecha_inicio);
      const f2 = new Date(fecha_fin);
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
  }, [
    formData.id_categoria,
    formData.fecha_inicio,
    formData.fecha_fin,
    formData.es_cita,
    categorias,
    mode,
  ]);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const dataPayload = { ...formData };
    if (
      !dataPayload.titulo ||
      !dataPayload.descripcion ||
      !dataPayload.fecha_inicio ||
      !dataPayload.fecha_fin ||
      !dataPayload.id_categoria
    ) {
      return Swal.fire("Error", "Todos los campos obligatorios.", "warning");
    }
    Swal.fire({
      title: "Guardando…",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      let resp;
      if (mode === "multiple")
        resp = await crearEventos({
          eventos: [dataPayload],
          empleados: formData.empleados,
        });
      else resp = (await crearEvento(dataPayload)).data;
      Swal.close();
      if (resp.success) {
        Swal.fire("¡Éxito!", resp.message || "Evento creado.", "success");
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
          customClass: { container: "z-[100000]" },
        });
      }
    } catch (err) {
      Swal.fire(err, "Hubo un error.", "error");
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
