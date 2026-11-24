import { FREE_FALL_BOUNDS } from './model.js';

export const freeFallConfig = {
  id: 'free-fall',
  code: 'EXP—02',
  branch: 'Механика и кинематика',
  branchKey: 'mechanics',
  title: 'Свободное падение тела',
  shortTitle: 'Свободное падение',
  formula: 's = g·t² / 2',
  description:
    'Изучите равноускоренное движение тела в поле тяжести без сопротивления воздуха и сравните падение на разных планетах.',
  defaultParams: {
    height: FREE_FALL_BOUNDS.height.default,
    gravity: FREE_FALL_BOUNDS.gravity.default,
  },
  units: {
    height: 'м',
    gravity: 'м/с²',
    time: 'с',
    velocity: 'м/с',
    distanceFallen: 'м',
  },
  presets: [
    { label: 'Луна (g = 1.62 м/с²)', params: { height: 80, gravity: 1.62 } },
    { label: 'Марс (g = 3.72 м/с²)', params: { height: 80, gravity: 3.72 } },
    { label: 'Земля (g = 9.81 м/с²)', params: { height: 80, gravity: 9.81 } },
    { label: 'Юпитер (g = 24.79 м/с²)', params: { height: 80, gravity: 24.79 } },
  ],
  guided: {
    phenomenon:
      'Под действием постоянной силы тяжести тело падает с постоянным ускорением g: его скорость растёт линейно со временем, а пройденный путь — пропорционально квадрату времени.',
    objective:
      'Исследовать зависимость времени падения и скорости при ударе от начальной высоты и ускорения свободного падения.',
    researchQuestion:
      'Если увеличить начальную высоту падения в 4 раза при постоянном g, как изменится время падения?',
    hypothesisOptions: [
      { id: 'double_time', label: 'Время падения увеличится в 2 раза (квадратичная зависимость s ~ t²)' },
      { id: 'quadruple_time', label: 'Время падения увеличится в 4 раза (линейная зависимость)' },
      { id: 'half_time', label: 'Время падения уменьшится в 2 раза' },
      { id: 'same_time', label: 'Время падения не зависит от высоты' },
    ],
    analysisPromptHint:
      'Сравните время падения и форму кривых h(t) и v(t) для двух различных высот или двух разных планет.',
  },
  measurementColumns: [
    { key: 'height', label: 'h (м)' },
    { key: 'gravity', label: 'g (м/с²)' },
    { key: 'totalTime', label: 't (с)' },
    { key: 'impactVelocity', label: 'v_уд (м/с)' },
  ],
};
