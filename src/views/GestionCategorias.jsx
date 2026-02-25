import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  actualizarEsquemaCategorias,
} from "../services/eventService";
import { FaPlus, FaEdit, FaTrash, FaDatabase } from "react-icons/fa";

export default function GestionCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    nombre: "",
    color: "#000000",
    descripcion: "",
    roles_notificar: "",
  });

  useEffect(() => {
    // Primero actualizar esquema, luego cargar categorías
    actualizarEsquemaCategorias()
      .then((res) => {
        console.log("Schema update:", res);
        loadCategorias();
      })
      .catch((err) => {
        console.error("Schema update error:", err);
        // Intentar cargar de todos modos
        loadCategorias();
      });
  }, []);

  const loadCategorias = async () => {
    setLoading(true);
    try {
      const res = await listarCategorias();
      if (res.success) {
        setCategorias(res.data);
      } else {
        Swal.fire("Error", "No se pudieron cargar las categorías", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({
        nombre: cat.nombre,
        color: cat.color,
        descripcion: cat.descripcion || "",
        roles_notificar: cat.roles_notificar || "",
      });
    } else {
      setEditingCat(null);
      setFormData({
        nombre: "",
        color: "#000000",
        descripcion: "",
        roles_notificar: "",
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCat(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingCat) {
        res = await actualizarCategoria({ ...formData, id: editingCat.id });
      } else {
        res = await crearCategoria(formData);
      }

      if (res.success) {
        Swal.fire(
          "Éxito",
          `Categoría ${editingCat ? "actualizada" : "creada"} correctamente`,
          "success"
        );
        handleCloseModal();
        loadCategorias();
      } else {
        Swal.fire("Error", res.message || "Ocurrió un error", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Error al guardar", "error");
    }
  };

  const handleDelete = async (cat) => {
    const result = await Swal.fire({
      title: `¿Eliminar categoría "${cat.nombre}"?`,
      text: "Esto eliminará TODOS los eventos asociados a esta categoría. Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar todo",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const res = await eliminarCategoria(cat.id);
        if (res.success) {
          Swal.fire(
            "Eliminado",
            "La categoría y sus eventos han sido eliminados.",
            "success"
          );
          loadCategorias();
        } else {
          Swal.fire("Error", "No se pudo eliminar la categoría.", "error");
        }
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Error al eliminar", "error");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Categorías
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              <FaPlus /> Nueva Categoría
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="p-3 border-b">ID</th>
                  <th className="p-3 border-b">Color</th>
                  <th className="p-3 border-b">Nombre</th>
                  <th className="p-3 border-b">Roles a Notificar</th>
                  <th className="p-3 border-b">Descripción</th>
                  <th className="p-3 border-b text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 border-b">
                    <td className="p-3">{cat.id}</td>
                    <td className="p-3">
                      <div
                        className="w-8 h-8 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: cat.color }}
                        title={cat.color}
                      ></div>
                    </td>
                    <td className="p-3 font-medium">{cat.nombre}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {cat.roles_notificar ? (
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                          {cat.roles_notificar}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Ninguno</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-600 text-sm">
                      {cat.descripcion || "Sin descripción"}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="Editar"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Eliminar (Cuidado)"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categorias.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      No hay categorías registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingCat ? "Editar Categoría" : "Nueva Categoría"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Color
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    required
                    className="h-10 w-20 p-0 border border-gray-300 rounded cursor-pointer"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                  />
                  <span className="text-gray-500 text-sm">
                    {formData.color}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Roles a notificar
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  value={formData.roles_notificar}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roles_notificar: e.target.value,
                    })
                  }
                  placeholder="Ej: Gerencia, Comercial, Soporte"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separa los roles por comas. (Roles disponibles en el sistema)
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Descripción (Guía de uso)
                </label>
                <textarea
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                  rows="3"
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  placeholder="Explica cuándo se debe usar esta categoría..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
