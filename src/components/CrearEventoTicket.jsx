import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  listarCategorias,
  obtenerTicket,
  crearEvento,
} from "../services/eventService";
import { useParams } from "react-router-dom";
import Select from "react-select";

export default function CrearEventoTicket() {
  const { id_ticket } = useParams();
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    id_categoria: "",
    id_empleado: "",
    id_ticket: id_ticket,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listarCategorias().then((res) => {
      if (res.success) setCategorias(res.data);
    });

    obtenerTicket(id_ticket)
      .then((res) => {
        console.log(res);
        if (res.success) {
          setFormData((prev) => ({
            ...prev,
            id_empleado: res.data.id_empleado,
          }));
        }
      })
      .finally(() => setLoading(false));
  }, [id_ticket]);

  useEffect(() => {
    const categoriaSeleccionada = categorias.find(
      (cat) => cat.id === formData.id_categoria
    );

    if (categoriaSeleccionada && formData.fecha_inicio && formData.fecha_fin) {
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

      const descripcionGenerada = `Por medio de la presente, le confirmo que he dispuesto de un espacio con el propósito de reunirnos, ya sea de forma presencial o por medios virtuales, a fin de atender cualquier inquietud o asunto pendiente.</br></br> En cumplimiento de <b>${categoriaSeleccionada.nombre}</b>, se ha programado una visita y/o reunión, la cual ha quedado agendada para el día <b>${fechaStr}</b>, de <b>${horaInicioStr}</b> a <b>${horaFinStr}</b> En caso de no ser posible contar con su atención en la fecha indicada, le agradecemos nos lo comunique por este mismo medio con al menos 3 horas de antelación.`;

      setFormData((prev) => ({
        ...prev,
        descripcion: descripcionGenerada,
      }));
    }
  }, [
    formData.id_categoria,
    formData.fecha_inicio,
    formData.fecha_fin,
    categorias,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    document.activeElement?.blur();

    try {
      Swal.fire({
        title: "Guardando...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
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
        setFormData((prev) => ({
          ...prev,
          titulo: "",
          descripcion: "",
          fecha_inicio: "",
          fecha_fin: "",
          id_categoria: "",
        }));
        window.parent.location.reload();
      } else {
        await Swal.fire({
          title: "Error",
          text: "No se pudo agregar el evento",
          icon: "error",
          customClass: { container: "z-[100000]" },
        });
      }
    } catch (error) {
      console.error(error);
      await Swal.fire({
        title: "Error",
        text: "Ocurrió un error al agregar el evento",
        icon: "error",
        customClass: { container: "z-[100000]" },
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center text-xl py-10 text-gray-500">
        Cargando formulario...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4  mx-auto">
      <h1 className="text-sm font-bold text-center">
        Crear evento desde ticket #{id_ticket}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 w-100 m-auto">
        <input
          type="text"
          placeholder="Título"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
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
          onChange={(selectedOption) =>
            setFormData({
              ...formData,
              id_categoria: selectedOption ? selectedOption.value : "",
            })
          }
          className="w-full"
          classNamePrefix="react-select"
          placeholder="Selecciona una categoría"
          isClearable
        />

        <input
          type="hidden"
          value={formData.descripcion}
          onChange={(e) =>
            setFormData({ ...formData, descripcion: e.target.value })
          }
          className="border p-2 rounded w-full"
          required
        />

        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            className="text-white px-4 py-2 rounded w-full"
            style={{ backgroundColor: "black" }}
          >
            Crear
          </button>
        </div>
      </form>
    </div>
  );
}
