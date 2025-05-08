import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerEvento } from "../services/eventService";
import Swal from "sweetalert2";
import { FaCalendarAlt, FaClock, FaTag } from "react-icons/fa";

export default function VistaEvento() {
  const { id_evento } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvento() {
      try {
        const res = await obtenerEvento(id_evento);
        if (res.success) {
          setEvento(res.data);
        } else {
          Swal.fire("Error", "No se pudo cargar el evento", "error");
          navigate(-1);
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Hubo un problema al cargar el evento", "error");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }

    fetchEvento();
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
      {/* Contenedor de botones superiores - ahora responsivo */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 mb-6">
        <a
          href={`https://mango-mushroom-0f4d0671e.6.azurestaticapps.net`}
          target="_blank"
          rel="noopener noreferrer"
          style={buttonStyle}
          className="flex-1 sm:flex-none text-center"
        >
          Ver calendario
        </a>
        <a
          href="https://mango-mushroom-0f4d0671e.6.azurestaticapps.net/categoria/1,6,7,8,9,10,11"
          target="_blank"
          rel="noopener noreferrer"
          style={buttonStyle}
          className="flex-1 sm:flex-none text-center"
        >
          Calendario administrativo
        </a>
        <a
          href="https://mango-mushroom-0f4d0671e.6.azurestaticapps.net/categoria/2,3,4,5,11"
          target="_blank"
          rel="noopener noreferrer"
          style={buttonStyle}
          className="flex-1 sm:flex-none text-center"
        >
          Calendario comercial
        </a>
      </div>

      {/* Tarjeta del evento */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 max-w-md mx-auto border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
          {evento.titulo}
        </h2>

        <div
          className="text-sm sm:text-md text-gray-600 mb-4 text-left"
          dangerouslySetInnerHTML={{ __html: evento.descripcion }}
        />

        {/* Información de fecha y hora - ajustado para móviles */}
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

        {/* Categoría */}
        <div className="mb-4 flex items-center">
          <FaTag className="mr-2 text-yellow-500" />
          <span
            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full 
              ${
                evento.categoria === "Reunión"
                  ? "bg-green-100 text-green-700"
                  : evento.categoria === "Visita"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
          >
            {evento.categoria}
          </span>
        </div>

        {/* Botón Ver Ticket */}
        <div className="flex justify-end">
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
            }}
          >
            Ver ticket
          </a>
        </div>
      </div>
    </div>
  );
}
