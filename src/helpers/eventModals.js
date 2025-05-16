import Swal from "sweetalert2";
import {
  cambiarEstadoEvento,
  actualizarEvento,
  trasladarEvento,
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

export async function showEditarModal(event, categorias, setFiltros) {
  const { value: form } = await Swal.fire({
    title: `Editar evento #${event.event_id}`,
    html: `
      <label for="titulo" class="block mb-3 mt-3 text-sm font-medium text-gray-900 dark:text-white">Título</label>
      <input id="titulo" class="${styleInput}" value="${
      event.title || ""
    }" placeholder="Escribe en 3 palabras la actividad a realizar">
          <label for="ubicacion" class="block mb-3 mt-3 text-sm font-medium text-gray-900 dark:text-white">Ubicacion</label>
      <input id="ubicacion" class="${styleInput}" value="${
      event.ubicacion || ""
    }" placeholder="Escribe donde será realizado el evento">
      <label for="descripcion" class="block mb-3 mt-3 text-sm font-medium text-gray-900 dark:text-white">Descripción</label>
      <textarea id="descripcion" class="${styleInput}" placeholder="Describe detalladamente que se va a realizar en esta actividad">${
      event.descripcion || ""
    }</textarea>
      <label for="categoria" class="block mb-3 mt-3 text-sm font-medium text-gray-900 dark:text-white">Categoría</label>
      <select id="categoria" class="${styleInput}">
        ${categorias
          .map(
            (cat) =>
              `<option value="${cat.id}" ${
                event.id_categoria === cat.id || event.categoria === cat.nombre
                  ? "selected"
                  : ""
              }>${cat.nombre}</option>`
          )
          .join("")}
      </select>
    `,
    focusConfirm: false,
    preConfirm: () => {
      const titulo = document.getElementById("titulo").value;
      const descripcion = document.getElementById("descripcion").value;
      const ubicacion = document.getElementById("ubicacion").value;
      const id_categoria = document.getElementById("categoria").value;
      if (!titulo || !descripcion || !id_categoria) {
        Swal.showValidationMessage("Todos los campos son obligatorios");
        return false;
      }
      return { titulo, descripcion, ubicacion, id_categoria };
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
  const { value: form } = await Swal.fire({
    title: `Trasladar fecha del evento #${event.event_id}`,
    html: `
      <label for="f1" class="block mb-3 mt-3 text-sm font-medium text-gray-900 dark:text-white">Nueva fecha inicio</label>
      <input id="f1" type="datetime-local" class="${styleInput}">
      <label for="f2" class="block mb-3 mt-3 text-sm font-medium text-gray-900 dark:text-white">Nueva fecha fin</label>
      <input id="f2" type="datetime-local" class="${styleInput}">
      <label for="obs" class="block mb-3 mt-3 text-sm font-medium text-gray-900 dark:text-white">Ingresa el motivo por el cual trasladas el evento</label>
      <textarea id="obs" class="${styleInput}"></textarea>
    `,
    focusConfirm: false,
    preConfirm: () => {
      const fecha_inicio = document.getElementById("f1").value;
      const fecha_fin = document.getElementById("f2").value;
      const observacion = document.getElementById("obs").value;
      if (!fecha_inicio || !fecha_fin || !observacion) {
        Swal.showValidationMessage("Todos los campos son obligatorios");
        return false;
      }
      return { fecha_inicio, fecha_fin, observacion };
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
  const descripcionGenerada = `Por medio de la presente, se ha reprogramado el evento <b>${event.title}</b> para el día <b>${fechaStr}</b> de <b>${horaInicioStr}</b> a <b>${horaFinStr}</b>.<br/><br/><b>Motivo:</b> ${form.observacion}`;
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
