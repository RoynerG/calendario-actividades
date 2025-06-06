import Swal from "sweetalert2";
export const showSwal = ({ title, text, html, icon }) =>
  Swal.fire({
    title,
    text,
    html,
    icon,
    customClass: { container: "z-[100000]" },
  });
