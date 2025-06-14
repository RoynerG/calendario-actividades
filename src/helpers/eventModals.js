import Swal from "sweetalert2";
import {
  listarCategorias,
  cambiarEstadoEvento,
  actualizarEvento,
  trasladarEvento,
  obtenerHistorialEvento,
} from "../services/eventService";
const styleInput =
  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

export async function showRealizadoModal(event, setFiltros) {
  const { value: obs } = await Swal.fire({
    customClass: { container: "z-[2000]" },
    title: `Resultado del evento #${event.event_id}`,
    html: `
      <label for="obs" class="block mb-3 mt-3 text-sm font-medium text-gray-900 dark:text-white">
        Escribe en este campo el resultado de la actividad
      </label>
      <textarea id="obs" 
        class="${styleInput}"
      ></textarea>
    `,
    focusConfirm: false,
    preConfirm: () => {
      const value = document.getElementById("obs").value;
      if (!value) {
        Swal.showValidationMessage("La observación es requerida");
        return false;
      }
      return value;
    },
    showCancelButton: true,
  });
  if (!obs) return;
  Swal.fire({
    title: "Actualizando estado...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    customClass: { container: "z-[2000]" },
  });
  const resp = await cambiarEstadoEvento(event.event_id, obs);
  Swal.close();
  if (resp.success) {
    await Swal.fire("¡Hecho!", resp.message, "success");
    setFiltros((prev) => ({ ...prev }));
  } else {
    Swal.fire("Error", resp.message, "error");
  }
}

export async function showEditarModal(
  event,
  passedCategorias = [],
  setFiltros
) {
  let cats = passedCategorias;
  if (!cats || cats.length === 0) {
    const resCat = await listarCategorias();
    cats = resCat.success ? resCat.data : [];
  }

  const selectedId =
    event.id_categoria ||
    cats.find((c) => c.nombre === event.categoria)?.id ||
    "";

  const { value: form } = await Swal.fire({
    title: `Editar evento #${event.event_id}`,
    html: `
      <label for="titulo" class="block mb-1 font-medium">Título</label>
      <input
        id="titulo"
        class="${styleInput}"
        value="${event.title || ""}"
        placeholder="Escribe en 3 palabras la actividad"
      />

      <label for="ubicacion" class="block mt-3 mb-1 font-medium">Ubicación</label>
      <input
        id="ubicacion"
        class="${styleInput}"
        value="${event.ubicacion || ""}"
        placeholder="Dirección del evento"
      />

      <label for="descripcion" class="block mt-3 mb-1 font-medium">Descripción</label>
      <textarea
        id="descripcion"
        class="${styleInput}"
        placeholder="Describe la actividad"
      >${event.descripcion || ""}</textarea>

      <label for="categoria" class="block mt-3 mb-1 font-medium">Categoría</label>
      <select id="categoria" class="${styleInput}">
        ${cats
          .map(
            (cat) => `
            <option value="${cat.id}" ${
              String(cat.id) === String(selectedId) ? "selected" : ""
            }>${cat.nombre}</option>`
          )
          .join("")}
      </select>
    `,
    focusConfirm: false,
    preConfirm: () => {
      const titulo = document.getElementById("titulo").value.trim();
      const ubicacion = document.getElementById("ubicacion").value.trim();
      const descripcion = document.getElementById("descripcion").value.trim();
      const id_categoria = document.getElementById("categoria").value;
      if (!titulo || !descripcion || !id_categoria) {
        Swal.showValidationMessage("Todos los campos son obligatorios");
        return false;
      }
      return { titulo, ubicacion, descripcion, id_categoria };
    },
    showCancelButton: true,
    customClass: { container: "z-[2000]" },
  });

  if (!form) return;

  Swal.fire({
    title: "Guardando cambios...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    customClass: { container: "z-[2000]" },
  });

  const resp = await actualizarEvento(
    event.event_id,
    form.titulo,
    form.descripcion,
    form.ubicacion,
    form.id_categoria
  );
  Swal.close();

  if (resp.success) {
    await Swal.fire(
      "¡Editado!",
      "El evento fue editado correctamente",
      "success"
    );
    setFiltros((prev) => ({ ...prev }));
  } else {
    Swal.fire("Error", resp.message || "No se pudo editar", "error");
  }
}

