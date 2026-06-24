import Swal from "sweetalert2";

export const swalBaseClasses = {
  container: "z-[200000]",
  popup:
    "rounded-2xl shadow-2xl border border-gray-100 bg-white dark:bg-slate-800 dark:border-slate-700",
  title: "text-gray-900 dark:text-gray-100",
  htmlContainer: "text-gray-600 dark:text-gray-300",
  input:
    "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-gray-400 dark:text-white",
  confirmButton:
    "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg",
  cancelButton:
    "bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-gray-100",
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
