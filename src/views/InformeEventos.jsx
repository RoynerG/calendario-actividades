import { useEffect, useState } from "react";
import {
  obtenerReporteEventos,
  listarFuncionarios,
  filtrarEventosAdmin,
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  format,
  eachDayOfInterval,
  isSunday,
  differenceInMinutes,
  parseISO,
  isSaturday,
} from "date-fns";
import { es } from "date-fns/locale";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#FF6B6B",
  "#4ECDC4",
];

const ROLES_COMERCIALES = [
  "Precaptador",
  "Captacion y actualizacion",
  "Promocion y colocacion",
  "Servicio al cliente",
  "Gerencia",
  "Avaluo",
];
const ROLES_ADMINISTRATIVOS = [
  "Servicio al propietario",
  "Servicio al arrendatario",
  "Mantenimiento",
  "Gerencia",
  "Contractual",
];

// Helper para calcular minutos laborales en un rango
const calculateWorkMinutes = (start, end) => {
  const days = eachDayOfInterval({ start, end });
  let totalMinutes = 0;

  days.forEach((day) => {
    if (isSunday(day)) return;

    let dayMinutes = 0;
    // Mañana: 8:30 - 12:30 (4 horas = 240 min)
    dayMinutes += 240;

    if (!isSaturday(day)) {
      // Tarde: 14:00 - 18:00 (4 horas = 240 min)
      dayMinutes += 240;
    } else {
      // Sábado hasta las 12:00 (3.5 horas = 210 min)
      // Ajuste: 8:30 a 12:00 son 3.5 horas
      dayMinutes = 210;
    }
    totalMinutes += dayMinutes;
  });
  return totalMinutes;
};

