import { OHMS_BOUNDS } from './model.js';

export const ohmsLawConfig = {
  id: 'ohms-law',
  code: 'EXP—01',
  branch: 'Электричество и цепи',
  branchKey: 'electricity',
  title: 'Закон Ома для участка цепи',
  shortTitle: 'Закон Ома',
  formula: 'I = U / R',
  description:
    'Исследуйте, как сила тока и мощность зависят от напряжения источника и сопротивления резистора в замкнутой цепи.',
  quantities: ['I (А)', 'U (В)', 'R (Ом)', 'P (Вт)'],
  defaultParams: {
    voltage: OHMS_BOUNDS.voltage.default,
    resistance: OHMS_BOUNDS.resistance.default,
    circuitClosed: true,
    chartMode: 'I_vs_U',
  },
  units: {
    voltage: 'В',
    resistance: 'Ом',
    current: 'А',
    power: 'Вт',
  },
  presets: [
    { label: 'Стандарт (12 В / 20 Ом)', params: { voltage: 12, resistance: 20, circuitClosed: true } },
    { label: 'Высокое R (12 В / 80 Ом)', params: { voltage: 12, resistance: 80, circuitClosed: true } },
    { label: 'Низкое R (12 В / 5 Ом)', params: { voltage: 12, resistance: 5, circuitClosed: true } },
    { label: 'Макс. напряжение (24 В / 20 Ом)', params: { voltage: 24, resistance: 20, circuitClosed: true } },
  ],
  guided: {
    phenomenon:
      'В замкнутой электрической цепи под действием напряжения возникает направленное движение зарядов — электрический ток, интенсивность которого ограничивается сопротивлением проводника.',
    objective:
      'Установить математическую и физическую зависимость силы тока I от напряжения U и сопротивления R на участке цепи.',
    researchQuestion:
      'Что произойдёт с силой тока, если увеличить сопротивление резистора при неизменном напряжении источника?',
    hypothesisOptions: [
      { id: 'decrease_inverse', label: 'Сила тока уменьшится обратно пропорционально сопротивлению' },
      { id: 'increase_linear', label: 'Сила тока увеличится пропорционально сопротивлению' },
      { id: 'constant', label: 'Сила тока останется неизменной, так как напряжение не менялось' },
      { id: 'zero', label: 'Ток сразу упадёт до нуля при любом росте сопротивления' },
    ],
    analysisPromptHint:
      'Сравните два замера при одном и том же напряжении: во сколько раз изменилось сопротивление и во сколько раз изменилась сила тока?',
  },
  measurementColumns: [
    { key: 'voltage', label: 'U (В)' },
    { key: 'resistance', label: 'R (Ом)' },
    { key: 'current', label: 'I (А)' },
    { key: 'power', label: 'P (Вт)' },
  ],
};
