import { useEffect, useState } from "react";
import { FaFilter, FaChevronDown, FaChevronUp } from "react-icons/fa";

function countActive(filtros) {
  if (!filtros) return 0;
  return Object.entries(filtros).filter(
    ([, v]) => v !== "" && v !== null && v !== undefined
  ).length;
}

export default function FiltrosCalendario({
  filtros,
  setFiltros,
  categorias = [],
  funcionarios = [],
  mostrarCategoria = true,
  mostrarFuncionario = true,
  mostrarEstado = true,
  mostrarTrasladado = true,
  camposPersonalizados = null,
}) {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 639px)");
    const handle = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setOpen(true);
    };
    handle(mq);
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 640) setOpen(false);
  }, []);

  const handleClear = () => {
    const cleared = {};
    Object.keys(filtros).forEach((k) => {
      cleared[k] = "";
    });
    setFiltros(cleared);
  };

  const update = (key) => (e) =>
    setFiltros((f) => ({ ...f, [key]: e.target.value }));

  const activeCount = countActive(filtros);

  return (
    <div className="filtros-calendario">
      {isMobile ? (
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-100"
            aria-expanded={open}
          >
            <span className="flex items-center gap-2">
              <FaFilter size={14} />
              <span>Filtros</span>
              {activeCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center text-xs font-bold rounded-full bg-blue-600 text-white min-w-[20px] h-5 px-1.5">
                  {activeCount}
                </span>
              )}
            </span>
            {open ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
          </button>
          {open && (
            <div className="border-t border-gray-200 dark:border-slate-700 p-3 space-y-2">
              {renderFilters()}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
          {renderFiltersInline()}
        </div>
      )}
    </div>
  );

  function renderFilters() {
    return (
      <>
        <input
          type="date"
          value={filtros.fecha_inicio || ""}
          onChange={update("fecha_inicio")}
          className="w-full text-sm"
          aria-label="Fecha inicio"
        />
        <input
          type="date"
          value={filtros.fecha_fin || ""}
          onChange={update("fecha_fin")}
          className="w-full text-sm"
          aria-label="Fecha fin"
        />
        {mostrarCategoria && (
          <select
            value={filtros.id_categoria || ""}
            onChange={update("id_categoria")}
            className="w-full text-sm"
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        )}
        {mostrarFuncionario && (
          <select
            value={filtros.id_empleado || ""}
            onChange={update("id_empleado")}
            className="w-full text-sm"
            aria-label="Filtrar por funcionario"
          >
            <option value="">Todos los funcionarios</option>
            {funcionarios.map((f) => (
              <option key={f.id_empleado} value={f.id_empleado}>
                {f.nombre}
              </option>
            ))}
          </select>
        )}
        {mostrarEstado && (
          <select
            value={filtros.estado || ""}
            onChange={update("estado")}
            className="w-full text-sm"
            aria-label="Filtrar por estado"
          >
            <option value="">¿Fue realizado?</option>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        )}
        {mostrarTrasladado && (
          <select
            value={filtros.fue_trasladado || ""}
            onChange={update("fue_trasladado")}
            className="w-full text-sm"
            aria-label="Filtrar por trasladado"
          >
            <option value="">¿Fue trasladado?</option>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        )}
        {camposPersonalizados}
        <button
          type="button"
          onClick={handleClear}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white p-2 rounded font-bold text-sm"
        >
          Eliminar filtros
        </button>
      </>
    );
  }

  function renderFiltersInline() {
    return (
      <>
        <input
          type="date"
          value={filtros.fecha_inicio || ""}
          onChange={update("fecha_inicio")}
          className="w-full sm:w-auto text-sm"
          aria-label="Fecha inicio"
        />
        <input
          type="date"
          value={filtros.fecha_fin || ""}
          onChange={update("fecha_fin")}
          className="w-full sm:w-auto text-sm"
          aria-label="Fecha fin"
        />
        {mostrarCategoria && (
          <select
            value={filtros.id_categoria || ""}
            onChange={update("id_categoria")}
            className="w-full sm:w-auto text-sm"
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        )}
        {mostrarFuncionario && (
          <select
            value={filtros.id_empleado || ""}
            onChange={update("id_empleado")}
            className="w-full sm:w-auto text-sm"
            aria-label="Filtrar por funcionario"
          >
            <option value="">Todos los funcionarios</option>
            {funcionarios.map((f) => (
              <option key={f.id_empleado} value={f.id_empleado}>
                {f.nombre}
              </option>
            ))}
          </select>
        )}
        {mostrarEstado && (
          <select
            value={filtros.estado || ""}
            onChange={update("estado")}
            className="w-full sm:w-auto text-sm"
            aria-label="Filtrar por estado"
          >
            <option value="">¿Fue realizado?</option>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        )}
        {mostrarTrasladado && (
          <select
            value={filtros.fue_trasladado || ""}
            onChange={update("fue_trasladado")}
            className="w-full sm:w-auto text-sm"
            aria-label="Filtrar por trasladado"
          >
            <option value="">¿Fue trasladado?</option>
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        )}
        {camposPersonalizados}
        <button
          type="button"
          onClick={handleClear}
          className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white p-2 rounded font-bold text-sm"
        >
          Eliminar filtros
        </button>
      </>
    );
  }
}
