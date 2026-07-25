import Swal from "sweetalert2";
import { validarAccesoAdmin } from "../services/eventService";
import { swalBaseOptions } from "./swalUtils";

const ADMIN_AUTH_VERSION = "funcionarios-v1";

export const isAdminSessionActive = () =>
  localStorage.getItem("modo_admin") === "true" &&
  localStorage.getItem("admin_auth_version") === ADMIN_AUTH_VERSION;

export const solicitarAccesoAdmin = async () => {
  if (isAdminSessionActive()) {
    return true;
  }

  const { value: credenciales } = await Swal.fire({
    title: "Ingreso Administrador",
    html: `
      <div class="mb-4">
        <label class="block text-left mb-1 font-semibold text-sm" for="swal-input-user">
          Usuario:
        </label>
        <input
          id="swal-input-user"
          type="text"
          autocomplete="username"
          placeholder="Usuario de otras aplicaciones"
          class="swal2-input w-full m-0"
        >
      </div>
      <div>
        <label class="block text-left mb-1 font-semibold text-sm" for="swal-input-pass">
          Contraseña:
        </label>
        <input
          id="swal-input-pass"
          type="password"
          autocomplete="current-password"
          placeholder="Contraseña"
          class="swal2-input w-full m-0"
        >
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    ...swalBaseOptions,
    preConfirm: () => {
      const usuario = document.getElementById("swal-input-user").value.trim();
      const password = document.getElementById("swal-input-pass").value;

      if (!usuario) {
        Swal.showValidationMessage("Debe ingresar el usuario");
        return false;
      }
      if (!password) {
        Swal.showValidationMessage("Debe ingresar la contraseña");
        return false;
      }

      return { usuario, password };
    },
  });

  if (!credenciales) {
    return false;
  }

  Swal.fire({
    title: "Validando acceso...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    ...swalBaseOptions,
  });

  try {
    const respuesta = await validarAccesoAdmin(
      credenciales.usuario,
      credenciales.password
    );
    Swal.close();

    if (!respuesta.success) {
      await Swal.fire({
        title: "Acceso denegado",
        text: respuesta.message || "Credenciales incorrectas",
        icon: "error",
        ...swalBaseOptions,
      });
      return false;
    }

    localStorage.setItem("modo_admin", "true");
    localStorage.setItem("admin_auth_version", ADMIN_AUTH_VERSION);
    localStorage.setItem(
      "admin_user",
      JSON.stringify({
        id_empleado: respuesta.data.id_empleado,
        nombre: respuesta.data.nombre,
        id_cargo: respuesta.data.id_cargo,
      })
    );
    window.dispatchEvent(new Event("adminModeChanged"));

    await Swal.fire({
      title: "Modo Admin Activado",
      text: `Bienvenido, ${respuesta.data.nombre}`,
      icon: "success",
      ...swalBaseOptions,
    });
    return true;
  } catch (error) {
    console.error("Error al validar el acceso administrativo", error);
    Swal.close();
    await Swal.fire({
      title: "Error",
      text: "No se pudo validar el acceso administrativo",
      icon: "error",
      ...swalBaseOptions,
    });
    return false;
  }
};

export const checkAdminAndExecute = async (callback) => {
  const autorizado = await solicitarAccesoAdmin();
  if (autorizado) {
    callback();
  }
};
