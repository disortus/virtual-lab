export const PARAMETER_META = {
  voltage: { label: 'Напряжение источника', symbol: 'U', unit: 'В' },
  resistance: { label: 'Сопротивление резистора', symbol: 'R', unit: 'Ом' },
  circuitClosed: {
    label: 'Состояние ключа цепи',
    symbol: 'S',
    unit: '',
    format: (v) => (v ? 'Замкнута' : 'Разомкнута'),
  },
  chartMode: {
    label: 'Ось графика',
    symbol: 'f',
    unit: '',
    format: (v) => (v === 'I_vs_R' ? 'I(R)' : 'I(U)'),
  },
  height: { label: 'Начальная высота', symbol: 'h', unit: 'м' },
  gravity: { label: 'Ускорение свободного падения', symbol: 'g', unit: 'м/с²' },
  velocity: { label: 'Начальная скорость', symbol: 'v₀', unit: 'м/с' },
  angle: { label: 'Угол запуска', symbol: 'α', unit: '°' },
  incidentAngle: { label: 'Угол падения', symbol: 'θ₁', unit: '°' },
  n1: { label: 'Показатель преломления (среда 1)', symbol: 'n₁', unit: '' },
  n2: { label: 'Показатель преломления (среда 2)', symbol: 'n₂', unit: '' },
  circuitType: {
    label: 'Тип соединения',
    symbol: 'Схема',
    unit: '',
    format: (v) => (v === 'parallel' ? 'Параллельное' : 'Последовательное'),
  },
  r1: { label: 'Сопротивление R₁', symbol: 'R₁', unit: 'Ом' },
  r2: { label: 'Сопротивление R₂', symbol: 'R₂', unit: 'Ом' },
  mass: { label: 'Масса тела', symbol: 'm', unit: 'кг' },
  appliedForce: { label: 'Сила тяги', symbol: 'F_тяги', unit: 'Н' },
  frictionForce: { label: 'Сила трения', symbol: 'F_тр', unit: 'Н' },
  temperature: { label: 'Абсолютная температура', symbol: 'T', unit: 'К' },
  volume: { label: 'Объём сосуда', symbol: 'V', unit: 'л' },
  moles: { label: 'Количество вещества', symbol: 'n', unit: 'моль' },
  amplitude: { label: 'Амплитуда волн', symbol: 'A', unit: 'см' },
  frequency: { label: 'Частота колебаний', symbol: 'f', unit: 'Гц' },
  wavelength: { label: 'Длина волны', symbol: 'λ', unit: 'м' },
  phaseShift: { label: 'Разность фаз', symbol: 'Δφ', unit: '°' },
};

export function formatReportParameters(parameters = {}) {
  return Object.entries(parameters).map(([key, value]) => {
    const meta = PARAMETER_META[key];
    if (!meta) {
      return {
        key,
        label: key,
        symbol: key,
        formattedValue: String(value),
      };
    }
    const formatted = meta.format
      ? meta.format(value)
      : `${value}${meta.unit ? ` ${meta.unit}` : ''}`;

    return {
      key,
      label: meta.label,
      symbol: meta.symbol,
      formattedValue: formatted,
    };
  });
}
