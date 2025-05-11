import { useParams } from "react-router-dom";
import Select from "react-select";
import { useEventoForm } from "../hooks/useEventoForm";

export default function CrearEventoTicket() {
  const { id_ticket } = useParams();
  const { categorias, formData, setFormData, loading, handleSubmit } =
    useEventoForm("ticket", id_ticket);

  if (loading) {
    return (
      <div className="text-center text-xl py-10 text-gray-500">
        Cargando formulario…
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 mx-auto max-w-lg">
      <h1 className="text-sm font-bold text-center">
        Crear evento desde ticket #{id_ticket}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          Crear
        </button>
      </form>
    </div>
  );
}
