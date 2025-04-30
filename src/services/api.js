import axios from "axios";

const API_URL =
  "https://sucasainmobiliaria.com.co/calendario-actividades/index.php";

export const fetchEventos = async () => {
  try {
    const response = await axios.get(`${API_URL}?action=listar_eventos`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los eventos:", error);
  }
};

export const crearEvento = async (eventoData) => {
  try {
    const response = await axios.get(`${API_URL}?action=crear_evento`, {
      params: eventoData,
    });
    return response.data;
  } catch (error) {
    console.error("Error al crear el evento:", error);
  }
};

export const actualizarEvento = async (eventoData) => {
  try {
    const response = await axios.get(`${API_URL}?action=actualizar_evento`, {
      params: eventoData,
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el evento:", error);
  }
};

export const eliminarEvento = async (id) => {
  try {
    const response = await axios.get(`${API_URL}?action=eliminar_evento`, {
      params: { id },
    });
    return response.data;
  } catch (error) {
    console.error("Error al eliminar el evento:", error);
  }
};

export const filtrarEventos = async (filtros) => {
  try {
    const response = await axios.get(`${API_URL}?action=filtrar_eventos`, {
      params: filtros,
    });
    return response.data;
  } catch (error) {
    console.error("Error al filtrar los eventos:", error);
  }
};
