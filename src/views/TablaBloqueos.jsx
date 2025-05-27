import { useEffect, useState } from "react";
import { listarBloqueos } from "../services/eventService";

export default function TablaBloqueos() {
  const [bloqueos, setBloqueos] = useState([]);
  const [total, setTotal] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(true);
  const porPagina = 10;
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

  const fetchData = async (pagina = 1) => {
    setLoading(true);
    try {
      const offset = (pagina - 1) * porPagina;
      const res = await listarBloqueos(offset, porPagina);
      if (res.success) {
        setBloqueos(res.data.registros);
        setTotal(res.data.total);
        setPaginaActual(pagina);
      }
    } catch (err) {
      console.error("Error cargando bloqueos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const totalPaginas = Math.ceil(total / porPagina);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <a
        href={`https://sucasainmobiliaria.com.co/mi-cuenta/menu-calendario/`}
        style={buttonStyle}
        className="flex-1 sm:flex-none text-center"
      >
        Regresar a mi cuenta
      </a>
      <h2 className="text-2xl font-bold mb-4 mt-4">Registro de Bloqueos</h2>

      {loading ? (
        <div className="text-gray-500">Cargando bloqueos...</div>
      ) : bloqueos.length === 0 ? (
        <div className="text-gray-500">No hay registros de bloqueo.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border">#</th>
                  <th className="py-2 px-4 border">Funcionario</th>
                  <th className="py-2 px-4 border">Eventos Pendientes</th>
                  <th className="py-2 px-4 border">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {bloqueos.map((b, index) => (
                  <tr key={b.id} className="text-center">
                    <td className="py-2 px-4 border">
                      {(paginaActual - 1) * porPagina + index + 1}
                    </td>
                    <td className="py-2 px-4 border">{b.nombre}</td>
                    <td className="py-2 px-4 border">
                      {b.cantidad_pendientes}
                    </td>
                    <td className="py-2 px-4 border">
                      {new Date(b.fecha_registro).toLocaleDateString("es-CO")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i}
                onClick={() => fetchData(i + 1)}
                className={`px-3 py-1 rounded border ${
                  i + 1 === paginaActual
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
