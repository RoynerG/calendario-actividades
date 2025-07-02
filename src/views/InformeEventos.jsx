import { useEffect, useState } from "react";
import {
  obtenerReporteEventos,
  listarFuncionarios,
} from "../services/eventService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InformeEventos() {
  const [reporte, setReporte] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [filtros, setFiltros] = useState({
    id_empleado: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  useEffect(() => {
    const cargarFuncionarios = async () => {
      const res = await listarFuncionarios();
      if (res.success) {
        setFuncionarios(res.data);
      }
    };
    cargarFuncionarios();
  }, []);

  const cargarReporte = async () => {
    const res = await obtenerReporteEventos(filtros);
    console.log("Respuesta del reporte:", res.data);
    setReporte(res.data.data);
  };

  const exportarPDF = () => {
    const funcionario = funcionarios.find(
      (f) => f.id_empleado === filtros.id_empleado
    );
    const nombreFuncionario = funcionario
      ? funcionario.nombre.replace(/\s+/g, "_")
      : "Todos";

    const doc = new jsPDF();
    doc.text("Informe de Eventos", 14, 20);

    const rows = reporte.map((r) => [
      r.funcionario,
      r.categoria,
      r.total_eventos,
      r.horas_total,
    ]);

    autoTable(doc, {
      head: [
        ["Funcionario", "Categoría", "Eventos Realizados", "Horas Totales"],
      ],
      body: rows,
      startY: 30,
    });

    doc.save(`informe_eventos${nombreFuncionario}.pdf`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Informe de Eventos</h1>

      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={filtros.id_empleado}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, id_empleado: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">Todos los funcionarios</option>
          {funcionarios.map((f) => (
            <option key={f.id_empleado} value={f.id_empleado}>
              {f.nombre}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filtros.fecha_inicio}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, fecha_inicio: e.target.value }))
          }
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={filtros.fecha_fin}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, fecha_fin: e.target.value }))
          }
          className="border p-2 rounded"
        />

        <button
          onClick={cargarReporte}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Consultar
        </button>

        <button
          onClick={exportarPDF}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Exportar PDF
        </button>
      </div>

      {reporte.length > 0 && (
        <>
          <table className="w-full text-sm border mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Funcionario</th>
                <th className="p-2 border">Categoría</th>
                <th className="p-2 border">Eventos Realizados</th>
                <th className="p-2 border">Horas Totales</th>
              </tr>
            </thead>
            <tbody>
              {reporte.map((r, i) => (
                <tr key={i}>
                  <td className="p-2 border">{r.funcionario}</td>
                  <td className="p-2 border">{r.categoria}</td>
                  <td className="p-2 border">{r.total_eventos}</td>
                  <td className="p-2 border">{r.horas_total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ width: "100%", height: 400 }}>
            <ResponsiveContainer>
              <BarChart
                data={reporte.filter((r) => r.horas_total > 0)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="horas_total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