export async function showTrasladarModal(event, setFiltros) {
  const mostrarCita = event.id_ticket > 0;
  const styleInput = "border p-2 rounded w-full mb-2";

  const { value: form } = await Swal.fire({
    title: `Trasladar fecha del evento #${event.event_id}`,
    html: `
      <label for="fecha" class="block mb-2 mt-3 text-sm font-medium text-gray-900 dark:text-white">Nueva fecha</label>
      <input id="fecha" type="date" class="${styleInput}">

      <label for="hora_inicio" class="block mb-2 mt-3 text-sm font-medium text-gray-900 dark:text-white">Hora de inicio</label>
      <input id="hora_inicio" type="time" class="${styleInput}" min="08:00" max="21:00">

      <label for="hora_fin" class="block mb-2 mt-3 text-sm font-medium text-gray-900 dark:text-white">Hora de finalización</label>
      <input id="hora_fin" type="time" class="${styleInput}" min="08:00" max="21:00">

      ${
        mostrarCita
          ? `<label for="es_cita" class="block mb-2 mt-3 text-sm font-medium text-gray-900 dark:text-white">¿Es cita?</label>
             <select id="es_cita" class="${styleInput}">
               <option value="">Responde si el traslado corresponde a una cita</option>
               <option value="si">Sí</option>
               <option value="no">No</option>
             </select>`
          : ``
      }
      <label for="obs" class="block mb-3 mt-3 text-sm font-medium text-gray-900 dark:text-white">Motivo del traslado</label>
      <textarea id="obs" class="${styleInput}"></textarea>
    `,
    focusConfirm: false,
    preConfirm: () => {
      const fecha = document.getElementById("fecha").value;
      const hora_inicio = document.getElementById("hora_inicio").value;
      const hora_fin = document.getElementById("hora_fin").value;
      const observacion = document.getElementById("obs").value;
      const selectEl = document.getElementById("es_cita");
      const es_cita =
        selectEl?.value && selectEl.value !== "" ? selectEl.value : "no";

      // Validación: todos los campos obligatorios
      if (!fecha || !hora_inicio || !hora_fin || !observacion) {
        Swal.showValidationMessage("Todos los campos son obligatorios.");
        return false;
      }

      const fecha_inicio = `${fecha}T${hora_inicio}`;
      const fecha_fin = `${fecha}T${hora_fin}`;
      const fInicio = new Date(fecha_inicio);
      const fFin = new Date(fecha_fin);
      const ahora = new Date();

      // Validación: fechas válidas
      if (isNaN(fInicio.getTime()) || isNaN(fFin.getTime())) {
        Swal.showValidationMessage("Debes ingresar fechas y horas válidas.");
        return false;
      }

      // Validación: ambos días iguales
      if (
        fInicio.getFullYear() !== fFin.getFullYear() ||
        fInicio.getMonth() !== fFin.getMonth() ||
        fInicio.getDate() !== fFin.getDate()
      ) {
        Swal.showValidationMessage(
          "La fecha de inicio y la de finalización deben ser el mismo día."
        );
        return false;
      }

      // Validación: hora fin no menor que inicio
      if (fFin < fInicio) {
        Swal.showValidationMessage(
          "La hora de finalización no puede ser menor que la de inicio."
        );
        return false;
      }

      // Validación: no fechas pasadas
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
        Swal.showValidationMessage("No puedes seleccionar una fecha pasada.");
        return false;
      }
      if (fFin < ahora) {
        Swal.showValidationMessage(
          "No puedes seleccionar una hora de finalización pasada."
        );
        return false;
      }

      // Validación: horas entre 8 y 21
      const horaI = fInicio.getHours() + fInicio.getMinutes() / 60;
      const horaF = fFin.getHours() + fFin.getMinutes() / 60;
      if (horaI < 8 || horaI > 21) {
        Swal.showValidationMessage(
          "La hora de inicio debe estar entre las 8:00 am y las 9:00 pm."
        );
        return false;
      }
      if (horaF < 8 || horaF > 21) {
        Swal.showValidationMessage(
          "La hora de finalización debe estar entre las 8:00 am y las 9:00 pm."
        );
        return false;
      }

      return { fecha_inicio, fecha_fin, es_cita, observacion };
    },
    showCancelButton: true,
    customClass: { container: "z-[2000]" },
  });

  if (!form) return;

  const fechaInicio = new Date(form.fecha_inicio);
  const fechaFin = new Date(form.fecha_fin);
  const opcionesFecha = { day: "2-digit", month: "2-digit", year: "numeric" };
  const opcionesHora = { hour: "2-digit", minute: "2-digit" };
  const fechaStr = fechaInicio.toLocaleDateString("es-CO", opcionesFecha);
  const horaInicioStr = fechaInicio.toLocaleTimeString("es-CO", opcionesHora);
  const horaFinStr = fechaFin.toLocaleTimeString("es-CO", opcionesHora);
  const descripcionGenerada = `Por medio de la presente, se ha reprogramado el evento <b>${event.title}</b> para el día <b>${fechaStr}</b> de <b>${horaInicioStr}</b> a <b>${horaFinStr}</b><br/><br/><br/><b>Motivo:</b> ${form.observacion}`;

  Swal.fire({
    title: "Trasladando evento...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    customClass: { container: "z-[2000]" },
  });

  const resp = await trasladarEvento(
    event.event_id,
    form.fecha_inicio,
    form.fecha_fin,
    form.observacion,
    form.es_cita,
    descripcionGenerada
  );

  Swal.close();
  if (resp.success) {
    await Swal.fire("¡Hecho!", resp.message, "success");
    setFiltros((prev) => ({ ...prev }));
  } else {
    Swal.fire("Error", resp.message, "error");
  }
}

