import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  filtrarEventosAdmin,
  listarCategorias,
} from "../services/eventService";
import { useParams } from "react-router-dom";

export default function ConsolidadoFuncionario() {
  const { id_funcionario } = useParams();
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(50);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    id_categoria: "",
    id_empleado: id_funcionario,
    fecha_inicio: "",
    fecha_fin: "",
    estado: "",
    fue_trasladado: "",
  });

  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const cargarCategorias = async () => {
      const res = await listarCategorias();
      if (res.success) {
        setCategorias(res.data);
      }
    };
    cargarCategorias();
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [filtros]);

  useEffect(() => {
    fetchData(pagina, perPage);
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
        if (res.data.data.data.length === 0 && page > 1) {
          setPagina(1);
          return;
        }

        setData(res.data.data.data);
        setTotalRows(res.data.data.total);
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

  const handlePerRowsChange = async (newPerPage) => {
    setPerPage(newPerPage);
  };

  const columnas = [
    { name: "Título", selector: (row) => row.titulo, sortable: true },
    { name: "Funcionario", selector: (row) => row.funcionario, sortable: true },
    { name: "Inicio", selector: (row) => row.fecha_inicio, sortable: true },
    { name: "Fin", selector: (row) => row.fecha_fin, sortable: true },
    { name: "Categoría", selector: (row) => row.categoria, sortable: true },
    { name: "Realizado", selector: (row) => row.estado },
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

      <div className="mb-2 text-sm text-gray-700">
        Total eventos encontrados: <strong>{totalRows}</strong>
      </div>

      {/* Filtros */}
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
          value={filtros.id_categoria}
          onChange={(e) =>
            setFiltros((f) => ({ ...f, id_categoria: e.target.value }))
          }
          className="border p-2 rounded"
        >
          <option value="">Todos las categorias</option>
          {categorias.map((f) => (
            <option key={f.id} value={f.id}>
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
