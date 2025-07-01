import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  filtrarEventosAdmin,
  listarFuncionarios,
} from "../services/eventService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function AdminEventos() {
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(50);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filtros dinámicos
  const [filtros, setFiltros] = useState({
    id_categoria: "",
    id_empleado: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "",
    fue_trasladado: "",
  });

  // Lista de funcionarios
  const [funcionarios, setFuncionarios] = useState([]);

  // Cargar funcionarios una sola vez
  useEffect(() => {
    const cargarFuncionarios = async () => {
      const res = await listarFuncionarios();
      if (res.success) {
        setFuncionarios(res.data);
      }
    };
    cargarFuncionarios();
  }, []);

  // Resetear página cuando cambian filtros
  useEffect(() => {
    setPagina(1);
  }, [filtros]);

  // Cargar datos cuando cambian página o filtros
  useEffect(() => {
    fetchData(pagina, perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, perPage, filtros]);

  const fetchData = async (page, limit) => {
    setLoading(true);
    try {
      const res = await filtrarEventosAdmin({
        pagina: page,
        limite: limit,
        ...filtros,
      });

      if (res.data.success) {
        setData(res.data.data.data);
        setTotalRows(res.data.data.total);
        console.log(res);
      }
    } catch (error) {
      console.error("Error al cargar eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagina(page);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
  };

  // Exportar a Excel
  const exportarExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Eventos");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "eventos.xlsx");
  };

  const columnas = [
    {
      name: "Título",
      selector: (row) => row.titulo,
      sortable: true,
    },
    {
      name: "Funcionario",
      selector: (row) => row.funcionario,
      sortable: true,
    },
    {
      name: "Inicio",
      selector: (row) => row.fecha_inicio,
      sortable: true,
    },
    {
      name: "Fin",
      selector: (row) => row.fecha_fin,
      sortable: true,
    },
    {
      name: "Categoría",
      selector: (row) => row.categoria,
      sortable: true,
    },
    {
      name: "Estado",
      selector: (row) => row.estado,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="flex gap-2">
          <a
            href={`/evento/${row.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Ver
          </a>
          {row.id_ticket > 0 && (
            <a
              href={`https://sucasainmobiliaria.com.co/ticket/?id_ticket=${row.id_ticket}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 underline"
            >
              Ticket
            </a>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Eventos</h1>

      {/* Filtros dinámicos */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="date"
          value={filtros.fecha_inicio}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, fecha_inicio: e.target.value }))
          }
          className="border p-2 rounded"
          placeholder="Fecha inicio"
        />

        <input
          type="date"
          value={filtros.fecha_fin}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, fecha_fin: e.target.value }))
          }
          className="border p-2 rounded"
          placeholder="Fecha fin"
        />

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

        <select
          value={filtros.estado}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, estado: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">¿Fue realizado?</option>
          <option value="Si">Sí</option>
          <option value="No">No</option>
        </select>

        <select
          value={filtros.fue_trasladado}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, fue_trasladado: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">¿Fue trasladado?</option>
          <option value="Si">Sí</option>
          <option value="No">No</option>
        </select>

        <button
          onClick={() =>
            setFiltros({
              id_categoria: "",
              id_empleado: "",
              fecha_inicio: "",
              fecha_fin: "",
              estado: "",
              fue_trasladado: "",
            })
          }
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded"
        >
          Eliminar filtros
        </button>

        <button
          onClick={exportarExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Exportar Excel
        </button>
      </div>

      <DataTable
        columns={columnas}
        data={data}
        progressPending={loading}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationPerPage={perPage}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}
        highlightOnHover
        persistTableHead
      />
    </div>
  );
}
