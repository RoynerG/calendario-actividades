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
