import { clamp, round, sanitizeNumber } from '../utils.js';

export const NEWTON_BOUNDS = {
  mass: { min: 1, max: 50, default: 10, step: 1 },
  appliedForce: { min: 0, max: 200, default: 60, step: 2 },
  frictionForce: { min: 0, max: 100, default: 20, step: 2 },
};

const TRACK_LENGTH_M = 50;

/**
 * Computes Newton's Second Law dynamics with dry friction threshold:
 * F_net = max(0, F_applied - F_friction), a = F_net / m
 */
export function calculateNewtonsSecondLaw(params = {}) {
  const mass = round(
    sanitizeNumber(params.mass, NEWTON_BOUNDS.mass.default, NEWTON_BOUNDS.mass.min, NEWTON_BOUNDS.mass.max),
    2
  );
  const appliedForce = round(
    sanitizeNumber(
      params.appliedForce,
      NEWTON_BOUNDS.appliedForce.default,
      NEWTON_BOUNDS.appliedForce.min,
      NEWTON_BOUNDS.appliedForce.max
    ),
    2
  );
  const frictionForce = round(
    sanitizeNumber(
      params.frictionForce,
      NEWTON_BOUNDS.frictionForce.default,
      NEWTON_BOUNDS.frictionForce.min,
      NEWTON_BOUNDS.frictionForce.max
    ),
    2
  );

  const effectiveFriction = round(Math.min(appliedForce, frictionForce), 2);
  const netForce = round(Math.max(0, appliedForce - frictionForce), 2);
  const acceleration = round(netForce / mass, 3);
  const isMoving = netForce > 0;
  const timeToEnd = isMoving ? round(Math.sqrt((2 * TRACK_LENGTH_M) / acceleration), 3) : 0;

  const rawTime =
    params.elapsedTime === undefined ? Math.min(4, timeToEnd) : sanitizeNumber(params.elapsedTime, 0, 0, Math.max(4, timeToEnd));
  const time = isMoving ? round(clamp(rawTime, 0, timeToEnd), 3) : 0;
  const displacement = isMoving ? round(clamp(0.5 * acceleration * time * time, 0, TRACK_LENGTH_M), 3) : 0;
  const velocity = isMoving ? round(acceleration * time, 3) : 0;
  const isFinished = isMoving && time >= timeToEnd - 1e-6;

  return {
    mass,
    appliedForce,
    frictionForce,
    effectiveFriction,
    netForce,
    acceleration,
    trackLength: TRACK_LENGTH_M,
    timeToEnd,
    time,
    displacement,
    velocity,
    isMoving,
    isFinished,
  };
}

/**
 * Generates a(F_applied) curve for current mass and friction threshold.
 */
export function generateNewtonChartSeries({ mass, frictionForce, appliedForce }) {
  const safeM = sanitizeNumber(mass, NEWTON_BOUNDS.mass.default, NEWTON_BOUNDS.mass.min, NEWTON_BOUNDS.mass.max);
  const safeFric = sanitizeNumber(
    frictionForce,
    NEWTON_BOUNDS.frictionForce.default,
    NEWTON_BOUNDS.frictionForce.min,
    NEWTON_BOUNDS.frictionForce.max
  );
  const safeApp = sanitizeNumber(
    appliedForce,
    NEWTON_BOUNDS.appliedForce.default,
    NEWTON_BOUNDS.appliedForce.min,
    NEWTON_BOUNDS.appliedForce.max
  );

  const points = [];
  for (let f = 0; f <= 200; f += 5) {
    const net = Math.max(0, f - safeFric);
    points.push({ x: f, y: round(net / safeM, 3) });
  }

  return {
    points,
    operatingPoint: {
      x: round(safeApp, 1),
      y: round(Math.max(0, safeApp - safeFric) / safeM, 3),
    },
  };
}
