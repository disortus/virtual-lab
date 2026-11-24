import { NEWTON_BOUNDS } from './model.js';

export const newtonsSecondLawConfig = {
  id: 'newtons-second-law',
  code: 'EXP—06',
  branch: 'Механика и движение',
  branchKey: 'mechanics',
  title: 'Второй закон Ньютона (F = m·a)',
  shortTitle: 'Второй закон Ньютона',
  formula: 'a = (F_тяги − F_тр) / m',
  description:
    'Исследуйте связь равнодействующей силы, массы тележки и её ускорения на горизонтальной направляющей с трением.',
  quantities: ['F_рез (Н)', 'a (м/с²)', 'm (кг)', 'v(t) (м/с)'],
  defaultParams: {
    mass: NEWTON_BOUNDS.mass.default,
    appliedForce: NEWTON_BOUNDS.appliedForce.default,
    frictionForce: NEWTON_BOUNDS.frictionForce.default,
  },
  units: {
    mass: 'кг',
    appliedForce: 'Н',
    frictionForce: 'Н',
    netForce: 'Н',
    acceleration: 'м/с²',
    velocity: 'м/с',
    displacement: 'м',
  },
  presets: [
    { label: 'Стандарт (10 кг, 60 Н, трение 20 Н)', params: { mass: 10, appliedForce: 60, frictionForce: 20 } },
    { label: 'Без трения (10 кг, 60 Н)', params: { mass: 10, appliedForce: 60, frictionForce: 0 } },
    { label: 'Порог трения (40 Н vs 40 Н)', params: { mass: 10, appliedForce: 40, frictionForce: 40 } },
    { label: 'Тяжёлая тележка (40 кг, 120 Н)', params: { mass: 40, appliedForce: 120, frictionForce: 20 } },
  ],
  guided: {
    phenomenon:
      'Ускорение тела прямо пропорционально равнодействующей приложенных сил и обратно пропорционально его массе. Если тяга не превышает силу трения покоя, равнодействующая равна нулю и тело остаётся на месте.',
    objective:
      'Установить, как ускорение a зависит от массы m и равнодействующей силы F_рез = F_тяги − F_тр.',
    researchQuestion:
      'Если при неизменной равнодействующей силе F_рез увеличить массу тела в 2 раза, что произойдёт с ускорением?',
    hypothesisOptions: [
      { id: 'a_halved', label: 'Ускорение уменьшится в 2 раза (обратная пропорциональность массе)' },
      { id: 'a_doubled', label: 'Ускорение увеличится в 2 раза' },
      { id: 'a_same', label: 'Ускорение не изменится, так как сила прежняя' },
      { id: 'a_zero', label: 'Тело остановится сразу при увеличении массы' },
    ],
    analysisPromptHint:
      'Сравните ускорения из двух прогонов при одинаковой F_рез и разной массе, а также проверьте случай F_тяги ≤ F_тр.',
  },
  measurementColumns: [
    { key: 'mass', label: 'm (кг)' },
    { key: 'appliedForce', label: 'F_тяги (Н)' },
    { key: 'frictionForce', label: 'F_тр (Н)' },
    { key: 'netForce', label: 'F_рез (Н)' },
    { key: 'acceleration', label: 'a (м/с²)' },
  ],
};
