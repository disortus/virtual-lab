import { clamp, degToRad, round, sanitizeNumber } from '../utils.js';

export const PROJECTILE_BOUNDS = {
  velocity: { min: 5, max: 60, default: 25, step: 1 },
  angle: { min: 5, max: 85, default: 45, step: 1 },
  gravity: { min: 1.62, max: 24.79, default: 9.81, step: 0.01 },
};

/**
 * Computes projectile motion over flat ground:
 * vx = v0 * cos(theta), vy0 = v0 * sin(theta)
 * T = 2 * vy0 / g, L = v0^2 * sin(2*theta) / g, H = vy0^2 / (2 * g)
 */
export function calculateProjectile(params = {}) {
  const velocity = round(
    sanitizeNumber(
      params.velocity,
      PROJECTILE_BOUNDS.velocity.default,
      PROJECTILE_BOUNDS.velocity.min,
      PROJECTILE_BOUNDS.velocity.max
    ),
    2
  );
  const angle = round(
    sanitizeNumber(params.angle, PROJECTILE_BOUNDS.angle.default, PROJECTILE_BOUNDS.angle.min, PROJECTILE_BOUNDS.angle.max),
    1
  );
  const gravity = round(
    sanitizeNumber(
      params.gravity,
      PROJECTILE_BOUNDS.gravity.default,
      PROJECTILE_BOUNDS.gravity.min,
      PROJECTILE_BOUNDS.gravity.max
    ),
    2
  );

  const rad = degToRad(angle);
  const vx = velocity * Math.cos(rad);
  const vy0 = velocity * Math.sin(rad);

  const flightTime = (2 * vy0) / gravity;
  const timeToApex = vy0 / gravity;
  const maxHeight = (vy0 * vy0) / (2 * gravity);
  const range = (velocity * velocity * Math.sin(2 * rad)) / gravity;

  const rawTime = params.elapsedTime === undefined ? flightTime : sanitizeNumber(params.elapsedTime, 0, 0, flightTime);
  const time = clamp(rawTime, 0, flightTime);

  const x = clamp(vx * time, 0, range);
  const y = Math.max(0, vy0 * time - 0.5 * gravity * time * time);
  const vy = vy0 - gravity * time;
  const speed = Math.hypot(vx, vy);
  const isLanded = time >= flightTime - 1e-6;

  return {
    velocity,
    angle,
    gravity,
    vx: round(vx, 3),
    vy0: round(vy0, 3),
    flightTime: round(flightTime, 3),
    timeToApex: round(timeToApex, 3),
    maxHeight: round(maxHeight, 3),
    range: round(range, 3),
    time: round(time, 3),
    x: round(x, 3),
    y: round(y, 3),
    vy: round(vy, 3),
    speed: round(speed, 3),
    isLanded,
  };
}

/**
 * Generates trajectory points (x, y) and vertical velocity profile vy(t).
 */
export function generateProjectileTrajectory({ velocity, angle, gravity, steps = 36 }) {
  const safeV = sanitizeNumber(
    velocity,
    PROJECTILE_BOUNDS.velocity.default,
    PROJECTILE_BOUNDS.velocity.min,
    PROJECTILE_BOUNDS.velocity.max
  );
  const safeA = sanitizeNumber(angle, PROJECTILE_BOUNDS.angle.default, PROJECTILE_BOUNDS.angle.min, PROJECTILE_BOUNDS.angle.max);
  const safeG = sanitizeNumber(
    gravity,
    PROJECTILE_BOUNDS.gravity.default,
    PROJECTILE_BOUNDS.gravity.min,
    PROJECTILE_BOUNDS.gravity.max
  );

  const rad = degToRad(safeA);
  const vx = safeV * Math.cos(rad);
  const vy0 = safeV * Math.sin(rad);
  const flightTime = (2 * vy0) / safeG;
  const count = Math.max(10, Math.min(80, Math.round(steps)));

  const trajectoryPoints = [];
  const vyPoints = [];
  for (let i = 0; i <= count; i += 1) {
    const t = (flightTime * i) / count;
    const x = vx * t;
    const y = Math.max(0, vy0 * t - 0.5 * safeG * t * t);
    const vy = vy0 - safeG * t;
    trajectoryPoints.push({ x: round(x, 2), y: round(y, 2) });
    vyPoints.push({ x: round(t, 2), y: round(vy, 2) });
  }

  return {
    flightTime: round(flightTime, 3),
    maxHeight: round((vy0 * vy0) / (2 * safeG), 2),
    range: round((safeV * safeV * Math.sin(2 * rad)) / safeG, 2),
    trajectoryPoints,
    vyPoints,
  };
}
