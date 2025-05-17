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
            setFormData((f) => ({
              ...f,
              id_empleado: res.data.id_empleado,
            }));
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
    const { id_categoria, fecha_inicio, fecha_fin } = formData;
    const cat = categorias.find((c) => c.id === id_categoria);
    if (cat && fecha_inicio && fecha_fin) {
      const f1 = new Date(fecha_inicio);
      const f2 = new Date(fecha_fin);
      const optsDate = { day: "2-digit", month: "2-digit", year: "numeric" };
      const optsTime = { hour: "2-digit", minute: "2-digit" };
      const fechaStr = f1.toLocaleDateString("es-CO", optsDate);
      const hora1 = f1.toLocaleTimeString("es-CO", optsTime);
      const hora2 = f2.toLocaleTimeString("es-CO", optsTime);

      setFormData((f) => ({
        ...f,
        descripcion: `Por medio de la presente, le confirmo que he dispuesto de un espacio con el propósito de reunirnos, ya sea de forma presencial o por medios virtuales, a fin de atender cualquier inquietud o asunto pendiente.</br></br> En cumplimiento de <b>${cat.nombre}</b>, se ha programado una visita y/o reunión, la cual ha quedado agendada para el día <b>${fechaStr}</b>, de <b>${hora1}</b> a <b>${hora2}</b> En caso de no ser posible contar con su atención en la fecha indicada, le agradecemos nos lo comunique por este mismo medio con al menos 3 horas de antelación.`,
      }));
    }
  }, [
    formData.id_categoria,
    formData.fecha_inicio,
    formData.fecha_fin,
    categorias,
    mode,
  ]);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const {
      titulo,
      descripcion,
      ubicacion,
      fecha_inicio,
      fecha_fin,
      id_categoria,
      id_empleado,
      id_ticket,
      empleados,
    } = formData;

    if (
      !titulo ||
      !descripcion ||
      !fecha_inicio ||
      !fecha_fin ||
      !id_categoria ||
      (mode === "multiple" && empleados.length === 0)
    ) {
      return Swal.fire(
        "Error",
        "Todos los campos son obligatorios.",
        "warning"
      );
    }

    Swal.fire({
      title: "Guardando…",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      let data;
      if (mode === "multiple") {
        const payload = {
          eventos: [
            {
              titulo,
              descripcion,
              ubicacion,
              fecha_inicio,
              fecha_fin,
              id_categoria,
              id_ticket,
            },
          ],
          empleados,
        };
        console.log("Payload crearEventos:", payload);

        data = await crearEventos(payload);
      } else {
        const res = await crearEvento(formData);
        console.log("Respuesta crearEvento:", res);
        data = res.data || res;
      }

      console.log("Data recibida:", data);
      if (data.success) {
        Swal.fire(
          "¡Éxito!",
          data.message || "Evento creado correctamente.",
          "success"
        );
        setFormData(initialData);
      } else {
        Swal.fire("Error", data.message || "Error al crear evento.", "error");
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      Swal.fire("Error", "Ocurrió un error al guardar.", "error");
    }
  };

  return {
    categorias,
    funcionarios,
    formData,
    setFormData,
    loading,
    handleSubmit,
  };
}
