import { REFRACTION_BOUNDS } from './model.js';

export const MEDIA_PRESETS = [
  { name: 'Воздух', n: 1.0 },
  { name: 'Вода', n: 1.33 },
  { name: 'Стекло', n: 1.5 },
  { name: 'Алмаз', n: 2.42 },
];

export const refractionConfig = {
  id: 'refraction',
  code: 'EXP—04',
  branch: 'Оптика',
  branchKey: 'optics',
  title: 'Преломление света и полное внутреннее отражение',
  shortTitle: 'Преломление света',
  formula: 'n₁·sin(θ₁) = n₂·sin(θ₂)',
  description:
    'Исследуйте закон Снеллиуса на границе двух прозрачных сред и найдите критический угол полного внутреннего отражения.',
  quantities: ['θ₁ (°)', 'θ₂ (°)', 'θ_кр (°)', 'n₁, n₂'],
  defaultParams: {
    incidentAngle: REFRACTION_BOUNDS.incidentAngle.default,
    n1: REFRACTION_BOUNDS.n1.default,
    n2: REFRACTION_BOUNDS.n2.default,
  },
  units: {
    incidentAngle: '°',
    refractedAngle: '°',
    reflectedAngle: '°',
    criticalAngle: '°',
    n1: '',
    n2: '',
  },
  presets: [
    { label: 'Воздух → Стекло (1.00 → 1.50)', params: { n1: 1.0, n2: 1.5, incidentAngle: 35 } },
    { label: 'Воздух → Вода (1.00 → 1.33)', params: { n1: 1.0, n2: 1.33, incidentAngle: 40 } },
    { label: 'Вода → Воздух (крит. ≈ 48.8°)', params: { n1: 1.33, n2: 1.0, incidentAngle: 45 } },
    { label: 'Стекло → Воздух ПВО (50°)', params: { n1: 1.5, n2: 1.0, incidentAngle: 50 } },
  ],
  guided: {
    phenomenon:
      'При переходе света из одной среды в другую меняется скорость волны, из-за чего луч изменяет направление. При переходе из оптически более плотной среды в менее плотную (n₁ > n₂) существует критический угол полного внутреннего отражения.',
    objective:
      'Проверить закон Снеллиуса и определить условия возникновения полного внутреннего отражения (ПВО).',
    researchQuestion:
      'При каком соотношении показателей преломления n₁ и n₂ возможно полное внутреннее отражение света?',
    hypothesisOptions: [
      { id: 'n1_gt_n2', label: 'Только когда n₁ > n₂ и угол падения достигает критического значения' },
      { id: 'n2_gt_n1', label: 'Только когда n₂ > n₁ и луч входит в более плотную среду' },
      { id: 'any_media', label: 'При любых n₁ и n₂, если угол падения больше 45°' },
      { id: 'n1_eq_n2', label: 'Только когда показатели преломления равны (n₁ = n₂)' },
    ],
    analysisPromptHint:
      'Сравните поведение преломлённого луча до критического угла и после его превышения при n₁ = 1.50, n₂ = 1.00.',
  },
  measurementColumns: [
    { key: 'n1', label: 'n₁' },
    { key: 'n2', label: 'n₂' },
    { key: 'incidentAngle', label: 'θ₁ (°)' },
    { key: 'refractedAngle', label: 'θ₂ (°)' },
    { key: 'criticalAngle', label: 'θ_кр (°)' },
  ],
};
