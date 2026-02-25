import { BrowserRouter, Routes, Route } from "react-router-dom";
import VistaGeneral from "../views/VistaGeneral";
import VistaFuncionario from "../views/VistaFuncionario";
import VistaCategoria from "../views/VistaCategoria";
import VistaAdministrativo from "../views/VistaAdministrativo";
import VistaComercial from "../views/VistaComercial";
import CrearEventoTicket from "../components/CrearEventoTicket";
import VistaEvento from "../views/VistaEvento";
import CrearEventoMultiple from "../components/CrearEventoMultiple";
import TablaBloqueos from "../views/TablaBloqueos";
import CrearEventoFuncionario from "../components/CrearEventoFuncionario";
import ConsolidadoEventos from "../views/ConsolidadoEventos";
import ConsolidadoFuncionario from "../views/ConsolidadoFuncionario";
import InformeEventos from "../views/InformeEventos";
import ConsolidadoSeguimientos from "../views/ConsolidadoSeguimientos";
import GestionCategorias from "../views/GestionCategorias";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VistaGeneral />} />
        <Route path="/gestion-categorias" element={<GestionCategorias />} />
        <Route path="/consolidado-eventos" element={<ConsolidadoEventos />} />
        <Route path="/consolidado-seguimientos" element={<ConsolidadoSeguimientos />} />
        <Route path="/informe-eventos" element={<InformeEventos />} />
        <Route
          path="/consolidado-funcionario/:id_funcionario"
          element={<ConsolidadoFuncionario />}
        />
        <Route
          path="/funcionario/:id_funcionario"
          element={<VistaFuncionario />}
        />
        <Route path="/categoria/:id_categoria" element={<VistaCategoria />} />
        <Route
          path="/calendario-administrativo/:categorias"
          element={<VistaAdministrativo />}
        />
        <Route
          path="/calendario-comercial/:categorias"
          element={<VistaComercial />}
        />
        <Route
          path="/crear-evento-ticket/:id_ticket"
          element={<CrearEventoTicket />}
        />
        <Route
          path="/crear-evento-multiple"
          element={<CrearEventoMultiple />}
        />
        <Route path="/evento/:id_evento" element={<VistaEvento />} />
        <Route path="/tabla-bloqueos" element={<TablaBloqueos />} />
        <Route
          path="/crear-evento-funcionario/:id_funcionario"
          element={<CrearEventoFuncionario />}
        />
      </Routes>
    </BrowserRouter>
  );
}
