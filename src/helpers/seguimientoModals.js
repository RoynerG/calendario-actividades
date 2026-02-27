import Swal from "sweetalert2";
import {
  crearSeguimiento,
  listarSeguimientosEvento,
  listarSeguimientosGlobales,
  listarSeguimientosFuncionario,
} from "../services/eventService";
import { checkAdminAndExecute } from "./auth";
import { swalBaseOptions } from "./swalUtils";

/**
 * Muestra un modal (SweetAlert2) con la lista de seguimientos.
 * @param {string|number} idEvento - ID del evento (puede ser null si es global/funcionario)
 * @param {string} tipo - 'evento', 'global', 'funcionario'
 * @param {string|number} idFuncionario - ID del funcionario (para filtrar si es tipo funcionario)
 */
export async function showVerSeguimientosModal(
  idEvento = null,
  tipo = "evento",
  idFuncionario = null
) {
  // Mostrar loading
  Swal.fire({
    title: "Cargando seguimientos...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    ...swalBaseOptions,
  });

  try {
    let seguimientos = [];
    let res;

    if (tipo === "evento" && idEvento) {
      res = await listarSeguimientosEvento(idEvento);
    } else if (tipo === "funcionario" && idFuncionario) {
      res = await listarSeguimientosFuncionario(idFuncionario);
    } else {
      // Para global usamos listarSeguimientosGlobales
      res = await listarSeguimientosGlobales();
    }

    if (res && res.success) {
      seguimientos = res.data;
    }

    Swal.close();

    // Construir HTML de la lista
    let htmlContent = "";
    if (seguimientos.length === 0) {
      htmlContent = `
        <div class="text-center py-4 text-gray-500">
          <p>No hay seguimientos registrados aún.</p>
        </div>
      `;
    } else {
      htmlContent = `
        <div class="text-left max-h-[60vh] overflow-y-auto space-y-3 p-2">
          ${seguimientos
            .map(
              (item) => `
            <div class="bg-gray-50 p-3 rounded border-l-4 border-blue-500 shadow-sm">
              <div class="flex justify-between items-start mb-1">
                <span class="font-bold text-blue-700 text-sm">
                  ${item.usuario || "Usuario"}
                </span>
                <span class="text-xs text-gray-500">
                  ${new Date(item.fecha).toLocaleString()}
                </span>
              </div>
              ${
                item.evento_titulo
                  ? `<div class="mb-1 text-xs font-semibold text-gray-600 bg-gray-200 px-2 py-1 rounded inline-block">
                      Evento: ${item.evento_titulo}
                     </div>`
                  : ""
              }
              <p class="text-gray-700 text-sm whitespace-pre-wrap">${
                item.detalle
              }</p>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    const title =
      tipo === "global"
        ? "Seguimiento Global"
        : tipo === "funcionario"
        ? "Seguimiento al Funcionario"
        : `Seguimiento del Evento #${idEvento}`;

    const result = await Swal.fire({
      title: title,
      html: htmlContent,
      showCloseButton: true,
      showConfirmButton: false, // Solo ver, botón de cierre arriba
      showDenyButton: true,
      denyButtonText: "+ Nuevo Seguimiento",
      width: "600px",
      ...swalBaseOptions,
    });

    if (result.isDenied) {
      checkAdminAndExecute(() => {
        showCrearSeguimientoModal(idEvento, tipo, "Admin", idFuncionario);
      });
    }
  } catch (error) {
    console.error("Error cargando seguimientos", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar los seguimientos",
      ...swalBaseOptions,
    });
  }
}

/**
 * Muestra un modal (SweetAlert2) para crear un nuevo seguimiento.
 * @param {string|number} idEvento - ID del evento
 * @param {string} tipo - 'evento', 'global', 'funcionario'
 * @param {string} usuario - Nombre del usuario actual (ej. 'Admin')
 * @param {string|number} idFuncionario - ID del funcionario
 * @param {function} onSuccess - Callback opcional al guardar exitosamente
 */
export async function showCrearSeguimientoModal(
  idEvento = null,
  tipo = "evento",
  usuario = "Admin",
  idFuncionario = null,
  onSuccess = null
) {
  // Obtener usuario admin real de la sesión
  const adminUserStr = localStorage.getItem("admin_user");
  let nombreUsuario = usuario;
  let idAutor = null;

  if (adminUserStr) {
    try {
      const adminUser = JSON.parse(adminUserStr);
      if (adminUser && adminUser.nombre) {
        nombreUsuario = adminUser.nombre;
        idAutor = adminUser.id_empleado;
      }
    } catch (e) {
      console.error("Error parsing admin_user", e);
    }
  }

  const { value: comentario } = await Swal.fire({
    title: "Nuevo Seguimiento",
    html: `
      <p class="mb-2 text-sm text-gray-600">Registrando como: <strong>${nombreUsuario}</strong></p>
      <textarea id="swal-input-detalle" class="swal2-textarea" placeholder="Escribe aquí..." aria-label="Escribe tu comentario aquí"></textarea>
    `,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
    showLoaderOnConfirm: true,
    ...swalBaseOptions,
    preConfirm: async () => {
      const texto = document.getElementById("swal-input-detalle").value;
      if (!texto || !texto.trim()) {
        Swal.showValidationMessage("El comentario no puede estar vacío");
        return false;
      }

      try {
        const res = await crearSeguimiento(
          texto,
          nombreUsuario,
          idEvento,
          tipo,
          idFuncionario,
          idAutor
        );
        if (!res.success) {
          throw new Error(res.message || "Error al guardar");
        }
        return res;
      } catch (error) {
        Swal.showValidationMessage(`Falló la solicitud: ${error}`);
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  });

  if (comentario) {
    await Swal.fire({
      title: "¡Guardado!",
      text: "El seguimiento ha sido registrado.",
      icon: "success",
      ...swalBaseOptions,
    });
    // Recargar vista si es necesario
    if (onSuccess) onSuccess();
  }
}
