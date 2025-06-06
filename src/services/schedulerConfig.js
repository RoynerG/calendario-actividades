const schedulerConfig = {
  week: {
    weekDays: [0, 1, 2, 3, 4, 5, 6],
    startHour: 8,
    endHour: 22,
    step: 60,
    navigation: true,
    disableGoToDay: false,
  },
  day: {
    startHour: 8,
    endHour: 22,
    step: 60,
    navigation: true,
  },
  navigation: {
    month: "Mes",
    week: "Semana",
    day: "Día",
    today: "Hoy",
    agenda: "Agenda",
  },
  form: {
    addTitle: "Agregar evento",
    editTitle: "Editar evento",
    confirm: "Confirmar",
    delete: "Eliminar",
    cancel: "Cancelar",
  },
  event: {
    title: "Título",
    subtitle: "Subtítulo",
    start: "Inicio",
    end: "Fin",
    allDay: "Todo el día",
  },
  validation: {
    required: "Requerido",
    invalidEmail: "Correo electrónico inválido",
    onlyNumbers: "Solo se permiten números",
    min: "Mínimo {{min}} caracteres",
    max: "Máximo {{max}} caracteres",
  },
  moreEvents: "Más...",
  noDataToDisplay: "No hay eventos para mostrar",
  loading: "Cargando...",
};

export default schedulerConfig;