export default function InformeEventos() {
  const [activeTab, setActiveTab] = useState("general");
  const [reporte, setReporte] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [filtros, setFiltros] = useState({
    id_empleado: "",
    fecha_inicio: "",
    fecha_fin: "",
  });
  const [tipoFuncionario, setTipoFuncionario] = useState("todos"); // 'todos', 'comercial', 'administrativo'
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState([]);

  const [auditData, setAuditData] = useState([]);
  const [individualCompliance, setIndividualCompliance] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [topFuncionarios, setTopFuncionarios] = useState([]);
  const [topCategorias, setTopCategorias] = useState([]);

  // Nuevos estados para gráficos detallados
  const [dailyActivity, setDailyActivity] = useState([]);
  const [timeDistribution, setTimeDistribution] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

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

  useEffect(() => {
    const cargarFuncionarios = async () => {
      const res = await listarFuncionarios();
      if (res.success) {
        setFuncionarios(res.data);
        setFuncionariosFiltrados(res.data);
      }
    };
    cargarFuncionarios();
  }, []);

  // Filtrar lista de funcionarios cuando cambia el tipo
  useEffect(() => {
    if (tipoFuncionario === "todos") {
      setFuncionariosFiltrados(funcionarios);
    } else if (tipoFuncionario === "comercial") {
      setFuncionariosFiltrados(
        funcionarios.filter((f) => ROLES_COMERCIALES.includes(f.rol))
      );
    } else if (tipoFuncionario === "administrativo") {
      setFuncionariosFiltrados(
        funcionarios.filter((f) => ROLES_ADMINISTRATIVOS.includes(f.rol))
      );
    }
    // Resetear selección individual si el funcionario seleccionado no está en el nuevo grupo
    // (Opcional, pero buena UX)
    setFiltros((prev) => ({ ...prev, id_empleado: "" }));
  }, [tipoFuncionario, funcionarios]);

  const processGeneralStats = async (reportData) => {
    // Si hay un funcionario seleccionado, cargar datos detallados
    if (filtros.id_empleado && filtros.fecha_inicio && filtros.fecha_fin) {
      setLoadingStats(true);
      try {
        // Traer eventos raw para calcular distribución real de tiempo y actividad diaria
        const res = await filtrarEventosAdmin({
          ...filtros,
          limite: 5000,
        });

        let eventosRaw = [];
        if (
          res.data &&
          res.data.success &&
          res.data.data &&
          res.data.data.data
        ) {
          eventosRaw = res.data.data.data;
        } else if (Array.isArray(res.data)) {
          eventosRaw = res.data;
        }

        // 1. Actividad Diaria (Eventos por día)
        const activityMap = {};
        eventosRaw.forEach((e) => {
          const day = e.fecha_inicio.split(" ")[0];
          if (!activityMap[day]) activityMap[day] = 0;
          activityMap[day]++;
        });

        // Rellenar días vacíos
        const start = parseISO(filtros.fecha_inicio);
        const end = parseISO(filtros.fecha_fin);
        const days = eachDayOfInterval({ start, end });
        const dailyData = days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          return {
            date: dateStr,
            dayName: format(day, "EEE", { locale: es }), // Lun, Mar...
            eventos: activityMap[dateStr] || 0,
          };
        });
        setDailyActivity(dailyData);

        // 2. Distribución de Tiempo (Categorías vs Libre)
        const totalWorkMinutes = calculateWorkMinutes(start, end);
        let usedMinutes = 0;
        const catTimeMap = {};

        eventosRaw.forEach((e) => {
          const s = parseISO(e.fecha_inicio);
          const f = parseISO(e.fecha_fin);
          const minutes = differenceInMinutes(f, s);
          usedMinutes += minutes;

          if (!catTimeMap[e.categoria]) catTimeMap[e.categoria] = 0;
          catTimeMap[e.categoria] += minutes;
        });

        const timeData = Object.keys(catTimeMap).map((k) => ({
          name: k,
          value: parseFloat((catTimeMap[k] / 60).toFixed(1)), // Horas
          rawMinutes: catTimeMap[k],
        }));

        // Agregar tiempo libre
        const freeMinutes = Math.max(0, totalWorkMinutes - usedMinutes);
        if (freeMinutes > 0) {
          timeData.push({
            name: "Tiempo Disponible (Sin agendar)",
            value: parseFloat((freeMinutes / 60).toFixed(1)),
            color: "#E0E0E0", // Gris para libre
          });
        }

        setTimeDistribution(timeData.sort((a, b) => b.value - a.value));
      } catch (error) {
        console.error("Error procesando estadísticas detalladas", error);
      } finally {
        setLoadingStats(false);
      }
    } else {
      // Vista Global (Todos los funcionarios)
      setDailyActivity([]);
      setTimeDistribution([]);
    }

    // Top Funcionarios (siempre útil para comparar si no hay filtro o incluso si hay)
    // Pero si hay filtro de 1 funcionario, este chart se ve raro con 1 sola barra.
    if (!filtros.id_empleado) {
      const funcMap = {};
      reportData.forEach((item) => {
        if (!funcMap[item.funcionario]) {
          funcMap[item.funcionario] = 0;
        }
        funcMap[item.funcionario] += parseInt(item.total_eventos, 10);
      });
      const sortedFunc = Object.keys(funcMap)
        .map((key) => ({ name: key, value: funcMap[key] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
      setTopFuncionarios(sortedFunc);
    } else {
      setTopFuncionarios([]); // Limpiar para no mostrar
    }

    // Top Categorias (por # de eventos) - Global
    const catMap = {};
    reportData.forEach((item) => {
      if (!catMap[item.categoria]) {
        catMap[item.categoria] = 0;
      }
      catMap[item.categoria] += parseInt(item.total_eventos, 10);
    });
    const sortedCat = Object.keys(catMap)
      .map((key) => ({ name: key, value: catMap[key] }))
      .sort((a, b) => b.value - a.value);
    setTopCategorias(sortedCat);
  };

  const calculateAudit = async () => {
    if (!filtros.fecha_inicio || !filtros.fecha_fin) {
      alert("Seleccione un rango de fechas para auditar");
      return;
    }

    setLoadingAudit(true);
    try {
      // 1. Obtener todos los eventos del rango
      const res = await filtrarEventosAdmin({
        ...filtros,
        id_empleado: "", // Traemos todo y filtramos localmente para manejar grupos
        limite: 10000,
      });

      let eventosRaw = [];
      if (res.data && res.data.success && res.data.data && res.data.data.data) {
        eventosRaw = res.data.data.data;
      } else if (Array.isArray(res.data)) {
        eventosRaw = res.data;
      }

      // Determinar qué funcionarios están en el "Scope" del reporte actual
      let scopeFuncionarios = [];
      if (filtros.id_empleado) {
        // Si hay un empleado seleccionado, el scope es solo ese empleado
        scopeFuncionarios = funcionarios.filter(
          (f) => f.id_empleado === filtros.id_empleado
        );
      } else {
        // Si no, el scope es el grupo seleccionado (Todos, Comercial, Admin)
        scopeFuncionarios = funcionariosFiltrados;
      }

      const scopeIds = scopeFuncionarios.map((f) => f.id_empleado);

      // Filtrar eventos para solo considerar los del scope
      const eventosScope = eventosRaw.filter((e) =>
        scopeIds.includes(e.id_empleado)
      );

      // 2. Auditoría Diaria (Agregada)
      const start = parseISO(filtros.fecha_inicio);
      const end = parseISO(filtros.fecha_fin);
      const days = eachDayOfInterval({ start, end });

      const auditResults = days
        .map((day) => {
          if (isSunday(day)) return null;

          const dateStr = format(day, "yyyy-MM-dd");

          // Eventos del día para el grupo seleccionado
          const dayEvents = eventosScope.filter((e) =>
            e.fecha_inicio.startsWith(dateStr)
          );

          // Calcular minutos laborales base de UN funcionario
          let singleFuncWorkMinutes = 0;
          // Mañana: 8:30 - 12:30 (240 min)
          singleFuncWorkMinutes += 240;
          if (!isSaturday(day)) {
            // Tarde: 14:00 - 18:00 (240 min)
            singleFuncWorkMinutes += 240;
          } else {
            // Sábado hasta las 12:00 (210 min)
            singleFuncWorkMinutes = 210;
          }

          // Capacidad Total = (Minutos Laborales Base) * (Cantidad de Funcionarios en Scope)
          const totalCapacityMinutes =
            singleFuncWorkMinutes * scopeFuncionarios.length;

          // Minutos Ocupados = Suma de duraciones de eventos
          // Nota: Esto asume que no hay solapamientos 'ilegales' dentro del mismo funcionario.
          // Si un funcionario tiene eventos solapados, cuenta doble, lo cual está bien para 'utilización' (está muy ocupado)
          // pero podría exceder 100%. Para auditoría simple, sumar duraciones está bien.
          let occupiedMinutes = 0;
          dayEvents.forEach((e) => {
            const s = parseISO(e.fecha_inicio);
            const f = parseISO(e.fecha_fin);
            occupiedMinutes += differenceInMinutes(f, s);
          });

          const utilization =
            totalCapacityMinutes > 0
              ? (occupiedMinutes / totalCapacityMinutes) * 100
              : 0;

          return {
            date: dateStr,
            dayName: format(day, "EEEE", { locale: es }),
            utilization: utilization.toFixed(1),
            totalWorkMinutes: totalCapacityMinutes, // Capacidad total del equipo
            occupiedMinutes, // Minutos agendados del equipo
            eventCount: dayEvents.length,
          };
        })
        .filter(Boolean);

      setAuditData(auditResults);

      // 3. Auditoría Individual (Ranking de Cumplimiento)
      // Solo calcular si estamos viendo un grupo (más de 1 funcionario)
      if (scopeFuncionarios.length > 1) {
        const totalPeriodWorkMinutes = calculateWorkMinutes(start, end);

        const complianceList = scopeFuncionarios.map((func) => {
          const funcEvents = eventosScope.filter(
            (e) => e.id_empleado === func.id_empleado
          );
          let funcOccupied = 0;
          funcEvents.forEach((e) => {
            const s = parseISO(e.fecha_inicio);
            const f = parseISO(e.fecha_fin);
            funcOccupied += differenceInMinutes(f, s);
          });

          const util =
            totalPeriodWorkMinutes > 0
              ? (funcOccupied / totalPeriodWorkMinutes) * 100
              : 0;

          return {
            nombre: func.nombre,
            eventos: funcEvents.length,
            horas: (funcOccupied / 60).toFixed(1),
            utilization: util.toFixed(1),
          };
        });

        // Ordenar por menor cumplimiento primero (para detectar problemas) o mayor?
        // Usuario: "ver si todos cumplen".
        setIndividualCompliance(
          complianceList.sort(
            (a, b) => parseFloat(a.utilization) - parseFloat(b.utilization)
          )
        );
      } else {
        setIndividualCompliance([]);
      }
    } catch (error) {
      console.error("Error auditando", error);
    } finally {
      setLoadingAudit(false);
    }
  };

  const cargarReporte = async () => {
    const res = await obtenerReporteEventos(filtros);
    console.log("Respuesta del reporte:", res.data);
    if (res.data && res.data.success) {
      setReporte(res.data.data);
      processGeneralStats(res.data.data);
    }

    // Si estamos en tab auditoría, calcular también
    if (activeTab === "audit") {
      calculateAudit();
    }
  };

  // Efecto para recargar si cambia tab a audit y ya hay filtros
  useEffect(() => {
    if (activeTab === "audit" && filtros.fecha_inicio && filtros.fecha_fin) {
      calculateAudit();
    }
  }, [activeTab]);

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

    if (auditData.length > 0) {
      doc.addPage();
      doc.text("Auditoría de Horarios", 14, 20);
      const auditRows = auditData.map((d) => [
        d.date,
        d.dayName,
        `${d.utilization}%`,
        d.eventCount,
      ]);
      autoTable(doc, {
        head: [["Fecha", "Día", "Ocupación", "Eventos"]],
        body: auditRows,
        startY: 30,
      });
    }

    doc.save(`informe_eventos${nombreFuncionario}.pdf`);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded shadow">
        <h1 className="text-2xl font-bold text-gray-800">Informe de Eventos</h1>
        <a
          href={`https://sucasainmobiliaria.com.co/mi-cuenta/menu-calendario/`}
          style={buttonStyle}
          className="text-sm"
        >
          Regresar a mi cuenta
        </a>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Funcionario
            </label>
            <select
              value={tipoFuncionario}
              onChange={(e) => setTipoFuncionario(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="todos">Todos</option>
              <option value="comercial">Comercial</option>
              <option value="administrativo">Administrativo</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Funcionario
            </label>
            <select
              value={filtros.id_empleado}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, id_empleado: e.target.value }))
              }
              className="w-full border p-2 rounded"
            >
              <option value="">Todos los funcionarios</option>
              {funcionariosFiltrados.map((f) => (
                <option key={f.id_empleado} value={f.id_empleado}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filtros.fecha_inicio}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, fecha_inicio: e.target.value }))
              }
              className="border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filtros.fecha_fin}
              onChange={(e) =>
                setFiltros((f) => ({ ...f, fecha_fin: e.target.value }))
              }
              className="border p-2 rounded"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={cargarReporte}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Consultar
            </button>
            <button
              onClick={exportarPDF}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-4 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "general"
                  ? "text-blue-600 border-b-2 border-blue-600 active"
                  : "hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("general")}
            >
              Estadísticas Generales
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "audit"
                  ? "text-blue-600 border-b-2 border-blue-600 active"
                  : "hover:text-gray-600 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("audit")}
            >
              Auditoría de Horarios
            </button>
          </li>
        </ul>
      </div>

      {activeTab === "general" && reporte.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Funcionarios: Solo mostrar si no hay funcionario seleccionado */}
          {!filtros.id_empleado && (
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-bold mb-4">
                Top Funcionarios (Eventos)
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topFuncionarios}
                    layout="vertical"
                    margin={{ left: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" name="Eventos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Gráficos para Funcionario Individual */}
          {filtros.id_empleado && (
            <>
              {/* Actividad Diaria */}
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-bold mb-4">
                  Evolución Diaria de Eventos
                </h3>
                {loadingStats ? (
                  <div className="flex justify-center items-center h-[300px]">
                    Cargando...
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dayName" />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                          labelFormatter={(label, payload) => {
                            if (
                              payload &&
                              payload.length > 0 &&
                              payload[0].payload
                            ) {
                              return `${payload[0].payload.date} (${label})`;
                            }
                            return label;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="eventos"
                          stroke="#8884d8"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                          name="Eventos"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Distribución de Tiempo */}
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-bold mb-4">
                  Uso del Tiempo Disponible (Horas)
                </h3>
                {loadingStats ? (
                  <div className="flex justify-center items-center h-[300px]">
                    Cargando...
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={timeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ percent }) =>
                            percent > 0.05
                              ? `${(percent * 100).toFixed(0)}%`
                              : ""
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {timeDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.color || COLORS[index % COLORS.length]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} horas`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Distribución Categorías */}
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-bold mb-4">
              {filtros.id_empleado
                ? "Distribución de Eventos por Categoría"
                : "Distribución Global por Categoría"}
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCategorias}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) =>
                      percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {topCategorias.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla Detalle */}
          <div className="bg-white p-4 rounded shadow md:col-span-2">
            <h3 className="text-lg font-bold mb-4">
              Detalle por Funcionario y Categoría
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border text-left">Funcionario</th>
                    <th className="p-2 border text-left">Categoría</th>
                    <th className="p-2 border text-right">Eventos</th>
                    <th className="p-2 border text-right">Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-2 border">{r.funcionario}</td>
                      <td className="p-2 border">{r.categoria}</td>
                      <td className="p-2 border text-right">
                        {r.total_eventos}
                      </td>
                      <td className="p-2 border text-right">{r.horas_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-bold mb-4">Auditoría de Agendamiento</h3>
          <p className="text-sm text-gray-500 mb-4">
            Analiza el cumplimiento del horario laboral:
            <br />
            L-V: 8:30am - 12:30pm | 2:00pm - 6:00pm
            <br />
            Sáb: 8:30am - 12:00pm
          </p>

          {loadingAudit ? (
            <div className="text-center py-10">Cargando auditoría...</div>
          ) : auditData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Fecha</th>
                    <th className="p-2 border">Día</th>
                    <th className="p-2 border text-center">Eventos</th>
                    <th className="p-2 border text-center">Tiempo Agendado</th>
                    <th className="p-2 border text-center">Tiempo Laboral</th>
                    <th className="p-2 border text-center">% Ocupación</th>
                    <th className="p-2 border text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {auditData.map((d, i) => (
                    <tr
                      key={i}
                      className={
                        d.utilization < 50 ? "bg-red-50" : "hover:bg-gray-50"
                      }
                    >
                      <td className="p-2 border">{d.date}</td>
                      <td className="p-2 border capitalize">{d.dayName}</td>
                      <td className="p-2 border text-center">{d.eventCount}</td>
                      <td className="p-2 border text-center">
                        {d.occupiedMinutes} min
                      </td>
                      <td className="p-2 border text-center">
                        {d.totalWorkMinutes} min
                      </td>
                      <td className="p-2 border text-center font-bold">
                        <span
                          className={
                            d.utilization < 50
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {d.utilization}%
                        </span>
                      </td>
                      <td className="p-2 border text-center">
                        {d.utilization < 50 ? "Baja Productividad" : "OK"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No hay datos para mostrar. Seleccione un funcionario y rango de
              fechas.
            </div>
          )}
        </div>
      )}

      {activeTab === "audit" && individualCompliance.length > 0 && (
        <div className="bg-white p-4 rounded shadow mt-6">
          <h3 className="text-lg font-bold mb-4">
            Cumplimiento por Funcionario (
            {tipoFuncionario === "todos" ? "Global" : tipoFuncionario})
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Ranking de utilización del tiempo laboral disponible en el periodo
            seleccionado.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Funcionario</th>
                  <th className="p-2 border">Total Eventos</th>
                  <th className="p-2 border">Horas Agendadas</th>
                  <th className="p-2 border">Cumplimiento (%)</th>
                  <th className="p-2 border">Estado</th>
                </tr>
              </thead>
              <tbody>
                {individualCompliance.map((item, idx) => {
                  const util = parseFloat(item.utilization);
                  let statusColor = "text-red-600";
                  let statusText = "Bajo";
                  if (util >= 80) {
                    statusColor = "text-green-600";
                    statusText = "Excelente";
                  } else if (util >= 50) {
                    statusColor = "text-yellow-600";
                    statusText = "Regular";
                  }

                  return (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-2 border font-medium">{item.nombre}</td>
                      <td className="p-2 border">{item.eventos}</td>
                      <td className="p-2 border">{item.horas} h</td>
                      <td className="p-2 border font-bold">
                        {item.utilization}%
                      </td>
                      <td className={`p-2 border font-bold ${statusColor}`}>
                        {statusText}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
