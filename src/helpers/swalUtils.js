import Swal from "sweetalert2";

export const swalBaseClasses = {
  container: "z-[200000]",
  popup: "rounded-2xl shadow-2xl border border-gray-100",
  title: "text-gray-900",
  htmlContainer: "text-gray-600",
  confirmButton:
    "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg",
  cancelButton:
    "bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg",
  denyButton:
    "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg",
};

export const swalBaseOptions = {
  customClass: swalBaseClasses,
  buttonsStyling: false,
};

export const showSwal = ({ title, text, html, icon }) =>
  Swal.fire({
    title,
    text,
    html,
    icon,
    ...swalBaseOptions,
  });
