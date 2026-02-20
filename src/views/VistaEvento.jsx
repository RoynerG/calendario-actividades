import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerEvento } from "../services/eventService";
import Swal from "sweetalert2";
import {
  FaClock,
  FaTag,
  FaPowerOff,
  FaMapLocationDot,
  FaClipboardList,
  FaEye,
} from "react-icons/fa6";
import { FaCalendarAlt, FaHistory } from "react-icons/fa";
import {
  showVerSeguimientosModal,
  showCrearSeguimientoModal,
} from "../helpers/seguimientoModals";
import { showHistorialModal } from "../helpers/eventModals";

export default function VistaEvento() {
  const { id_evento } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAdminAndExecute = async (callback) => {
    const isAdmin = localStorage.getItem("modo_admin") === "true";
    if (isAdmin) {
      callback();
    } else {
      const { value: password } = await Swal.fire({
        title: "Ingrese clave de administrador",
        input: "password",
        inputPlaceholder: "Clave...",
        showCancelButton: true,
      });

      if (password === "admin123") {
        localStorage.setItem("modo_admin", "true");
        await Swal.fire("Modo Admin Activado", "", "success");
        callback();
      } else if (password) {
        Swal.fire("Clave incorrecta", "", "error");
      }
    }
  };

  const handleVerSeguimiento = () => {
    showVerSeguimientosModal(id_evento, "evento");
  };

  const handleHacerSeguimiento = () => {
    checkAdminAndExecute(() => {
      showCrearSeguimientoModal(id_evento, "evento", "Admin");
    });
  };

  useEffect(() => {
    obtenerEvento(id_evento)
      .then((evt) => setEvento(evt))
      .catch((err) => {
        console.error(err);
        Swal.fire("Error", err.message, "error");
        navigate(-1);
      })
      .finally(() => setLoading(false));
  }, [id_evento, navigate]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500 text-xl">
        Cargando evento...
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="text-center py-10 text-red-500 text-xl">
        Evento no encontrado.
      </div>
    );
  }

  const fechaInicio = new Date(evento.fecha_inicio);
  const fechaFin = new Date(evento.fecha_fin);

  const opcionesFecha = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const opcionesHora = { hour: "2-digit", minute: "2-digit" };

  const fechaStr = fechaInicio.toLocaleDateString("es-CO", opcionesFecha);
  const horaInicioStr = fechaInicio.toLocaleTimeString("es-CO", opcionesHora);
  const horaFinStr = fechaFin.toLocaleTimeString("es-CO", opcionesHora);

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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-center gap-2 mb-6">
        <a
          href={`https://sucasainmobiliaria.com.co/mi-cuenta/menu-calendario/`}
          style={buttonStyle}
          className="flex-1 sm:flex-none text-center"
        >
          Regresar a mi cuenta
        </a>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 max-w-md mx-auto border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
          {evento.titulo}
        </h2>

        {evento.ubicacion && (
          <div className="mb-4 flex items-center">
            <FaMapLocationDot className="mr-2 text-green-900" />
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full">
              {evento.ubicacion}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <span className="flex items-center text-sm text-gray-600">
            <FaCalendarAlt className="mr-1 text-blue-500" />
            {fechaStr}
          </span>
          <span className="flex items-center text-sm text-gray-600">
            <FaClock className="mr-1 text-pink-500" />
            {horaInicioStr} - {horaFinStr}
          </span>
        </div>

        <div className="mb-4 flex flex-col">
          <div className="mb-4 flex items-center">
            <FaTag className="mr-2 text-yellow-500" />
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              {evento.categoria}
            </span>
          </div>
          <div className="mb-4 flex items-center">
            {evento.estado === "Si" ? (
              <FaPowerOff className="mr-2 text-green-500 transform rotate-180" />
            ) : (
              <FaPowerOff className="mr-2 text-red-500" />
            )}

            <span
              className={`block text-xs font-semibold px-3 py-1 rounded-full ${
                evento.estado === "Si"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {evento.estado === "Si" ? "Realizado" : "Sin realizar"}
            </span>
          </div>
        </div>

        <div
          className="text-sm sm:text-md text-gray-600 mb-4 text-left"
          dangerouslySetInnerHTML={{ __html: evento.descripcion }}
        />

        {evento.observacion && (
          <p className="text-sm sm:text-md text-gray-600 mb-4 text-left">
            <span className="font-bold">Observacion/Motivo: </span>{" "}
            {evento.observacion}
          </p>
        )}

        <div className="flex justify-end mb-4">
          {evento.id_ticket > 0 && (
            <a
              href={`https://sucasainmobiliaria.com.co/ticket/?id_ticket=${evento.id_ticket}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: "black",
                color: "white",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                borderRadius: "0.25rem",
                width: "100%",
                textAlign: "center",
              }}
            >
              Ver ticket
            </a>
          )}
        </div>

        <div className="mt-4 border-t pt-4 flex gap-2 flex-col">
          <button
            onClick={handleHacerSeguimiento}
            className="flex items-center justify-center w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
          >
            <FaClipboardList className="mr-2" />
            Hacer seguimiento
          </button>
          <button
            onClick={handleVerSeguimiento}
            className="flex items-center justify-center w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            <FaEye className="mr-2" />
            Ver seguimiento
          </button>
          <button
            onClick={() => showHistorialModal(evento.id)}
            className="flex items-center justify-center w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            <FaHistory className="mr-2" />
            Ver historial
          </button>
        </div>
      </div>
    </div>
  );
}
