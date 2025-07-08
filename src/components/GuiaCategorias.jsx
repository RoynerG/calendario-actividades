import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";

export default function GuiaCategorias({ buttonStyle }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 6;

  // Define aquí todas tus filas de datos
  const rows = [
    {
      color: "#FA6A19",
      categoria: "Actividad contractual",
      descripcion: "Cuando son actividades contractuales.",
    },
    {
      color: "#1E90FF",
      categoria: "Actividad comercial",
      descripcion: "Cuando son actividades comerciales.",
    },
    {
      color: "#D50B8B",
      categoria: "Cita con cliente",
      descripcion:
        "Cuando se mostrarán inmuebles cotizados, documentos, aclaraciones con el cliente.",
    },
    {
      color: "#3CB371",
      categoria: "Actualización de inmueble",
      descripcion:
        "Cuando se irá a ver, llamar al propietario de un inmueble para toma de nuevas fotos, actualización de información y retoque de avisos.",
    },
    {
      color: "#8A2BE2",
      categoria: "Ruta",
      descripcion:
        "Cuando se realiza un recorrido buscando nuevas oportunidades inmobiliarias.",
    },
    {
      color: "#00FFFF",
      categoria: "Contactando precaptaciones",
      descripcion:
        "Es cuando el funcionario dedica tiempo para contactar a los propietarios de cada una de las oportunidades encontradas.",
    },
    {
      color: "#7FFF00",
      categoria: "Vinculacion club PPH",
      descripcion:
        "Corresponde a las llamadas que realizan con el fin de robusteser al club PPH, asi como Tambien para solicitar información de requerimiento inmobiliarios a los miembros del club. ",
    },
    {
      color: "#E6E6FA",
      categoria: "Avisos",
      descripcion:
        "Corresponde al tiempo que se emplea para pegar los avisos de fachada de los inmuebles captados.",
    },
    {
      color: "#FF6EC7",
      categoria: "Contrato",
      descripcion:
        "Corresponde al tiempo que se emplea para realizar contrato de mandato, hojas de cierres y todas aquellas actividades en torno al cierre del negocio.",
    },
    {
      color: "#B0C4DE",
      categoria: "Otros",
      descripcion:
        "Aquellas actividades no especificadas en las categorias de opciones",
    },
    {
      color: "#fa8d3b",
      categoria: "Revisión correctiva",
      descripcion:
        "Cuando se agenda una visita de inspeccion del estado del inmueble o daño notificado.",
    },
    {
      color: "#ec3d22",
      categoria: "Revisión preventiva",
      descripcion:
        "Cuando se realiza una visita para la inspeccion anual del estado del inmueble.",
    },
    {
      color: "#003e4f",
      categoria: "Entrega de inmueble",
      descripcion:
        "Cuando se realiza la entrega del inmueble a un nuevo contrato.",
    },
    {
      color: "#992c4b",
      categoria: "Recibo de inmueble",
      descripcion: "Cuando se recibe el inmueble de un contrato finalizado.",
    },
    {
      color: "#556B2F",
      categoria: "Diligencia",
      descripcion:
        "Cuando se va a realizar un favor, una actividad complementaria.",
    },
    {
      color: "#FF0000",
      categoria: "Cartera",
      descripcion:
        "Todas las actividades relacionadas con cartera, recaudos, siniestros etc.",
    },
    {
      color: "#6e3447",
      categoria: "Asuntos personales",
      descripcion:
        "Todas las actividades personales, familiriares, calamidades, educación.",
    },
    {
      color: "#000000",
      categoria: "Cita medica",
      descripcion:
        "Todas las actividades relacionadas con salud, medicina, operacion, etc.",
    },
    {
      color: "#309898",
      categoria: "Pagos",
      descripcion:
        "Todas las actividades relacionadas con pagos a proveedores, funcionarios, clientes etc.",
    },
    {
      color: "#443627",
      categoria: "Auditoria",
      descripcion:
        "Todas las auditorias hacia consultores o cargos dependientes.",
    },
    {
      color: "#8E1616",
      categoria: "Desarrollo",
      descripcion:
        "Todas las actividades relacionadas con desarrollo, implementacion de proyectos nuevos, creacion de estrategias, etc.",
    },
    {
      color: "#3D90D7",
      categoria: "Mercadeo",
      descripcion:
        "Todas las actividades relacionadas con marketing, redes sociales, publicidad, piezas.",
    },
    {
      color: "#102E50",
      categoria: "Captacion",
      descripcion:
        "Cuando se ingresa un nuevo inmueble a nuestro portal inmobiliaria, desde toma de datos o visita para toma de fotos y videos.",
    },
    {
      color: "#D98324",
      categoria: "Capacitacion",
      descripcion:
        "Todas las actividades relacionadas salud en el trabajo, cursos, talleres, charlas etc.",
    },
    {
      color: "#FFB22C",
      categoria: "Incapacidad",
      descripcion:
        "Todas las actividades relacionadas de incapacidad laboral y enfermad.",
    },
    {
      color: "#BDC3C7",
      categoria: "Llaves",
      descripcion:
        "Todas las actividades relacionadas con recoger y entregar llaves.",
    },
  ];

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
                  {displayRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="odd:bg-white dark:odd:bg-gray-900 even:bg-gray-50 dark:even:bg-gray-800 border-b dark:border-gray-700 border-gray-200"
                    >
                      <td
                        style={{ padding: "20px", backgroundColor: row.color }}
                      ></td>
                      <td className="px-6 py-4">{row.categoria}</td>
                      <td className="px-6 py-4">{row.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <Button onClick={handlePrev} disabled={page === 0}>
                Anterior
              </Button>
              <span>
                Página {page + 1} de {pageCount}
              </span>
              <Button onClick={handleNext} disabled={page + 1 === pageCount}>
                Siguiente
              </Button>
            </div>
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
