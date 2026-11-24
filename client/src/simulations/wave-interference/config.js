import { WAVE_BOUNDS } from './model.js';

export const waveInterferenceConfig = {
  id: 'wave-interference',
  code: 'EXP—08',
  branch: 'Волны и колебания',
  branchKey: 'waves',
  title: 'Интерференция и суперпозиция волн',
  shortTitle: 'Интерференция волн',
  formula: 'y_рез = y₁ + y₂',
  description:
    'Наблюдайте сложение двух когерентных волн в реальном времени и исследуйте условия конструктивной и деструктивной интерференции.',
  quantities: ['A_рез (см)', 'Δφ (°)', 'v_волны (м/с)', 'λ (м)'],
  defaultParams: {
    amplitude: WAVE_BOUNDS.amplitude.default,
    frequency: WAVE_BOUNDS.frequency.default,
    wavelength: WAVE_BOUNDS.wavelength.default,
    phaseShift: WAVE_BOUNDS.phaseShift.default,
  },
  units: {
    amplitude: 'см',
    frequency: 'Гц',
    wavelength: 'м',
    phaseShift: '°',
    waveSpeed: 'м/с',
    resultantAmplitude: 'см',
  },
  presets: [
    { label: 'Конструктивная (Δφ = 0°)', params: { amplitude: 1.5, frequency: 1.5, wavelength: 3.0, phaseShift: 0 } },
    { label: 'Деструктивная (Δφ = 180°)', params: { amplitude: 1.5, frequency: 1.5, wavelength: 3.0, phaseShift: 180 } },
    { label: 'Сдвиг на 90°', params: { amplitude: 1.5, frequency: 1.5, wavelength: 3.0, phaseShift: 90 } },
    { label: 'Полный цикл (Δφ = 360°)', params: { amplitude: 2.0, frequency: 2.0, wavelength: 2.4, phaseShift: 360 } },
  ],
  guided: {
    phenomenon:
      'По принципу суперпозиции смещение среды равно сумме смещений от каждой волны (y_рез = y₁ + y₂). В зависимости от разности фаз Δφ волны либо взаимно усиливаются, либо гасят друг друга.',
    objective:
      'Установить, при каких разностях фаз Δφ возникает конструктивная (максимальное усиление) и деструктивная (взаимное гашение) интерференция.',
    researchQuestion:
      'Какой должна быть разность фаз Δφ двух одинаковых волн амплитудой A, чтобы результирующая волна полностью погасла (A_рез = 0)?',
    hypothesisOptions: [
      { id: '180_deg', label: 'Δφ = 180° (π радиан) — гребень одной волны совпадает со впадиной другой' },
      { id: '0_deg', label: 'Δφ = 0° — волны полностью гасят друг друга' },
      { id: '90_deg', label: 'Δφ = 90° — всегда даёт нулевую амплитуду' },
      { id: 'never_zero', label: 'Две волны никогда не могут ослабить друг друга' },
    ],
    analysisPromptHint:
      'Сравните результирующую амплитуду при Δφ = 0°, 90° и 180° на осциллографе и графике A_рез(Δφ).',
  },
  measurementColumns: [
    { key: 'amplitude', label: 'A (см)' },
    { key: 'wavelength', label: 'λ (м)' },
    { key: 'phaseShift', label: 'Δφ (°)' },
    { key: 'resultantAmplitude', label: 'A_рез (см)' },
    { key: 'waveSpeed', label: 'v (м/с)' },
  ],
};
