import { clamp, round, sanitizeNumber } from '../utils.js';

export const FREE_FALL_BOUNDS = {
  height: { min: 5, max: 200, default: 80, step: 1 },
  gravity: { min: 1.62, max: 24.79, default: 9.81, step: 0.01 },
};

/**
 * Computes kinematics for free fall without air resistance:
 * s = g * t^2 / 2, v = g * t, t_total = sqrt(2h / g)
 */
export function calculateFreeFall(params = {}) {
  const height = round(
    sanitizeNumber(params.height, FREE_FALL_BOUNDS.height.default, FREE_FALL_BOUNDS.height.min, FREE_FALL_BOUNDS.height.max),
    2
  );
  const gravity = round(
    sanitizeNumber(
      params.gravity,
      FREE_FALL_BOUNDS.gravity.default,
      FREE_FALL_BOUNDS.gravity.min,
      FREE_FALL_BOUNDS.gravity.max
    ),
    2
  );

  const totalTime = round(Math.sqrt((2 * height) / gravity), 3);
  const impactVelocity = round(gravity * totalTime, 3);

  const rawTime = params.elapsedTime === undefined ? totalTime : sanitizeNumber(params.elapsedTime, 0, 0, totalTime);
  const time = round(clamp(rawTime, 0, totalTime), 3);
  const distanceFallen = round(clamp(0.5 * gravity * time * time, 0, height), 3);
  const currentHeight = round(clamp(height - distanceFallen, 0, height), 3);
  const velocity = round(gravity * time, 3);
  const isLanded = time >= totalTime - 1e-6;

  return {
    height,
    gravity,
    totalTime,
    impactVelocity,
    time,
    distanceFallen,
    currentHeight,
    velocity,
    isLanded,
  };
}

/**
 * Generates h(t) and v(t) curves from t = 0 to t_total.
 */
export function generateFreeFallSeries({ height, gravity, steps = 24 }) {
  const safeH = sanitizeNumber(height, FREE_FALL_BOUNDS.height.default, FREE_FALL_BOUNDS.height.min, FREE_FALL_BOUNDS.height.max);
  const safeG = sanitizeNumber(gravity, FREE_FALL_BOUNDS.gravity.default, FREE_FALL_BOUNDS.gravity.min, FREE_FALL_BOUNDS.gravity.max);
  const totalTime = Math.sqrt((2 * safeH) / safeG);
  const count = Math.max(8, Math.min(60, Math.round(steps)));

  const heightPoints = [];
  const velocityPoints = [];
  for (let i = 0; i <= count; i += 1) {
    const t = (totalTime * i) / count;
    const h = Math.max(0, safeH - 0.5 * safeG * t * t);
    const v = safeG * t;
    heightPoints.push({ x: round(t, 2), y: round(h, 2) });
    velocityPoints.push({ x: round(t, 2), y: round(v, 2) });
  }

  return {
    totalTime: round(totalTime, 3),
    impactVelocity: round(safeG * totalTime, 2),
    heightPoints,
    velocityPoints,
  };
}
