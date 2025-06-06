import Select from "react-select";
import { useEventoForm } from "../hooks/useEventoForm";

export default function CrearEventoMultiple() {
  const {
    categorias,
    funcionarios,
    formData,
    setFormData,
    loading,
    handleSubmit,
  } = useEventoForm("multiple");

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
          Título
        </label>
        <input
          id="titulo"
          type="text"
          placeholder="Título"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          className={styleInput}
          required
        />
        <label htmlFor="ubicacion" className={styleLabel}>
          Ubicación/dirección del evento
        </label>
        <input
          id="ubicacion"
          type="text"
          placeholder="Escribe dónde será realizado el evento"
          value={formData.ubicacion}
          onChange={(e) =>
            setFormData({ ...formData, ubicacion: e.target.value })
          }
          className={styleInput}
          required
        />

        {/* FECHA Y HORAS SEPARADOS */}
        <label className={styleLabel}>Fecha</label>
        <input
          type="date"
          value={formData.fecha || ""}
          onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
          className={styleInput}
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className={styleLabel}>Hora inicio</label>
            <input
              type="time"
              value={formData.hora_inicio || ""}
              onChange={(e) =>
                setFormData({ ...formData, hora_inicio: e.target.value })
              }
              className={styleInput}
              required
            />
          </div>
          <div>
            <label className={styleLabel}>Hora fin</label>
            <input
              type="time"
              value={formData.hora_fin || ""}
              onChange={(e) =>
                setFormData({ ...formData, hora_fin: e.target.value })
              }
              className={styleInput}
              required
            />
          </div>
        </div>

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

        <textarea
          placeholder="Descripción del evento"
          value={formData.descripcion}
          onChange={(e) =>
            setFormData({ ...formData, descripcion: e.target.value })
          }
          className={styleInput}
          required
        />
        <Select
          isMulti
          options={funcionarios.map((f) => ({
            value: f.id_empleado,
            label: f.nombre,
          }))}
          value={formData.empleados
            .map((id) => {
              const fn = funcionarios.find((f) => f.id_empleado === id);
              return fn ? { value: id, label: fn.nombre } : null;
            })
            .filter(Boolean)}
          onChange={(opts) =>
            setFormData({
              ...formData,
              empleados: opts.map((o) => o.value),
            })
          }
          placeholder="Selecciona uno o varios funcionarios"
          className="w-full"
        />

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Crear evento
        </button>
      </form>
    </div>
  );
}
