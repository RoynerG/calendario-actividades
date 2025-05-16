import { FaPowerOff, FaMapLocationDot } from "react-icons/fa6";
import {
  showRealizadoModal,
  showEditarModal,
  showTrasladarModal,
} from "../helpers/eventModals";

export default function EventoViewer({ event, categorias, setFiltros }) {
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
      {event?.estado === "No" && (
        <div className="flex flex-col gap-2 mt-4">
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
        </div>
      )}
    </div>
  );
}
