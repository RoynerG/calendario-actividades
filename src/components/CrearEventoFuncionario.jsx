import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  listarCategorias,
  crearEvento,
  obtenerTicketsFuncionario,
  verificarBloqueo,
  obtenerFuncionario,
} from "../services/eventService";
import Select from "react-select";
import { useParams } from "react-router-dom";
import { showSwal } from "../helpers/swalUtils";

export default function CrearEventoFuncionario() {
  const { id_funcionario } = useParams();
  const [categorias, setCategorias] = useState([]);
  const [funcionario, setFuncionario] = useState({});
  const [tickets, setTickets] = useState([]);
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
  });
  const [relacionadoConTicket, setRelacionadoConTicket] = useState(null);
  const [ticketSelecionado, setTicketSelecionado] = useState(null);
  const [esCita, setEsCita] = useState(null);
  const inputStyle =
    "border p-2 rounded w-bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

  useEffect(() => {
    listarCategorias().then((res) => {
      if (res.success) setCategorias(res.data);
    });
    obtenerTicketsFuncionario(id_funcionario).then((res) => {
      if (res.success) setTickets(res.data);
    });
  }, [id_funcionario]);

  useEffect(() => {
    const cargarDatos = async () => {
      const resFuncionario = await obtenerFuncionario(id_funcionario);
      if (resFuncionario.success) {
        setFuncionario(resFuncionario.data);
        sessionStorage.setItem("id_funcionario", id_funcionario);

        const resBloqueo = await verificarBloqueo(id_funcionario);
        if (resBloqueo.success && resBloqueo.data.bloqueado) {
          Swal.fire({
            title: "¡Atención!",
            html: `El funcionario ${resFuncionario.data.nombre} tiene <b>${resBloqueo.data.cantidad}</b> evento(s) sin realizar con más de 2 días de antigüedad. No puedes agendar nuevos eventos hasta que se resuelva. Contactate con ese funcionario.`,
            icon: "warning",
            customClass: { container: "z-[100000]" },
          });
        }
      }

      const resCategorias = await listarCategorias();
      if (resCategorias.success) setCategorias(resCategorias.data);

      const resTickets = await obtenerTicketsFuncionario(id_funcionario);
      if (resTickets.success) setTickets(resTickets.data);
    };

    cargarDatos();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    document.activeElement?.blur();

    // Combina fecha y horas a formato ISO local: "YYYY-MM-DDTHH:mm"
    const { fecha, hora_inicio, hora_fin } = formData;
    const fecha_inicio = fecha && hora_inicio ? `${fecha}T${hora_inicio}` : "";
    const fecha_fin = fecha && hora_fin ? `${fecha}T${hora_fin}` : "";

    // Validaciones
    const fechaInicio = new Date(fecha_inicio);
    const fechaFin = new Date(fecha_fin);
    const ahora = new Date();

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      await showSwal({
        title: "Error",
        text: "Debes ingresar fechas y horas válidas.",
        icon: "error",
      });
      return;
    }

    // Solo permite el mismo día (si así lo quieres)
    if (
      fechaInicio.getFullYear() !== fechaFin.getFullYear() ||
      fechaInicio.getMonth() !== fechaFin.getMonth() ||
      fechaInicio.getDate() !== fechaFin.getDate()
    ) {
      await showSwal({
        title: "Error",
        text: "La fecha de inicio y la fecha de finalización deben ser el mismo día.",
        icon: "error",
      });
      return;
    }

    if (fechaFin < fechaInicio) {
      await showSwal({
        title: "Error",
        text: "La hora de finalización no puede ser menor que la de inicio.",
        icon: "error",
      });
      return;
    }

    // No permite fechas pasadas
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
      await showSwal({
        title: "Error",
        text: "No puedes seleccionar una fecha pasada.",
        icon: "error",
      });
      return;
    }
    if (fechaFin < ahora) {
      await showSwal({
        title: "Error",
        text: "No puedes seleccionar una hora de finalización pasada.",
        icon: "error",
      });
      return;
    }

    // Valida horas permitidas
    const horaInicio = fechaInicio.getHours() + fechaInicio.getMinutes() / 60;
    const horaFin = fechaFin.getHours() + fechaFin.getMinutes() / 60;
    if (horaInicio < 8 || horaInicio > 21) {
      await showSwal({
        title: "Error",
        text: "La hora de inicio debe estar entre las 8:00 am y las 9:00 pm.",
        icon: "error",
      });
      return;
    }
    if (horaFin < 8 || horaFin > 21) {
      await showSwal({
        title: "Error",
        text: "La hora de finalización debe estar entre las 8:00 am y las 9:00 pm.",
        icon: "error",
      });
      return;
    }

    // Prepara datos para enviar (solo los campos que tu API necesita)
    const eventoData = {
      ...formData,
      fecha_inicio,
      fecha_fin,
    };

    // Opcional: borra los auxiliares para que no se envíen al backend si no los necesitas
    delete eventoData.fecha;
    delete eventoData.hora_inicio;
    delete eventoData.hora_fin;

    try {
      Swal.fire({
        title: "Guardando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: { container: "z-[100000]" },
      });
      const res = await crearEvento(eventoData);
      if (res.data.success) {
        await Swal.fire({
          title: "¡Éxito!",
          text: "El evento fue agregado correctamente",
          icon: "success",
          customClass: { container: "z-[100000]" },
        });
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
        });
        setRelacionadoConTicket(null);
        setEsCita(null);
        setTicketSelecionado(null);
        setFiltros({ ...filtros });
      } else {
        const mensaje = `El funcionario <b>${funcionario.nombre}</b> tiene eventos sin marcar.`;
        await Swal.fire({
          title: "No se puede crear el evento",
          html: mensaje,
          icon: "warning",
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

  return (
    <div className="p-4 space-y-4 mx-auto max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
          className={inputStyle}
          required
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
          required
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
          required
        />
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
            onChange={(opt) => setRelacionadoConTicket(opt?.value === "si")}
            className="w-full"
            classNamePrefix="react-select"
            placeholder="¿Relacionado con ticket?"
            isClearable
          />
        )}
        {/* Selección del ticket si aplica */}
        {relacionadoConTicket && (
          <Select
            options={tickets.map((t) => {
              const label =
                t.departamento !== "Servicio al cliente"
                  ? `Ticket: #${t._ID} - Contrato: #${t.contrato} - Inmueble: #${t.inmueble}`
                  : `Ticket: #${t._ID} - Solicitante: ${t.solicitante}`;

              return {
                value: t._ID,
                label,
              };
            })}
            value={
              formData.id_ticket
                ? (() => {
                    const t = tickets.find((t) => t._ID === formData.id_ticket);
                    if (!t)
                      return {
                        value: formData.id_ticket,
                        label: formData.id_ticket,
                      };

                    const label =
                      t.departamento !== "Servicio al cliente"
                        ? `Ticket: #${t._ID} - Contrato: #${t.contrato} - Inmueble: #${t.inmueble}`
                        : `Ticket: #${t._ID} - Solicitante: ${t.solicitante}`;

                    return {
                      value: t._ID,
                      label,
                    };
                  })()
                : null
            }
            onChange={(opt) => {
              const id = opt?.value || "";
              setFormData((prev) => ({ ...prev, id_ticket: id }));

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
                const { contrato, inmueble, direccion } = ticketSelecionado;
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
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Crear
          </button>
        </div>
      </form>
    </div>
  );
}
