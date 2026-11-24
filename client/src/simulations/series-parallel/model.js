import { round, sanitizeNumber } from '../utils.js';

export const SERIES_PARALLEL_BOUNDS = {
  voltage: { min: 1, max: 24, default: 12, step: 0.5 },
  r1: { min: 2, max: 100, default: 20, step: 1 },
  r2: { min: 2, max: 100, default: 30, step: 1 },
};

/**
 * Computes equivalent resistance, total current, branch currents, and voltage drops
 * for series (R_total = R1 + R2) and parallel (1/R_total = 1/R1 + 1/R2) circuits.
 */
export function calculateSeriesParallel(params = {}) {
  const circuitType = params.circuitType === 'parallel' ? 'parallel' : 'series';
  const voltage = round(
    sanitizeNumber(
      params.voltage,
      SERIES_PARALLEL_BOUNDS.voltage.default,
      SERIES_PARALLEL_BOUNDS.voltage.min,
      SERIES_PARALLEL_BOUNDS.voltage.max
    ),
    2
  );
  const r1 = round(
    sanitizeNumber(params.r1, SERIES_PARALLEL_BOUNDS.r1.default, SERIES_PARALLEL_BOUNDS.r1.min, SERIES_PARALLEL_BOUNDS.r1.max),
    2
  );
  const r2 = round(
    sanitizeNumber(params.r2, SERIES_PARALLEL_BOUNDS.r2.default, SERIES_PARALLEL_BOUNDS.r2.min, SERIES_PARALLEL_BOUNDS.r2.max),
    2
  );
  const circuitClosed = params.circuitClosed !== undefined ? Boolean(params.circuitClosed) : true;

  const seriesR = round(r1 + r2, 3);
  const parallelR = round((r1 * r2) / (r1 + r2), 3);

  const rTotal = circuitType === 'parallel' ? parallelR : seriesR;
  const iTotal = circuitClosed ? round(voltage / rTotal, 4) : 0;

  let i1 = 0;
  let i2 = 0;
  let v1 = 0;
  let v2 = 0;

  if (circuitClosed) {
    if (circuitType === 'parallel') {
      v1 = voltage;
      v2 = voltage;
      i1 = round(voltage / r1, 4);
      i2 = round(voltage / r2, 4);
    } else {
      i1 = iTotal;
      i2 = iTotal;
      v1 = round(iTotal * r1, 3);
      v2 = round(iTotal * r2, 3);
    }
  }

  const pTotal = circuitClosed ? round(voltage * iTotal, 3) : 0;

  return {
    circuitType,
    voltage,
    r1,
    r2,
    circuitClosed,
    rTotal,
    iTotal,
    i1,
    i2,
    v1,
    v2,
    pTotal,
    comparison: {
      seriesR,
      parallelR,
      seriesI: circuitClosed ? round(voltage / seriesR, 4) : 0,
      parallelI: circuitClosed ? round(voltage / parallelR, 4) : 0,
    },
  };
}

/**
 * Generates R_total(R2) curves comparing Series vs Parallel topology for fixed R1.
 */
export function generateSeriesParallelSeries({ r1, r2 }) {
  const safeR1 = sanitizeNumber(r1, SERIES_PARALLEL_BOUNDS.r1.default, SERIES_PARALLEL_BOUNDS.r1.min, SERIES_PARALLEL_BOUNDS.r1.max);
  const safeR2 = sanitizeNumber(r2, SERIES_PARALLEL_BOUNDS.r2.default, SERIES_PARALLEL_BOUNDS.r2.min, SERIES_PARALLEL_BOUNDS.r2.max);

  const seriesPoints = [];
  const parallelPoints = [];
  for (let x = 2; x <= 100; x += 2) {
    seriesPoints.push({ x, y: round(safeR1 + x, 2) });
    parallelPoints.push({ x, y: round((safeR1 * x) / (safeR1 + x), 2) });
  }

  return {
    r1: round(safeR1, 1),
    r2: round(safeR2, 1),
    seriesPoints,
    parallelPoints,
  };
}
