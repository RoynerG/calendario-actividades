import { BrowserRouter, Routes, Route } from "react-router-dom";
import VistaGeneral from "../views/VistaGeneral";
import VistaFuncionario from "../views/VistaFuncionario";
import VistaCategoria from "../views/VistaCategoria";

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
      </Routes>
    </BrowserRouter>
  );
}
