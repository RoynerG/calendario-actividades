import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { listarCategorias } from "../services/eventService";

export default function GuiaCategorias({ buttonStyle }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 6;

  useEffect(() => {
    if (open) {
      cargarCategorias();
    }
  }, [open]);

  const cargarCategorias = async () => {
    setLoading(true);
    try {
      const res = await listarCategorias();
      if (res.success) {
        // Mapear los datos al formato que espera la tabla
        const data = res.data.map((cat) => ({
          categoria: cat.nombre,
          color: cat.color,
          descripcion: cat.descripcion || "Sin descripción",
        }));
        setRows(data);
      }
    } catch (error) {
      console.error("Error cargando categorías", error);
    } finally {
      setLoading(false);
    }
  };

  const pageCount = Math.ceil(rows.length / rowsPerPage);
  const handlePrev = () => setPage((p) => Math.max(p - 1, 0));
  const handleNext = () => setPage((p) => Math.min(p + 1, pageCount - 1));

  const displayRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <a href="#" style={buttonStyle} onClick={() => setOpen(true)}>
        Guía de categorías
      </a>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Guía de categorías - Para saber cuál escoger</DialogTitle>

        <DialogContent dividers>
          <Typography component="div" gutterBottom>
            {loading ? (
              <div className="text-center p-4">Cargando categorías...</div>
            ) : (
              <>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th className="px-6 py-3">Color</th>
                        <th className="px-6 py-3">Categoría</th>
                        <th className="px-6 py-3">¿Cuándo usar?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayRows.length > 0 ? (
                        displayRows.map((row, idx) => (
                          <tr
                            key={idx}
                            className="odd:bg-white dark:odd:bg-gray-900 even:bg-gray-50 dark:even:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
                          >
                            <td
                              style={{
                                padding: "20px",
                                backgroundColor: row.color,
                              }}
                            ></td>
                            <td className="px-6 py-4">{row.categoria}</td>
                            <td className="px-6 py-4">{row.descripcion}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center p-4">
                            No hay categorías registradas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Button onClick={handlePrev} disabled={page === 0}>
                    Anterior
                  </Button>
                  <span>
                    Página {page + 1} de {Math.max(1, pageCount)}
                  </span>
                  <Button onClick={handleNext} disabled={page + 1 >= pageCount}>
                    Siguiente
                  </Button>
                </div>
              </>
            )}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
