import { round, sanitizeNumber } from '../utils.js';

// Universal gas constant in kPa * L / (mol * K)
export const GAS_CONSTANT_R = 8.314;

export const IDEAL_GAS_BOUNDS = {
  temperature: { min: 200, max: 800, default: 300, step: 10 },
  volume: { min: 5, max: 50, default: 22.4, step: 0.5 },
  moles: { min: 0.5, max: 5.0, default: 1.0, step: 0.1 },
};

/**
 * Computes Ideal Gas Law: P * V = n * R * T
 * P in kPa, V in L, n in mol, T in K.
 */
export function calculateIdealGas(params = {}) {
  const temperature = round(
    sanitizeNumber(
      params.temperature,
      IDEAL_GAS_BOUNDS.temperature.default,
      IDEAL_GAS_BOUNDS.temperature.min,
      IDEAL_GAS_BOUNDS.temperature.max
    ),
    1
  );
  const volume = round(
    sanitizeNumber(params.volume, IDEAL_GAS_BOUNDS.volume.default, IDEAL_GAS_BOUNDS.volume.min, IDEAL_GAS_BOUNDS.volume.max),
    2
  );
  const moles = round(
    sanitizeNumber(params.moles, IDEAL_GAS_BOUNDS.moles.default, IDEAL_GAS_BOUNDS.moles.min, IDEAL_GAS_BOUNDS.moles.max),
    2
  );

  const pressureKpa = round((moles * GAS_CONSTANT_R * temperature) / volume, 2);
  const pressureAtm = round(pressureKpa / 101.325, 3);
  const tempCelsius = round(temperature - 273.15, 1);
  // Relative thermal speed factor proportional to sqrt(T / 300)
  const avgSpeedFactor = round(Math.sqrt(temperature / 300), 3);

  return {
    temperature,
    tempCelsius,
    volume,
    moles,
    pressureKpa,
    pressureAtm,
    avgSpeedFactor,
  };
}

/**
 * Generates current P(V) isotherm and 300 K reference isotherm for comparison.
 */
export function generateIdealGasIsotherm({ temperature, volume, moles }) {
  const safeT = sanitizeNumber(
    temperature,
    IDEAL_GAS_BOUNDS.temperature.default,
    IDEAL_GAS_BOUNDS.temperature.min,
    IDEAL_GAS_BOUNDS.temperature.max
  );
  const safeV = sanitizeNumber(volume, IDEAL_GAS_BOUNDS.volume.default, IDEAL_GAS_BOUNDS.volume.min, IDEAL_GAS_BOUNDS.volume.max);
  const safeN = sanitizeNumber(moles, IDEAL_GAS_BOUNDS.moles.default, IDEAL_GAS_BOUNDS.moles.min, IDEAL_GAS_BOUNDS.moles.max);

  const currentPoints = [];
  const referencePoints = [];
  for (let v = 5; v <= 50; v += 1.5) {
    currentPoints.push({ x: v, y: round((safeN * GAS_CONSTANT_R * safeT) / v, 2) });
    referencePoints.push({ x: v, y: round((safeN * GAS_CONSTANT_R * 300) / v, 2) });
  }

  return {
    currentPoints,
    referencePoints,
    operatingPoint: {
      x: round(safeV, 2),
      y: round((safeN * GAS_CONSTANT_R * safeT) / safeV, 2),
    },
  };
}
