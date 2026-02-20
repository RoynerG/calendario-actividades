import Swal from "sweetalert2";
import { listarFuncionariosAdmin } from "../services/eventService";

export const checkAdminAndExecute = async (callback) => {
  const isAdmin = localStorage.getItem("modo_admin") === "true";

  if (isAdmin) {
    callback();
  } else {
    // 1. Obtener lista de funcionarios admin
    let funcionariosAdmin = [];
    try {
      const res = await listarFuncionariosAdmin();
      if (res.success) {
        funcionariosAdmin = res.data;
      }
    } catch (error) {
      console.error("Error al cargar funcionarios admin", error);
    }

    // 2. Construir opciones del select
    const options = funcionariosAdmin
      .map(
        (f) =>
          `<option value="${f.id_empleado}" data-nombre="${f.nombre}">${f.nombre}</option>`
      )
      .join("");

    // 3. Mostrar Swal con Select + Password
    const { value: formValues } = await Swal.fire({
      title: "Ingreso Administrador",
      html: `
        <div class="mb-4">
          <label class="block text-left mb-1 font-semibold text-sm">Seleccione su usuario:</label>
          <select id="swal-input-user" class="swal2-input w-full m-0 text-sm">
            <option value="" disabled selected>-- Seleccionar --</option>
            ${options}
          </select>
        </div>
        <div>
          <label class="block text-left mb-1 font-semibold text-sm">Contraseña:</label>
          <input id="swal-input-pass" type="password" placeholder="Clave..." class="swal2-input w-full m-0">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      customClass: { container: "z-[10000]" },
      preConfirm: () => {
        const userSelect = document.getElementById("swal-input-user");
        const password = document.getElementById("swal-input-pass").value;
        const selectedOption = userSelect.options[userSelect.selectedIndex];

        if (!userSelect.value) {
          Swal.showValidationMessage("Debe seleccionar un usuario");
          return false;
        }
        if (!password) {
          Swal.showValidationMessage("Debe ingresar la contraseña");
          return false;
        }

        return {
          id_empleado: userSelect.value,
          nombre: selectedOption.getAttribute("data-nombre"),
          password: password,
        };
      },
    });

    if (formValues) {
      if (formValues.password === "skcadmin2025*") {
        localStorage.setItem("modo_admin", "true");
        // Guardar usuario seleccionado como admin actual
        localStorage.setItem(
          "admin_user",
          JSON.stringify({
            id_empleado: formValues.id_empleado,
            nombre: formValues.nombre,
          })
        );

        await Swal.fire({
          title: "Modo Admin Activado",
          text: `Bienvenido, ${formValues.nombre}`,
          icon: "success",
          customClass: { container: "z-[10000]" },
        });
        callback();
      } else {
        Swal.fire({
          title: "Clave incorrecta",
          icon: "error",
          customClass: { container: "z-[10000]" },
        });
      }
    }
  }
};
