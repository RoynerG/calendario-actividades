import { BrowserRouter, Routes, Route } from "react-router-dom";
import VistaGeneral from "../views/VistaGeneral";
import VistaFuncionario from "../views/VistaFuncionario";
import VistaCategoria from "../views/VistaCategoria";
import VistaAdministrativo from "../views/VistaAdministrativo";
import VistaComercial from "../views/VistaComercial";
import CrearEventoTicket from "../components/CrearEventoTicket";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VistaGeneral />} />
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
      </Routes>
    </BrowserRouter>
  );
}
