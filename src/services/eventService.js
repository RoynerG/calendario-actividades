import axios from "axios";
const BASE_URL =
  "https://sucasainmobiliaria.com.co/calendario-actividades/index.php?action=";

export const listarEventos = () => axios.get(BASE_URL + "listar_eventos");
export const filtrarEventos = (filtros) =>
  axios.post(BASE_URL + "filtrar_eventos", filtros);
export const crearEvento = (evento) =>
  axios.post(BASE_URL + "crear_evento", evento);
export const obtenerEvento = (id) =>
  axios.post(BASE_URL + "obtener_evento", { id });
export const actualizarEvento = (evento) =>
  axios.post(BASE_URL + "actualizar_evento", evento);
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

export async function obtenerTicketsFuncionario(id_empleado) {
  const res = await axios.post(BASE_URL + "obtener_tickets_funcionario", {
    id_empleado,
  });
  return res.data;
}
