import { useParams } from "react-router-dom";
import Select from "react-select";
import { useEventoForm } from "../hooks/useEventoForm";

export default function CrearEventoTicket() {
  const { id_ticket } = useParams();
  const {
    categorias,
    ticketData,
    formData,
    setFormData,
    loading,
    handleSubmit,
  } = useEventoForm("ticket", id_ticket);

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
        {/* Título */}
        <label htmlFor="titulo" className={styleLabel}>
          Título
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

        {/* Ubicación */}
        <label htmlFor="ubicacion" className={styleLabel}>
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
          className={styleInput}
          required
        />

        {/* Fecha inicio */}
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

        {/* Fecha fin */}
        <label htmlFor="f2" className={styleLabel}>
          Fecha de finalización
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

        {/* Categorías */}
        <Select
          options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
          value={
            categorias
              .map((c) => ({ value: c.id, label: c.nombre }))
              .find((o) => o.value === formData.id_categoria) || null
          }
          onChange={(opt) =>
            setFormData({ ...formData, id_categoria: opt?.value || "" })
          }
          placeholder="Selecciona categoría"
          isClearable
          className="w-full"
          classNamePrefix="react-select"
        />

        {/* ¿Es cita? */}
        {formData.id_ticket && (
          <Select
            options={[
              { value: "si", label: "Sí, es una cita" },
              { value: "no", label: "No, no es una cita" },
            ]}
            value={
              [
                { value: "si", label: "Sí, es una cita" },
                { value: "no", label: "No, no es una cita" },
              ].find((o) => o.value === formData.es_cita) || null
            }
            onChange={(opt) =>
              setFormData((prev) => ({ ...prev, es_cita: opt?.value || "" }))
            }
            placeholder="¿Es una cita?"
            isClearable
            className="w-full"
            classNamePrefix="react-select"
          />
        )}

        {/* Descripción cuando NO es cita */}
        {formData.es_cita === "no" && (
          <textarea
            rows={4}
            placeholder="Describe detalladamente qué se va a realizar en esta actividad"
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            className={styleInput}
            required
          />
        )}

        {/* Estado comercial */}
        {/* Estado comercial */}
        {ticketData?.departamento === "Servicio al cliente" && (
          <Select
            options={[
              { value: "Contactado", label: "Contactado" },
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
            ]}
            value={
              [
                { value: "Contactado", label: "Contactado" },
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
              ].find((o) => o.value === formData.estado_comercial) || null
            }
            onChange={(opt) => {
              const estadoComercial = opt?.value ?? "";
              setFormData((prev) => {
                const solicitante = ticketData.solicitante;
                const baseTitle = prev.titulo.split(" - ")[0];

                return {
                  ...prev,
                  estado_comercial: estadoComercial,
                  titulo: `${baseTitle} - ${solicitante}`,
                };
              });
            }}
            placeholder="Selecciona estado comercial"
            isClearable
            className="w-full"
            classNamePrefix="react-select"
          />
        )}

        {/* Estado administrativo */}
        {/* Estado administrativo */}
        {ticketData?.departamento &&
          ticketData.departamento !== "Servicio al cliente" && (
            <Select
              options={[
                { value: "Por inspecccionar", label: "Por inspecccionar" },
                { value: "Inspeccionado", label: "Inspeccionado" },
                { value: "Cotizado", label: "Cotizado" },
                { value: "En ejecucion", label: "En ejecucion" },
              ]}
              value={
                [
                  { value: "Por inspecccionar", label: "Por inspecccionar" },
                  { value: "Inspeccionado", label: "Inspeccionado" },
                  { value: "Cotizado", label: "Cotizado" },
                  { value: "En ejecucion", label: "En ejecucion" },
                ].find((o) => o.value === formData.estado_administrativo) ||
                null
              }
              onChange={(opt) => {
                const estadoAdministrativo = opt?.value || "";
                const { contrato, inmueble, direccion } = ticketData;
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
              placeholder="Selecciona estado administrativo"
              isClearable
              className="w-full"
              classNamePrefix="react-select"
            />
          )}

        {/* Submit */}
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
