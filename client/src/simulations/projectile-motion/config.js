import { PROJECTILE_BOUNDS } from './model.js';

export const projectileMotionConfig = {
  id: 'projectile-motion',
  code: 'EXP—03',
  branch: 'Механика и динамика',
  branchKey: 'mechanics',
  title: 'Движение тела под углом к горизонту',
  shortTitle: 'Баллистика',
  formula: 'L = v₀²·sin(2α) / g',
  description:
    'Разложите движение снаряда на горизонтальную и вертикальную составляющие и найдите угол максимальной дальности.',
  defaultParams: {
    velocity: PROJECTILE_BOUNDS.velocity.default,
    angle: PROJECTILE_BOUNDS.angle.default,
    gravity: PROJECTILE_BOUNDS.gravity.default,
  },
  units: {
    velocity: 'м/с',
    angle: '°',
    gravity: 'м/с²',
    range: 'м',
    maxHeight: 'м',
    flightTime: 'с',
  },
  presets: [
    { label: 'Пологий 30°', params: { velocity: 25, angle: 30, gravity: 9.81 } },
    { label: 'Оптимум 45°', params: { velocity: 25, angle: 45, gravity: 9.81 } },
    { label: 'Навесной 60°', params: { velocity: 25, angle: 60, gravity: 9.81 } },
    { label: 'Лунный запуск (g = 1.62)', params: { velocity: 20, angle: 45, gravity: 1.62 } },
  ],
  guided: {
    phenomenon:
      'Баллистическая траектория представляет собой параболу: по горизонтали тело движется равномерно (vx = const), а по вертикали — равноускоренно под действием тяжести.',
    objective:
      'Определить, при каком угле запуска достигается максимальная дальность полёта и как симметричные углы (например, 30° и 60°) влияют на дальность и высоту.',
    researchQuestion:
      'При каком угле запуска (при одинаковых v₀ и g на ровной поверхности) дальность полёта будет максимальной?',
    hypothesisOptions: [
      { id: '45_deg', label: 'При 45°, потому что sin(2α) достигает максимума при 2α = 90°' },
      { id: '60_deg', label: 'При 60°, потому что тело дольше находится в воздухе' },
      { id: '30_deg', label: 'При 30°, потому что горизонтальная скорость vx больше' },
      { id: '75_deg', label: 'При 75°, потому что высота подъёма максимальна' },
    ],
    analysisPromptHint:
      'Сравните запуски при 30°, 45° и 60°: как соотносятся дальности L и максимальные высоты H при 30° и 60°?',
  },
  measurementColumns: [
    { key: 'velocity', label: 'v₀ (м/с)' },
    { key: 'angle', label: 'α (°)' },
    { key: 'range', label: 'L (м)' },
    { key: 'maxHeight', label: 'H (м)' },
    { key: 'flightTime', label: 'T (с)' },
  ],
};
