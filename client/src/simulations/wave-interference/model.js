import { degToRad, round, sanitizeNumber } from '../utils.js';

export const WAVE_BOUNDS = {
  amplitude: { min: 0.5, max: 3.0, default: 1.5, step: 0.1 },
  frequency: { min: 0.5, max: 4.0, default: 1.5, step: 0.1 },
  wavelength: { min: 1.0, max: 6.0, default: 3.0, step: 0.2 },
  phaseShift: { min: 0, max: 360, default: 0, step: 5 },
};

/**
 * Computes coherent wave superposition:
 * y1 = A * sin(kx - wt), y2 = A * sin(kx - wt + phi)
 * resultantAmplitude = 2 * A * |cos(phi / 2)|
 */
export function calculateWaveInterference(params = {}) {
  const amplitude = round(
    sanitizeNumber(params.amplitude, WAVE_BOUNDS.amplitude.default, WAVE_BOUNDS.amplitude.min, WAVE_BOUNDS.amplitude.max),
    2
  );
  const frequency = round(
    sanitizeNumber(params.frequency, WAVE_BOUNDS.frequency.default, WAVE_BOUNDS.frequency.min, WAVE_BOUNDS.frequency.max),
    2
  );
  const wavelength = round(
    sanitizeNumber(params.wavelength, WAVE_BOUNDS.wavelength.default, WAVE_BOUNDS.wavelength.min, WAVE_BOUNDS.wavelength.max),
    2
  );
  const phaseShift = round(
    sanitizeNumber(params.phaseShift, WAVE_BOUNDS.phaseShift.default, WAVE_BOUNDS.phaseShift.min, WAVE_BOUNDS.phaseShift.max),
    1
  );

  const phiRad = degToRad(phaseShift);
  const waveSpeed = round(wavelength * frequency, 2);
  const resultantAmplitude = round(2 * amplitude * Math.abs(Math.cos(phiRad / 2)), 3);
  const maxPossible = 2 * amplitude;
  const intensityRatio = round((resultantAmplitude / maxPossible) ** 2, 3);

  let interferenceType = 'partial';
  if (resultantAmplitude >= maxPossible * 0.94) interferenceType = 'constructive';
  else if (resultantAmplitude <= maxPossible * 0.12) interferenceType = 'destructive';

  return {
    amplitude,
    frequency,
    wavelength,
    phaseShift,
    waveSpeed,
    resultantAmplitude,
    intensityRatio,
    interferenceType,
  };
}

/**
 * Samples y1(x, t), y2(x, t), and y_total(x, t) across [0..12 m].
 */
export function sampleWaves({ amplitude, frequency, wavelength, phaseShift, time = 0, samples = 96 }) {
  const safeA = sanitizeNumber(amplitude, WAVE_BOUNDS.amplitude.default, WAVE_BOUNDS.amplitude.min, WAVE_BOUNDS.amplitude.max);
  const safeF = sanitizeNumber(frequency, WAVE_BOUNDS.frequency.default, WAVE_BOUNDS.frequency.min, WAVE_BOUNDS.frequency.max);
  const safeL = sanitizeNumber(wavelength, WAVE_BOUNDS.wavelength.default, WAVE_BOUNDS.wavelength.min, WAVE_BOUNDS.wavelength.max);
  const safePhi = degToRad(
    sanitizeNumber(phaseShift, WAVE_BOUNDS.phaseShift.default, WAVE_BOUNDS.phaseShift.min, WAVE_BOUNDS.phaseShift.max)
  );

  const k = (2 * Math.PI) / safeL;
  const omega = 2 * Math.PI * safeF;
  const count = Math.max(24, Math.min(240, Math.round(samples)));
  const maxX = 12;

  const points = [];
  for (let i = 0; i <= count; i += 1) {
    const x = (maxX * i) / count;
    const phase = k * x - omega * time;
    const y1 = safeA * Math.sin(phase);
    const y2 = safeA * Math.sin(phase + safePhi);
    points.push({
      x: round(x, 2),
      y1: round(y1, 3),
      y2: round(y2, 3),
      yTotal: round(y1 + y2, 3),
    });
  }
  return points;
}

/**
 * Generates resultant amplitude curve A_res(phaseShift) across 0..360 deg.
 */
export function generateInterferenceCurve({ amplitude, phaseShift }) {
  const safeA = sanitizeNumber(amplitude, WAVE_BOUNDS.amplitude.default, WAVE_BOUNDS.amplitude.min, WAVE_BOUNDS.amplitude.max);
  const safePhi = sanitizeNumber(
    phaseShift,
    WAVE_BOUNDS.phaseShift.default,
    WAVE_BOUNDS.phaseShift.min,
    WAVE_BOUNDS.phaseShift.max
  );

  const points = [];
  for (let deg = 0; deg <= 360; deg += 10) {
    points.push({ x: deg, y: round(2 * safeA * Math.abs(Math.cos(degToRad(deg) / 2)), 3) });
  }

  return {
    points,
    operatingPoint: {
      x: round(safePhi, 1),
      y: round(2 * safeA * Math.abs(Math.cos(degToRad(safePhi) / 2)), 3),
    },
  };
}
