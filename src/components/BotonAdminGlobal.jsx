import { useState, useEffect } from "react";
import { FaUserSecret } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { showVerSeguimientosModal } from "../helpers/seguimientoModals";
import { swalBaseOptions } from "../helpers/swalUtils";
import ThemeToggle from "./ThemeToggle";

export default function BotonAdminGlobal() {
  const { pathname } = useLocation();
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem("modo_admin") === "true"
  );
  const isEventFormRoute =
    pathname.startsWith("/crear-evento-ticket/") ||
    pathname === "/crear-evento-multiple" ||
    pathname.startsWith("/crear-evento-funcionario/");

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
      <div
        className={`global-floating-actions ${
          isEventFormRoute ? "global-floating-actions--event-form" : ""
        }`}
      >
        <ThemeToggle className="global-floating-button" />
        {isAdmin && (
          <button
            onClick={() => showVerSeguimientosModal(null, "global")}
            className="global-floating-button bg-blue-600 text-white font-bold hover:bg-blue-700"
            title="Seguimiento Global"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 384 512"
              height="18"
              width="18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.49 0 112v352c0 26.51 21.49 48 48 48h288c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zM96 424c-13.3 0-24-10.7-24-24s10.7-24 24-24 24 10.7 24 24-10.7 24-24 24zm0-96c-13.3 0-24-10.7-24-24s10.7-24 24-24 24 10.7 24 24-10.7 24-24 24zm0-96c-13.3 0-24-10.7-24-24s10.7-24 24-24 24 10.7 24 24-10.7 24-24 24zm96-192c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zm128 368c0 4.4-3.6 8-8 8H168c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16zm0-96c0 4.4-3.6 8-8 8H168c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16zm0-96c0 4.4-3.6 8-8 8H168c-4.4 0-8-3.6-8-8v-16c0-4.4 3.6-8 8-8h144c4.4 0 8 3.6 8 8v16z"></path>
            </svg>
            <span className="global-floating-label text-sm">Seguimiento</span>
          </button>
        )}

        <button
          onClick={toggleAdmin}
          className={`global-floating-button font-bold ${
            isAdmin
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200"
          }`}
          title={isAdmin ? "Salir de modo admin" : "Activar modo admin"}
        >
          <FaUserSecret size={18} />
          <span className="global-floating-label text-sm">
            {isAdmin ? "Salir Admin" : "Admin"}
          </span>
        </button>
      </div>
    </>
  );
}
