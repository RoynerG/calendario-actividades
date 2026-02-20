import {
  FaPowerOff,
  FaMapLocationDot,
  FaClipboardList,
  FaEye,
} from "react-icons/fa6";
import { IoTimeSharp } from "react-icons/io5";
import {
  showRealizadoModal,
  showEditarModal,
  showTrasladarModal,
  showHistorialModal,
} from "../helpers/eventModals";

export default function EventoViewer({
  event,
  categorias,
  setFiltros,
  onVerSeguimiento,
  onHacerSeguimiento,
  allowActions = true,
}) {
  return (
    <div>
      <ul>
        <li className="flex items-center">
          {event?.estado === "Si" ? (
            <FaPowerOff className="mr-2 text-green-500 transform rotate-180" />
          ) : (
            <FaPowerOff className="mr-2 text-red-500" />
          )}
          <span
            className={`block text-xs font-semibold px-3 py-1 rounded-full ${
              event?.estado === "Si"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {event?.estado === "Si" ? "Realizado" : "Sin realizar"}
          </span>
        </li>
        {event?.fue_trasladado === "Si" ? (
          <li className="flex items-center mt-2">
            <IoTimeSharp className="mr-2 text-red-500 transform rotate-180" />
            <span
              className={`block text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-red-700`}
            >
              Fue trasladado
            </span>
          </li>
        ) : null}
        {event?.ubicacion && (
          <li>
            <FaMapLocationDot className="inline" /> {event?.ubicacion}
          </li>
        )}
        <li>
          <strong>Categoría:</strong> {event?.categoria}
        </li>
        {event?.id_ticket > 0 && (
          <li
            style={{
              marginTop: "0.25rem",
              marginBottom: "1rem",
            }}
          >
            <strong>Ticket: </strong>
            <a
              href={`https://sucasainmobiliaria.com.co/ticket/?id_ticket=${event?.id_ticket}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                paddingLeft: "0.5rem",
                paddingRight: "0.5rem",
                paddingTop: "0.25rem",
                paddingBottom: "0.25rem",
                backgroundColor: "#000000",
                color: "#ffffff",
                borderRadius: "0.25rem",
              }}
            >
              Ver ticket
            </a>
          </li>
        )}
        <li
          style={{
            marginTop: "0.25rem",
          }}
        >
          <a
            href={`/evento/${event?.event_id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem",
              paddingTop: "0.25rem",
              paddingBottom: "0.25rem",
              backgroundColor: "#000000",
              color: "#ffffff",
              borderRadius: "0.25rem",
            }}
          >
            Ver evento
          </a>
        </li>
      </ul>
      <div className="flex flex-col gap-2 mt-4">
        {onHacerSeguimiento && (
          <button
            className="px-2 py-1 bg-purple-600 text-white rounded flex items-center justify-center"
            onClick={() => onHacerSeguimiento(event.event_id)}
          >
            <FaClipboardList className="mr-2" />
            Hacer Seguimiento
          </button>
        )}
        {onVerSeguimiento && (
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded flex items-center justify-center"
            onClick={() => onVerSeguimiento(event.event_id)}
          >
            <FaEye className="mr-2" />
            Ver Seguimiento
          </button>
        )}
        <button
          className="px-2 py-1 bg-gray-500 text-white rounded"
          onClick={() => showHistorialModal(event.event_id)}
        >
          Ver cambios
        </button>
        {allowActions && event?.estado === "No" && (
          <>
            <button
              className="px-2 py-1 bg-green-600 text-white rounded"
              onClick={() => showRealizadoModal(event, setFiltros)}
            >
              Marcar como realizado
            </button>
            <button
              className="px-2 py-1 bg-yellow-600 text-white rounded"
              onClick={() => showEditarModal(event, categorias, setFiltros)}
            >
              Editar evento
            </button>
            <button
              className="px-2 py-1 bg-blue-600 text-white rounded"
              onClick={() => showTrasladarModal(event, setFiltros)}
            >
              Trasladar fecha
            </button>
          </>
        )}
      </div>
    </div>
  );
}
