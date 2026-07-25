import Swal from "sweetalert2";
import {
  listarCategorias,
  cambiarEstadoEvento,
  prepararReporteComercial,
  buscarInmueblesReporte,
  actualizarEvento,
  trasladarEvento,
} from "../services/eventService";
import { swalBaseOptions } from "./swalUtils";
const styleInput =
  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function propertyLabel(property) {
  return [
    property.codigo ? `#${property.codigo}` : "",
    property.titulo,
    property.direccion,
  ]
    .filter(Boolean)
    .join(" · ");
}

export async function showRealizadoModal(event, setFiltros) {
  // Intentar cerrar el visor del scheduler antes de abrir el modal
  try {
    // Simular clic en el body para cerrar popovers
    document.body.click();
    
    // Intentar encontrar botón de cierre específico (MUI o clase común)
    const closeBtn = document.querySelector('button[aria-label="Close"]');
    if (closeBtn) closeBtn.click();
  } catch (e) {
    console.error("No se pudo cerrar el visor del evento", e);
  }

  const eventId = event.event_id ?? event.id;
  let preparacion;
  try {
    const respuesta = await prepararReporteComercial(eventId);
    if (!respuesta.success) {
      throw new Error(respuesta.message || "No fue posible preparar el reporte");
    }
    preparacion = respuesta.data;
  } catch (error) {
    await Swal.fire({
      title: "Error",
      text:
        error.response?.data?.message ||
        error.message ||
        "No fue posible consultar el evento.",
      icon: "error",
      ...swalBaseOptions,
    });
    return false;
  }

  let resultado;
  if (!preparacion.habilitado) {
    const { value: observacion } = await Swal.fire({
      ...swalBaseOptions,
      title: `Resultado del evento #${eventId}`,
      html: `
        <label for="obs" class="block mb-3 mt-3 text-sm font-medium text-gray-900 dark:text-white">
          Escribe en este campo el resultado de la actividad
        </label>
        <textarea id="obs" class="${styleInput}">Realizado</textarea>
      `,
      focusConfirm: false,
      preConfirm: () => {
        const value = document.getElementById("obs").value.trim();
        if (!value) {
          Swal.showValidationMessage("La observación es requerida");
          return false;
        }
        return value;
      },
      showCancelButton: true,
    });
    if (!observacion) return false;
    resultado = { observacion, reporte: null };
  } else {
    const propiedades = new Map(
      (preparacion.inmuebles || []).map((property) => [
        String(property.id),
        property,
      ])
    );

    const renderOptions = (selected = "") =>
      [
        `<option value="">Seleccione un inmueble</option>`,
        ...Array.from(propiedades.values()).map(
          (property) =>
            `<option value="${escapeHtml(property.id)}" ${
              String(property.id) === String(selected) ? "selected" : ""
            }>${escapeHtml(propertyLabel(property))}</option>`
        ),
      ].join("");

    const { value: formulario } = await Swal.fire({
      ...swalBaseOptions,
      width: "720px",
      title: `Finalizar evento #${eventId}`,
      html: `
        <div class="text-left">
          <p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Este evento requiere un reporte comercial. Si cancelas, permanecerá pendiente.
          </p>
          ${
            preparacion.ticket
              ? `<div class="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                  <b>Ticket #${escapeHtml(preparacion.ticket.id)}</b>
                  ${preparacion.ticket.indicativo ? ` · ${escapeHtml(preparacion.ticket.indicativo)}` : ""}
                  ${preparacion.ticket.solicitante ? `<br>${escapeHtml(preparacion.ticket.solicitante)}` : ""}
                </div>`
              : ""
          }

          <label for="tipo-reporte" class="block mb-1 text-sm font-medium">Tipo de reporte</label>
          <select id="tipo-reporte" class="${styleInput}">
            ${preparacion.tipos_permitidos
              .map(
                (tipo) =>
                  `<option value="${escapeHtml(tipo)}" ${
                    tipo === preparacion.tipo_predeterminado ? "selected" : ""
                  }>${escapeHtml(tipo)}</option>`
              )
              .join("")}
          </select>

          <div id="grupo-inmueble" class="mt-3">
            <label for="buscar-inmueble" class="block mb-1 text-sm font-medium">
              Inmueble
            </label>
            <input id="buscar-inmueble" class="${styleInput}"
              placeholder="Buscar por código, título o dirección">
            <p id="estado-busqueda" class="mt-1 mb-2 text-xs text-gray-500">
              Se muestran primero los inmuebles relacionados con la cotización.
            </p>
            <select id="inmueble-reporte" class="${styleInput}">
              ${renderOptions()}
            </select>
          </div>

          <label for="valor-reporte" class="block mt-3 mb-1 text-sm font-medium">
            Valor (máximo $${Number(preparacion.valor_maximo).toLocaleString(
              "es-CO"
            )})
          </label>
          <input id="valor-reporte" type="number" min="0"
            max="${Number(preparacion.valor_maximo)}" step="1" value="0"
            class="${styleInput}">
          <p class="mt-1 text-xs text-gray-500">
            Calculado con valor_transporte: $${Number(
              preparacion.valor_transporte
            ).toLocaleString("es-CO")}.
          </p>

          <label for="obs" class="block mt-3 mb-1 text-sm font-medium">
            Resultado de la actividad
          </label>
          <textarea id="obs" class="${styleInput}">Realizado</textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Guardar reporte y finalizar",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      didOpen: () => {
        const typeSelect = document.getElementById("tipo-reporte");
        const propertyGroup = document.getElementById("grupo-inmueble");
        const searchInput = document.getElementById("buscar-inmueble");
        const propertySelect = document.getElementById("inmueble-reporte");
        const searchStatus = document.getElementById("estado-busqueda");
        let timer;
        let searchSequence = 0;

        const updatePropertyVisibility = () => {
          const required =
            preparacion.inmueble_obligatorio ||
            typeSelect.value === "Visita";
          propertyGroup.style.display = required ? "block" : "none";
        };
        typeSelect.addEventListener("change", updatePropertyVisibility);
        updatePropertyVisibility();

        searchInput.addEventListener("input", () => {
          window.clearTimeout(timer);
          const term = searchInput.value.trim();
          if (term.length < 2) {
            searchStatus.textContent =
              "Escribe al menos 2 caracteres para buscar.";
            return;
          }

          const currentSequence = ++searchSequence;
          searchStatus.textContent = "Buscando inmuebles...";
          timer = window.setTimeout(async () => {
            try {
              const response = await buscarInmueblesReporte(eventId, term);
              if (currentSequence !== searchSequence) return;
              if (!response.success) {
                throw new Error(response.message);
              }
              (response.data || []).forEach((property) => {
                propiedades.set(String(property.id), property);
              });
              const selected = propertySelect.value;
              propertySelect.innerHTML = renderOptions(selected);
              searchStatus.textContent = `${response.data.length} resultado(s) encontrados.`;
            } catch (error) {
              if (currentSequence !== searchSequence) return;
              searchStatus.textContent =
                error.response?.data?.message ||
                error.message ||
                "No fue posible buscar inmuebles.";
            }
          }, 350);
        });
      },
      preConfirm: () => {
        const tipo = document.getElementById("tipo-reporte").value;
        const observacion = document.getElementById("obs").value.trim();
        const valorRaw = document.getElementById("valor-reporte").value;
        const valor = Number(valorRaw);
        const idInmueble =
          document.getElementById("inmueble-reporte").value;
        const inmueble = propiedades.get(String(idInmueble));
        const requiresProperty =
          preparacion.inmueble_obligatorio || tipo === "Visita";

        if (!observacion) {
          Swal.showValidationMessage("La observación es requerida.");
          return false;
        }
        if (!preparacion.tipos_permitidos.includes(tipo)) {
          Swal.showValidationMessage("El tipo de reporte no es válido.");
          return false;
        }
        if (
          valorRaw === "" ||
          !Number.isInteger(valor) ||
          valor < 0 ||
          valor > Number(preparacion.valor_maximo)
        ) {
          Swal.showValidationMessage(
            `El valor debe estar entre 0 y ${preparacion.valor_maximo}.`
          );
          return false;
        }
        if (requiresProperty && !inmueble) {
          Swal.showValidationMessage("Debes seleccionar un inmueble.");
          return false;
        }

        return {
          observacion,
          reporte: {
            tipo_reporte: tipo,
            valor,
            id_inmueble: inmueble?.id || "",
            id_cotizacion: inmueble?.id_cotizacion || "",
          },
        };
      },
    });
    if (!formulario) return false;
    resultado = formulario;
  }

  Swal.fire({
    title: "Actualizando estado...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    ...swalBaseOptions,
  });
  try {
    const resp = await cambiarEstadoEvento(
      eventId,
      resultado.observacion,
      resultado.reporte
    );
    Swal.close();
    if (resp.success) {
      await Swal.fire({
        title: "¡Hecho!",
        text: resp.message,
        icon: "success",
        ...swalBaseOptions,
      });
      if (typeof setFiltros === "function") {
        setFiltros((prev) => ({ ...prev }));
      }
      return true;
    }
    await Swal.fire({
      title: "Error",
      text: resp.message,
      icon: "error",
      ...swalBaseOptions,
    });
  } catch (error) {
    Swal.close();
    await Swal.fire({
      title: "Error",
      text:
        error.response?.data?.message ||
        "No fue posible finalizar el evento.",
      icon: "error",
      ...swalBaseOptions,
    });
  }
  return false;
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
    ...swalBaseOptions,
  });

  if (!form) return;

  Swal.fire({
    title: "Guardando cambios...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    ...swalBaseOptions,
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
    await Swal.fire({
      title: "¡Editado!",
      text: "El evento fue editado correctamente",
      icon: "success",
      ...swalBaseOptions,
    });
    setFiltros((prev) => ({ ...prev }));
  } else {
    Swal.fire({
      title: "Error",
      text: resp.message || "No se pudo editar",
      icon: "error",
      ...swalBaseOptions,
    });
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
    ...swalBaseOptions,
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
    ...swalBaseOptions,
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
    await Swal.fire({
      title: "¡Hecho!",
      text: resp.message,
      icon: "success",
      ...swalBaseOptions,
    });
    setFiltros((prev) => ({ ...prev }));
  } else {
    Swal.fire({
      title: "Error",
      text: resp.message,
      icon: "error",
      ...swalBaseOptions,
    });
  }
}
