import { round, sanitizeNumber } from '../utils.js';

export const OHMS_BOUNDS = {
  voltage: { min: 1, max: 24, default: 12, step: 0.5 },
  resistance: { min: 1, max: 100, default: 20, step: 1 },
};

/**
 * Computes electrical circuit quantities using Ohm's Law (I = U / R) and Joule's Law (P = U * I).
 */
export function calculateOhmsLaw(params = {}) {
  const voltage = round(
    sanitizeNumber(params.voltage, OHMS_BOUNDS.voltage.default, OHMS_BOUNDS.voltage.min, OHMS_BOUNDS.voltage.max),
    2
  );
  const resistance = round(
    sanitizeNumber(
      params.resistance,
      OHMS_BOUNDS.resistance.default,
      OHMS_BOUNDS.resistance.min,
      OHMS_BOUNDS.resistance.max
    ),
    2
  );
  const circuitClosed = params.circuitClosed !== undefined ? Boolean(params.circuitClosed) : true;

  const current = circuitClosed ? round(voltage / resistance, 4) : 0;
  const power = circuitClosed ? round(voltage * current, 3) : 0;

  let thermalLoad = 'idle';
  if (circuitClosed) {
    if (power >= 25) thermalLoad = 'high';
    else if (power >= 8) thermalLoad = 'moderate';
    else thermalLoad = 'nominal';
  }

  return {
    voltage,
    resistance,
    circuitClosed,
    current,
    power,
    thermalLoad,
    status: circuitClosed ? 'closed' : 'open',
  };
}

/**
 * Generates curve data for I(U) at fixed R or I(R) at fixed U.
 */
export function generateOhmsChartSeries({ voltage, resistance, chartMode = 'I_vs_U' }) {
  const safeU = sanitizeNumber(voltage, OHMS_BOUNDS.voltage.default, OHMS_BOUNDS.voltage.min, OHMS_BOUNDS.voltage.max);
  const safeR = sanitizeNumber(
    resistance,
    OHMS_BOUNDS.resistance.default,
    OHMS_BOUNDS.resistance.min,
    OHMS_BOUNDS.resistance.max
  );

  if (chartMode === 'I_vs_R') {
    const points = [];
    for (let r = 2; r <= 100; r += 2) {
      points.push({ x: r, y: round(safeU / r, 4) });
    }
    return {
      xLabel: 'Сопротивление R (Ом)',
      yLabel: 'Сила тока I (А)',
      title: `Зависимость I(R) при U = ${round(safeU, 1)} В`,
      points,
      operatingPoint: { x: round(safeR, 2), y: round(safeU / safeR, 4) },
    };
  }

  const points = [];
  for (let u = 1; u <= 24; u += 1) {
    points.push({ x: u, y: round(u / safeR, 4) });
  }
  return {
    xLabel: 'Напряжение U (В)',
    yLabel: 'Сила тока I (А)',
    title: `Зависимость I(U) при R = ${round(safeR, 1)} Ом`,
    points,
    operatingPoint: { x: round(safeU, 2), y: round(safeU / safeR, 4) },
  };
}
