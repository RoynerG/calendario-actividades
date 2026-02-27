import axios from "axios";
const BASE_URL =
  "https://sucasainmobiliaria.com.co/calendario-actividades/index.php?action=";

export const listarEventos = () => axios.get(BASE_URL + "listar_eventos");
export const filtrarEventos = (filtros) =>
  axios.post(BASE_URL + "filtrar_eventos", filtros);
export const filtrarEventosAdmin = (filtros) =>
  axios.post(BASE_URL + "filtrar_eventos_admin", filtros);
export const obtenerReporteEventos = (filtros) =>
  axios.post(BASE_URL + "reporte_eventos", filtros);
export const crearEvento = (evento) =>
  axios.post(BASE_URL + "crear_evento", evento);
export const crearEventos = (payload) =>
  axios.post(BASE_URL + "crear_eventos", payload).then((res) => res.data);
export const crearRecordatorioLibre = (payload) =>
  axios.post(BASE_URL + "crear_recordatorio_libre", payload).then((res) => res.data);
export async function obtenerEvento(id) {
  const res = await axios.post(BASE_URL + "obtener_evento", { id });
  return res.data.data;
}
export const eliminarEvento = (id) =>
  axios.post(BASE_URL + "eliminar_evento", { id });

export async function listarCategorias() {
  const res = await fetch(BASE_URL + "listar_categorias");
  return await res.json();
}

export async function listarFuncionarios() {
  const res = await fetch(BASE_URL + "listar_funcionarios");
  return await res.json();
}

export async function listarFuncionariosAdmin() {
  const res = await fetch(BASE_URL + "listar_funcionarios_admin");
  return await res.json();
}

export async function listarTickets() {
  const res = await fetch(BASE_URL + "listar_tickets");
  return await res.json();
}

export async function obtenerFuncionario(id) {
  const res = await axios.post(BASE_URL + "obtener_funcionario", { id });
  return res.data;
}

export async function obtenerCategoria(id) {
  const res = await axios.post(BASE_URL + "obtener_categoria", { id });
  return res.data;
}

export async function crearCategoria(categoria) {
  const res = await axios.post(BASE_URL + "crear_categoria", categoria);
  return res.data;
}

export async function actualizarCategoria(categoria) {
  const res = await axios.post(BASE_URL + "actualizar_categoria", categoria);
  return res.data;
}

export async function eliminarCategoria(id) {
  const res = await axios.post(BASE_URL + "eliminar_categoria", { id });
  return res.data;
}

export async function actualizarEsquemaCategorias() {
  const res = await fetch(BASE_URL + "actualizar_esquema_categorias");
  return await res.json();
}

export async function obtenerTicketsFuncionario(id_empleado) {
  const res = await axios.post(BASE_URL + "obtener_tickets_funcionario", {
    id_empleado,
  });
  return res.data;
}

export async function obtenerTicket(id_ticket) {
  const res = await axios.post(BASE_URL + "obtener_ticket", {
    id_ticket,
  });
  return res.data;
}

export async function cambiarEstadoEvento(id_evento, observacion) {
  const { data } = await axios.post(BASE_URL + "cambiar_estado", {
    id_evento,
    observacion,
  });
  return data;
}

export async function trasladarEvento(
  id_evento,
  fecha_inicio,
  fecha_fin,
  observacion,
  es_cita,
  descripcion
) {
  const { data } = await axios.post(BASE_URL + "trasladar_evento", {
    id_evento,
    fecha_inicio,
    fecha_fin,
    observacion,
    es_cita,
    descripcion,
  });
  return data;
}

export async function actualizarEvento(
  id,
  titulo,
  descripcion,
  ubicacion,
  id_categoria
) {
  const { data } = await axios.post(BASE_URL + "actualizar_evento", {
    id,
    titulo,
    descripcion,
    ubicacion,
    id_categoria,
  });
  return data;
}

export async function obtenerHistorialEvento(id_evento) {
  const { data } = await axios.post(BASE_URL + "obtener_historial", {
    id_evento,
  });
  return data;
}

export async function verificarBloqueo(id_empleado) {
  const { data } = await axios.post(BASE_URL + "verificar_bloqueo", {
    id_empleado,
  });
  return data;
}

export async function listarBloqueos() {
  const { data } = await axios.get(BASE_URL + "listar_bloqueos");
  return data;
}

// === SEGUIMIENTO DE ACTIVIDADES ===

export async function crearSeguimiento(
  detalle,
  usuario,
  id_evento = null,
  tipo = "evento",
  id_funcionario = null,
  id_autor = null
) {
  const { data } = await axios.post(BASE_URL + "crear_seguimiento", {
    detalle,
    usuario,
    id_evento,
    tipo,
    id_funcionario,
    id_autor,
  });
  return data;
}

export async function listarPendientesVencidos(id_empleado) {
  const { data } = await axios.post(BASE_URL + "listar_pendientes_vencidos", {
    id_empleado,
  });
  return data;
}

export async function listarSeguimientosEvento(id_evento) {
  const { data } = await axios.post(BASE_URL + "listar_seguimientos_evento", {
    id_evento,
  });
  return data;
}

export async function listarSeguimientosFuncionario(id_funcionario) {
  const { data } = await axios.post(
    BASE_URL + "listar_seguimientos_funcionario",
    {
      id_funcionario,
    }
  );
  return data;
}

export async function listarSeguimientosGlobales() {
  const { data } = await axios.get(BASE_URL + "listar_seguimientos_globales");
  return data;
}

export async function listarTodosSeguimientos() {
  const { data } = await axios.get(BASE_URL + "listar_todos_seguimientos");
  return data;
}
