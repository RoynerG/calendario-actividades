import { useEffect, useState } from "react";
import { Scheduler } from "@aldabil/react-scheduler";
import { filtrarEventos, listarFuncionarios } from "../services/eventService";
import { useParams } from "react-router-dom";
import schedulerConfig from "../services/schedulerConfig";
import { es } from "date-fns/locale";
import GuiaCategorias from "../components/GuiaCategorias";
import GuiaEventosRecurrentes from "../components/GuiaEventosRecurrentes";
import EventoViewer from "../components/EventoViewer";
import { checkAdminAndExecute } from "../helpers/auth";
import {
  showVerSeguimientosModal,
  showCrearSeguimientoModal,
} from "../helpers/seguimientoModals";
import { useResponsiveView } from "../hooks/useResponsiveView";
import FiltrosCalendario from "../components/FiltrosCalendario";

export default function VistaComercial() {
  const { categorias } = useParams();
  const [eventos, setEventos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [filtros, setFiltros] = useState({
    id_empleado: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "",
    fue_trasladado: "",
  });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useResponsiveView();
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

  const handleVerSeguimiento = (idEvento) => {
    showVerSeguimientosModal(idEvento, "evento", null);
  };

  const handleHacerSeguimiento = (idEvento) => {
    checkAdminAndExecute(() => {
      showCrearSeguimientoModal(idEvento, "evento", "Admin", null);
    });
  };

  useEffect(() => {
    listarFuncionarios().then((res) => {
      if (res.success) setFuncionarios(res.data);
    });
  }, []);

  useEffect(() => {
    if (!categorias) return;

    async function fetchEventos() {
      setLoading(true);
      try {
        const categoriasArray = categorias.split(",").map(Number);
        const filtrosCompletos = { ...filtros, categorias: categoriasArray };
        const res = await filtrarEventos(filtrosCompletos);
        if (res.data.success) {
          const formateados = res.data.data.map((ev) => ({
            event_id: ev.id,
            title: ev.titulo,
            subtitle: ev.nombre,
            start: new Date(ev.fecha_inicio),
            end: new Date(ev.fecha_fin),
            color: ev.color,
            nombre: ev.nombre,
            categoria: ev.categoria,
            id_ticket: ev.id_ticket,
            estado: ev.estado,
            ubicacion: ev.ubicacion,
            fue_trasladado: ev.fue_trasladado,
          }));
          setEventos(formateados);
        }
      } catch (err) {
        console.error("Error al cargar eventos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEventos();
  }, [filtros, categorias]);

  return (
    <div className="p-2 sm:p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-2 mb-3 sm:mb-6">
        <a
          href={`https://sucasainmobiliaria.com.co/mi-cuenta/menu-calendario/`}
          style={buttonStyle}
          className="flex-1 sm:flex-none text-center text-sm sm:text-base py-2"
        >
          Regresar a mi cuenta
        </a>
        <GuiaCategorias buttonStyle={buttonStyle} />
        <GuiaEventosRecurrentes buttonStyle={buttonStyle} />
      </div>
      <h1 className="page-title text-lg sm:text-3xl md:text-5xl font-bold text-center leading-tight">
        Calendario Comercial
      </h1>
      <FiltrosCalendario
        filtros={filtros}
        setFiltros={setFiltros}
        categorias={[]}
        funcionarios={funcionarios}
        mostrarCategoria={false}
      />
      {loading ? (
        <div className="text-center text-xl py-10 text-gray-500">
          Cargando calendario...
        </div>
      ) : (
        <div className="calendar-wrapper w-full overflow-x-auto overflow-y-hidden">
          <div className="min-w-[640px]">
            <Scheduler
              view={view}
              onViewChange={setView}
              agenda={false}
              events={eventos}
              week={schedulerConfig.week}
              day={schedulerConfig.day}
            translations={{
              navigation: schedulerConfig.navigation,
              event: schedulerConfig.event,
              moreEvents: schedulerConfig.moreEvents,
              noDataToDisplay: schedulerConfig.noDataToDisplay,
              loading: schedulerConfig.loading,
            }}
            locale={es}
            viewerExtraComponent={(fields, event) => (
              <EventoViewer
                event={event}
                categorias={null}
                setFiltros={setFiltros}
                onVerSeguimiento={() => handleVerSeguimiento(event.event_id)}
                onHacerSeguimiento={() =>
                  handleHacerSeguimiento(event.event_id)
                }
                allowActions={false}
              />
            )}
            editable={false}
            deletable={false}
            draggable={false}
          />
          </div>
        </div>
      )}
    </div>
  );
}
