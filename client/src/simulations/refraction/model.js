import { clamp, degToRad, radToDeg, round, sanitizeNumber } from '../utils.js';

export const REFRACTION_BOUNDS = {
  incidentAngle: { min: 0, max: 89, default: 35, step: 1 },
  n1: { min: 1.0, max: 2.42, default: 1.0, step: 0.01 },
  n2: { min: 1.0, max: 2.42, default: 1.5, step: 0.01 },
};

/**
 * Computes Snell's Law refraction, critical angle, total internal reflection,
 * and unpolarized Fresnel reflectance/transmittance.
 * n1 * sin(theta1) = n2 * sin(theta2)
 */
export function calculateRefraction(params = {}) {
  const incidentAngle = round(
    sanitizeNumber(
      params.incidentAngle,
      REFRACTION_BOUNDS.incidentAngle.default,
      REFRACTION_BOUNDS.incidentAngle.min,
      REFRACTION_BOUNDS.incidentAngle.max
    ),
    1
  );
  const n1 = round(
    sanitizeNumber(params.n1, REFRACTION_BOUNDS.n1.default, REFRACTION_BOUNDS.n1.min, REFRACTION_BOUNDS.n1.max),
    2
  );
  const n2 = round(
    sanitizeNumber(params.n2, REFRACTION_BOUNDS.n2.default, REFRACTION_BOUNDS.n2.min, REFRACTION_BOUNDS.n2.max),
    2
  );

  const theta1Rad = degToRad(incidentAngle);
  const sinTheta1 = Math.sin(theta1Rad);
  const sinTheta2Raw = (n1 / n2) * sinTheta1;

  const criticalAngle = n1 > n2 ? round(radToDeg(Math.asin(n2 / n1)), 2) : null;
  const isTotalInternalReflection = sinTheta2Raw >= 1 - 1e-9;

  let refractedAngle = null;
  let sinTheta2 = null;
  let reflectance = 1;

  if (!isTotalInternalReflection) {
    const clampedSin = clamp(sinTheta2Raw, -1, 1);
    const theta2Rad = Math.asin(clampedSin);
    refractedAngle = round(radToDeg(theta2Rad), 2);
    sinTheta2 = round(clampedSin, 4);

    // Unpolarized Fresnel equation
    const cos1 = Math.cos(theta1Rad);
    const cos2 = Math.cos(theta2Rad);
    const rsDenom = n1 * cos1 + n2 * cos2;
    const rpDenom = n1 * cos2 + n2 * cos1;
    const rs = rsDenom === 0 ? 1 : (n1 * cos1 - n2 * cos2) / rsDenom;
    const rp = rpDenom === 0 ? 1 : (n1 * cos2 - n2 * cos1) / rpDenom;
    reflectance = round(clamp(0.5 * (rs * rs + rp * rp), 0, 1), 3);
  }

  const transmittance = round(clamp(1 - reflectance, 0, 1), 3);

  return {
    incidentAngle,
    reflectedAngle: incidentAngle,
    n1,
    n2,
    sinTheta1: round(sinTheta1, 4),
    sinTheta2,
    criticalAngle,
    isTotalInternalReflection,
    refractedAngle,
    reflectance,
    transmittance,
  };
}

/**
 * Generates theta2(theta1) curve across incident angles 0..89 deg.
 */
export function generateRefractionCurve({ n1, n2 }) {
  const safeN1 = sanitizeNumber(n1, REFRACTION_BOUNDS.n1.default, REFRACTION_BOUNDS.n1.min, REFRACTION_BOUNDS.n1.max);
  const safeN2 = sanitizeNumber(n2, REFRACTION_BOUNDS.n2.default, REFRACTION_BOUNDS.n2.min, REFRACTION_BOUNDS.n2.max);

  const points = [];
  for (let angle = 0; angle <= 89; angle += 2) {
    const ratio = (safeN1 / safeN2) * Math.sin(degToRad(angle));
    if (ratio < 1) {
      points.push({ x: angle, y: round(radToDeg(Math.asin(ratio)), 2) });
    }
  }

  const criticalAngle = safeN1 > safeN2 ? round(radToDeg(Math.asin(safeN2 / safeN1)), 2) : null;
  return {
    criticalAngle,
    points,
  };
}
