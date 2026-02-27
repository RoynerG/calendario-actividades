import { useState, useEffect } from "react";
import { FaUserSecret } from "react-icons/fa";
import Swal from "sweetalert2";
import { showVerSeguimientosModal } from "../helpers/seguimientoModals";
import { swalBaseOptions } from "../helpers/swalUtils";

export default function BotonAdminGlobal() {
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem("modo_admin") === "true"
  );

  useEffect(() => {
    const handleAdminChange = () => {
      setIsAdmin(localStorage.getItem("modo_admin") === "true");
    };

    window.addEventListener("adminModeChanged", handleAdminChange);
    // También escuchar cambios en storage (para pestañas diferentes, aunque no es el caso principal)
    window.addEventListener("storage", handleAdminChange);

    return () => {
      window.removeEventListener("adminModeChanged", handleAdminChange);
      window.removeEventListener("storage", handleAdminChange);
    };
  }, []);

  // Función secreta para activar modo admin
  const toggleAdmin = async () => {
    if (isAdmin) {
      localStorage.removeItem("modo_admin");
      localStorage.removeItem("admin_user");
      setIsAdmin(false);
      window.dispatchEvent(new Event("adminModeChanged"));
      Swal.fire({
        title: "Modo Admin Desactivado",
        icon: "info",
        ...swalBaseOptions,
      });
    } else {
      const { value: password } = await Swal.fire({
        title: "Ingrese clave de administrador",
        input: "password",
        inputPlaceholder: "Clave...",
        showCancelButton: true,
        ...swalBaseOptions,
      });

      if (password === "admin123" || password === "skcadmin2025*") {
        // Clave sencilla por ahora
        localStorage.setItem("modo_admin", "true");
        setIsAdmin(true);
        window.dispatchEvent(new Event("adminModeChanged"));
        Swal.fire({
          title: "Modo Admin Activado",
          icon: "success",
          ...swalBaseOptions,
        });
      } else if (password) {
        Swal.fire({
          title: "Clave incorrecta",
          icon: "error",
          ...swalBaseOptions,
        });
      }
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {isAdmin && (
          <button
            onClick={() => showVerSeguimientosModal(null, "global")}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all"
            title="Seguimiento Global"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 384 512"
              height="24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM96 424c-13.3 0-24-10.7-24-24s10.7-24 24-24 24 10.7 24 24-10.7 24-24 24zm0-96c-13.3 0-24-10.7-24-24s10.7-24 24-24 24 10.7 24 24-10.7 24-24 24zm0-96c-13.3 0-24-10.7-24-24s10.7-24 24-24 24 10.7 24 24-10.7 24-24 24zm96-192c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm128 368c0 4.4-3.6 8-8 8H168c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16zm0-96c0 4.4-3.6 8-8 8H168c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16zm0-96c0 4.4-3.6 8-8 8H168c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16z"></path>
            </svg>
          </button>
        )}

        <button
          onClick={toggleAdmin}
          className={`p-3 rounded-full shadow-lg transition-all ${
            isAdmin
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-200 hover:bg-gray-300 text-gray-600"
          }`}
          title={isAdmin ? "Salir de modo admin" : "Activar modo admin"}
        >
          <FaUserSecret size={24} />
        </button>
      </div>
    </>
  );
}
