import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  listarTodosSeguimientos,
  listarFuncionarios,
} from "../services/eventService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function ConsolidadoSeguimientos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [funcionarios, setFuncionarios] = useState([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState("");

  const columns = [
    {
      name: "Fecha",
      selector: (row) => row.fecha,
      sortable: true,
      format: (row) => new Date(row.fecha).toLocaleString(),
      width: "180px",
    },
    {
      name: "Tipo",
      selector: (row) => row.tipo,
      sortable: true,
      width: "120px",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-bold ${
            row.tipo === "global"
              ? "bg-indigo-100 text-indigo-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {row.tipo ? row.tipo.toUpperCase() : "EVENTO"}
        </span>
      ),
    },
    {
      name: "Funcionario Objetivo",
      selector: (row) => row.nombre_funcionario || "Todos (Global)",
      sortable: true,
      width: "200px",
    },
    {
      name: "Creado Por",
      selector: (row) => row.usuario,
      sortable: true,
      width: "150px",
    },
    {
      name: "Evento Asociado",
      selector: (row) => row.evento_titulo || "N/A",
      sortable: true,
      width: "200px",
      wrap: true,
    },
    {
      name: "Detalle",
      selector: (row) => row.detalle,
      sortable: false,
      wrap: true,
    },
  ];

  useEffect(() => {
    fetchData();
    cargarFuncionarios();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await listarTodosSeguimientos();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cargarFuncionarios = async () => {
    const res = await listarFuncionarios();
    if (res.success) setFuncionarios(res.data);
  };

  const filteredData = data.filter((item) => {
    const matchText =
      item.detalle.toLowerCase().includes(filterText.toLowerCase()) ||
      (item.usuario &&
        item.usuario.toLowerCase().includes(filterText.toLowerCase())) ||
      (item.nombre_funcionario &&
        item.nombre_funcionario
          .toLowerCase()
          .includes(filterText.toLowerCase())) ||
      (item.evento_titulo &&
        item.evento_titulo.toLowerCase().includes(filterText.toLowerCase()));

    const matchFuncionario =
      selectedFuncionario === "" ||
      item.nombre_funcionario === selectedFuncionario;

    return matchText && matchFuncionario;
  });

  const exportarExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Seguimientos");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(dataBlob, "consolidado_seguimientos.xlsx");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Consolidado de Seguimientos Globales
        </h1>
        <button
          onClick={() => window.history.back()}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Volver
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4 flex flex-wrap gap-4 items-end">
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-bold mb-1">Buscar:</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="Buscar por detalle, usuario, evento..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-bold mb-1">
            Filtrar por Funcionario Objetivo:
          </label>
          <select
            className="w-full border p-2 rounded"
            value={selectedFuncionario}
            onChange={(e) => setSelectedFuncionario(e.target.value)}
          >
            <option value="">Todos</option>
            {funcionarios.map((f, index) => (
              <option key={index} value={f.nombre}>
                {f.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto">
          <button
            onClick={exportarExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
          >
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          progressPending={loading}
          highlightOnHover
          responsive
          noDataComponent="No se encontraron seguimientos."
          paginationComponentOptions={{
            rowsPerPageText: "Filas por página:",
            rangeSeparatorText: "de",
            selectAllRowsItem: true,
            selectAllRowsItemText: "Todos",
          }}
        />
      </div>
    </div>
  );
}
