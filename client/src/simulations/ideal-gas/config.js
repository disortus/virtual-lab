import { IDEAL_GAS_BOUNDS } from './model.js';

export const idealGasConfig = {
  id: 'ideal-gas',
  code: 'EXP—07',
  branch: 'Термодинамика',
  branchKey: 'thermodynamics',
  title: 'Уравнение состояния идеального газа',
  shortTitle: 'Идеальный газ',
  formula: 'P·V = n·R·T',
  description:
    'Исследуйте связь давления, объёма, абсолютной температуры и количества вещества в цилиндре с подвижным поршнем.',
  quantities: ['P (кПа)', 'V (л)', 'T (К)', 'n (моль)'],
  defaultParams: {
    temperature: IDEAL_GAS_BOUNDS.temperature.default,
    volume: IDEAL_GAS_BOUNDS.volume.default,
    moles: IDEAL_GAS_BOUNDS.moles.default,
  },
  units: {
    temperature: 'К',
    volume: 'л',
    moles: 'моль',
    pressureKpa: 'кПа',
    pressureAtm: 'атм',
  },
  presets: [
    { label: 'Стандарт (300 К, 22.4 л, 1 моль)', params: { temperature: 300, volume: 22.4, moles: 1.0 } },
    { label: 'Сжатие вдвое (300 К, 11.2 л)', params: { temperature: 300, volume: 11.2, moles: 1.0 } },
    { label: 'Нагрев (600 К, 22.4 л)', params: { temperature: 600, volume: 22.4, moles: 1.0 } },
    { label: 'Высокая плотность (500 К, 10 л, 3 моль)', params: { temperature: 500, volume: 10, moles: 3.0 } },
  ],
  guided: {
    phenomenon:
      'Давление газа возникает из-за упругих соударений молекул со стенками сосуда и поршнем. При постоянном объёме рост температуры увеличивает скорость частиц, а уменьшение объёма при постоянной температуре повышает частоту ударов.',
    objective:
      'Проверить закон Бойля–Мариотта (P ~ 1/V при T = const) и закон Шарля (P ~ T при V = const) в уравнении Менделеева–Клапейрона.',
    researchQuestion:
      'Что произойдёт с давлением газа, если уменьшить объём сосуда ровно в 2 раза при неизменной температуре T и количестве вещества n?',
    hypothesisOptions: [
      { id: 'p_doubled', label: 'Давление увеличится ровно в 2 раза (обратная пропорциональность P ~ 1/V)' },
      { id: 'p_halved', label: 'Давление уменьшится в 2 раза' },
      { id: 'p_quadrupled', label: 'Давление вырастет в 4 раза' },
      { id: 'p_constant', label: 'Давление останется неизменным, так как температура постоянна' },
    ],
    analysisPromptHint:
      'Проверьте произведение P · V для двух замеров с разным объёмом при одинаковых T и n — остаётся ли оно постоянным?',
  },
  measurementColumns: [
    { key: 'temperature', label: 'T (К)' },
    { key: 'volume', label: 'V (л)' },
    { key: 'moles', label: 'n (моль)' },
    { key: 'pressureKpa', label: 'P (кПа)' },
    { key: 'pressureAtm', label: 'P (атм)' },
  ],
};
