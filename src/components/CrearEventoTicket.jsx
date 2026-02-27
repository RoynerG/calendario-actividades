import { useParams } from "react-router-dom";
import Select from "react-select";
import { useEventoForm } from "../hooks/useEventoForm";
import GuiaCategorias from "./GuiaCategorias";
import GuiaEventosRecurrentes from "./GuiaEventosRecurrentes";
import GuiaRecordatorios from "./GuiaRecordatorios";

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

  if (loading) {
    return (
      <div className="text-center text-xl py-10 text-gray-500">
        Cargando formulario…
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 mx-auto max-w-2xl">
      <div className="flex flex-col sm:flex-row justify-center gap-2">
        <GuiaCategorias buttonStyle={buttonStyle} />
        <GuiaEventosRecurrentes buttonStyle={buttonStyle} />
        <GuiaRecordatorios buttonStyle={buttonStyle} />
      </div>
      <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-900">
            Crear evento desde ticket
          </h1>
          <p className="text-sm text-gray-600">
            Completa la información del evento antes de guardar.
          </p>
        </div>
        <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 rounded px-4 py-2">
          Recuerda marcar como realizados tus eventos anteriores. Los eventos
          sin realizar con más de 2 días te bloquearán para crear nuevos.
        </div>
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
            onChange={(e) =>
              setFormData({ ...formData, titulo: e.target.value })
            }
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

          {/* Fecha única */}
          <label htmlFor="fecha" className={styleLabel}>
            Fecha
          </label>
          <input
            id="fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) =>
              setFormData({ ...formData, fecha: e.target.value })
            }
            className={styleInput}
            required
          />

          {/* Hora de inicio */}
          <label htmlFor="hora_inicio" className={styleLabel}>
            Hora de inicio
          </label>
          <input
            id="hora_inicio"
            type="time"
            value={formData.hora_inicio}
            onChange={(e) =>
              setFormData({ ...formData, hora_inicio: e.target.value })
            }
            className={styleInput}
            required
          />

          {/* Hora de fin */}
          <label htmlFor="hora_fin" className={styleLabel}>
            Hora de finalización
          </label>
          <input
            id="hora_fin"
            type="time"
            value={formData.hora_fin}
            onChange={(e) =>
              setFormData({ ...formData, hora_fin: e.target.value })
            }
            className={styleInput}
            required
          />

          <div className="flex items-center gap-2">
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
            />
            <label
              htmlFor="recordatorio_activo"
              className="text-sm text-gray-700"
            >
              Enviar recordatorio
            </label>
          </div>

          {formData.recordatorio_activo && (
            <>
              <label htmlFor="recordatorio_minutos" className={styleLabel}>
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
                className={styleInput}
                required
              >
                <option value="">Selecciona</option>
                <option value="10">10 minutos antes</option>
                <option value="30">30 minutos antes</option>
                <option value="60">1 hora antes</option>
                <option value="120">2 horas antes</option>
                <option value="1440">1 día antes</option>
              </select>
              <label htmlFor="recordatorio_canal" className={styleLabel}>
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
                className={styleInput}
                required
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Correo</option>
                <option value="ambos">WhatsApp y correo</option>
              </select>
            </>
          )}

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
                {
                  value: "Por publicar",
                  label: "Por publicar",
                },
                {
                  value: "Pendiente colocar aviso",
                  label: "Pendiente colocar aviso",
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
                  {
                    value: "Por publicar",
                    label: "Por publicar",
                  },
                  {
                    value: "Pendiente colocar aviso",
                    label: "Pendiente colocar aviso",
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
    </div>
  );
}
