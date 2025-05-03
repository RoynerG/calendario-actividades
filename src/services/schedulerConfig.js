// schedulerConfig.js

const schedulerConfig = {
  week: {
    weekDays: [0, 1, 2, 3, 4, 5, 6],
    startHour: 8,
    endHour: 19,
    step: 60,
    navigation: true,
    disableGoToDay: false,
  },
  day: {
    startHour: 8,
    endHour: 19,
    step: 60,
    navigation: true,
  },
};

export default schedulerConfig;