export async function showHistorialModal(event_id, page = 1) {
  const pageSize = 5;
  const {
    success,
    data: historial,
    message,
  } = await obtenerHistorialEvento(event_id);
  if (!success) {
    return Swal.fire("Error", message, "error");
  }

  if (!historial.length) {
    return Swal.fire({
      title: `Historial del evento #${event_id}`,
      html: `<p>Aún no se han registrado cambios para este evento.</p>`,
      icon: "info",
      customClass: { container: "z-[2000]" },
    });
  }
  const totalPages = Math.ceil(historial.length / pageSize);
  const start = (page - 1) * pageSize;
  const slice = historial.slice(start, start + pageSize);
  const rows = slice
    .map((h) => {
      const fecha = new Date(h.fecha).toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return `
      <tr>
        <td style="padding:.5rem;border:1px solid #ddd;">${fecha}</td>
        <td style="padding:.5rem;border:1px solid #ddd;">${h.descripcion}</td>
      </tr>
    `;
    })
    .join("");
  const result = await Swal.fire({
    title: `Historial del evento #${event_id}`,
    html: `
      <table style="width:100%;border-collapse:collapse;margin-top:.5rem;">
        <thead>
          <tr>
            <th style="padding:.5rem;border:1px solid #ddd;background:#f5f5f5;">Fecha</th>
            <th style="padding:.5rem;border:1px solid #ddd;background:#f5f5f5;">Información</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `,
    width: 600,
    showCancelButton: true,
    cancelButtonText: "Cerrar",
    showDenyButton: page > 1,
    denyButtonText: "Anterior",
    showConfirmButton: page < totalPages,
    confirmButtonText: "Siguiente",
    customClass: { container: "z-[2000]" },
  });

  if (result.isDenied) {
    return showHistorialModal(event_id, page - 1);
  }
  if (result.isConfirmed) {
    return showHistorialModal(event_id, page + 1);
  }
}
