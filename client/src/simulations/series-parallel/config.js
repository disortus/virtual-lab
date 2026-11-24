import { SERIES_PARALLEL_BOUNDS } from './model.js';

export const seriesParallelConfig = {
  id: 'series-parallel',
  code: 'EXP—05',
  branch: 'Электричество и цепи',
  branchKey: 'electricity',
  title: 'Последовательное и параллельное соединение',
  shortTitle: 'Соединение резисторов',
  formula: 'R_посл = R₁+R₂ | 1/R_пар = 1/R₁+1/R₂',
  description:
    'Сравните общее сопротивление, распределение токов и падение напряжения в последовательной и параллельной цепях.',
  quantities: ['R_общ (Ом)', 'I_общ (А)', 'I₁, I₂ (А)', 'U₁, U₂ (В)'],
  defaultParams: {
    circuitType: 'series',
    voltage: SERIES_PARALLEL_BOUNDS.voltage.default,
    r1: SERIES_PARALLEL_BOUNDS.r1.default,
    r2: SERIES_PARALLEL_BOUNDS.r2.default,
    circuitClosed: true,
  },
  units: {
    voltage: 'В',
    r1: 'Ом',
    r2: 'Ом',
    rTotal: 'Ом',
    iTotal: 'А',
    i1: 'А',
    i2: 'А',
    v1: 'В',
    v2: 'В',
    pTotal: 'Вт',
  },
  presets: [
    { label: 'Последовательная (20 + 30 Ом)', params: { circuitType: 'series', voltage: 12, r1: 20, r2: 30, circuitClosed: true } },
    { label: 'Параллельная (20 || 30 Ом)', params: { circuitType: 'parallel', voltage: 12, r1: 20, r2: 30, circuitClosed: true } },
    { label: 'Равные ветви (40 || 40 Ом)', params: { circuitType: 'parallel', voltage: 12, r1: 40, r2: 40, circuitClosed: true } },
    { label: 'Контрастные R (10 || 90 Ом)', params: { circuitType: 'parallel', voltage: 12, r1: 10, r2: 90, circuitClosed: true } },
  ],
  guided: {
    phenomenon:
      'В последовательной цепи ток через все элементы одинаков, а напряжения складываются. В параллельной цепи напряжение на ветвях одинаково, а общий ток делится обратно пропорционально сопротивлениям.',
    objective:
      'Экспериментально сравнить общее сопротивление R_общ и общий ток I_общ при последовательном и параллельном подключении двух резисторов.',
    researchQuestion:
      'Как изменится общее сопротивление цепи и сила тока от источника, если те же резисторы R₁ и R₂ переключить с последовательного соединения на параллельное?',
    hypothesisOptions: [
      { id: 'r_down_i_up', label: 'Общее сопротивление резко уменьшится (станет меньше меньшего R), а общий ток вырастет' },
      { id: 'r_up_i_down', label: 'Общее сопротивление увеличится, а ток уменьшится' },
      { id: 'same_r', label: 'Общее сопротивление и ток не изменятся, так как резисторы те же' },
      { id: 'half_only', label: 'Сопротивление просто поделится ровно пополам при любых R₁ и R₂' },
    ],
    analysisPromptHint:
      'Сравните значения R_общ и I_общ в двух прогонах (последовательном и параллельном) при одинаковых U, R₁ и R₂.',
  },
  measurementColumns: [
    { key: 'circuitType', label: 'Схема' },
    { key: 'r1', label: 'R₁ (Ом)' },
    { key: 'r2', label: 'R₂ (Ом)' },
    { key: 'rTotal', label: 'R_общ (Ом)' },
    { key: 'iTotal', label: 'I_общ (А)' },
    { key: 'pTotal', label: 'P (Вт)' },
  ],
};
