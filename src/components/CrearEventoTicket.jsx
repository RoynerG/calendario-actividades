import { useParams } from "react-router-dom";
import Select from "react-select";
import { useEventoForm } from "../hooks/useEventoForm";

export default function CrearEventoTicket() {
  const { id_ticket } = useParams();
  const { categorias, formData, setFormData, loading, handleSubmit } =
    useEventoForm("ticket", id_ticket);
  const styleLabel =
    "block mb-3 mt-3 text-sm font-medium text-gray-900 dark:text-white";
  const styleInput =
    "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
  if (loading) {
    return (
      <div className="text-center text-xl py-10 text-gray-500">
        Cargando formulario…
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 mx-auto max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="titulo" className={styleLabel}>
          Titulo
        </label>
        <input
          id="titulo"
          type="text"
          placeholder="Escribe en 3 palabras la actividad a realizar"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          className={styleInput}
          required
        />
        <label htmlFor="ubicacion" className={styleLabel}>
          Ubicacion/direccion del evento
        </label>
        <input
          id="ubicacion"
          type="text"
          placeholder="Escribe donde será realizado el evento"
          value={formData.ubicacion}
          onChange={(e) =>
            setFormData({ ...formData, ubicacion: e.target.value })
          }
          className={styleInput}
          required
        />
        <label htmlFor="f1" className={styleLabel}>
          Fecha de inicio
        </label>
        <input
          id="f1"
          type="datetime-local"
          value={formData.fecha_inicio}
          onChange={(e) =>
            setFormData({ ...formData, fecha_inicio: e.target.value })
          }
          className={styleInput}
          required
        />
        <label htmlFor="f2" className={styleLabel}>
          Fecha de finalizacion
        </label>
        <input
          id="f2"
          type="datetime-local"
          value={formData.fecha_fin}
          onChange={(e) =>
            setFormData({ ...formData, fecha_fin: e.target.value })
          }
          className={styleInput}
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
                  label: categorias.find((c) => c.id === formData.id_categoria)
                    ?.nombre,
                }
              : null
          }
          onChange={(opt) =>
            setFormData({
              ...formData,
              id_categoria: opt?.value || "",
            })
          }
          placeholder="Selecciona una categoría"
          isClearable
          className="w-full"
        />

        <input type="hidden" value={formData.descripcion} required />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Crear evento
        </button>
      </form>
    </div>
  );
}
