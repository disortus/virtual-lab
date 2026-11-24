import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateOhmsLaw, generateOhmsChartSeries } from './ohms-law/model.js';
import { calculateFreeFall, generateFreeFallSeries } from './free-fall/model.js';
import { calculateProjectile, generateProjectileTrajectory } from './projectile-motion/model.js';
import { calculateRefraction, generateRefractionCurve } from './refraction/model.js';
import { computeExperimentState, EXPERIMENT_LIST } from './index.js';

function assertNoBadNumbers(obj) {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'number') {
      assert.ok(Number.isFinite(v), `Expected finite number for ${k}, got ${v}`);
    }
  }
}

test('Experiment registry contains all 4 required physics experiments', () => {
  assert.equal(EXPERIMENT_LIST.length, 4);
  assert.deepEqual(
    EXPERIMENT_LIST.map((e) => e.id),
    ['ohms-law', 'free-fall', 'projectile-motion', 'refraction']
  );
});

test("Ohm's Law: calculates I = U/R, P = U*I, and handles open circuit", () => {
  const closed = calculateOhmsLaw({ voltage: 12, resistance: 20, circuitClosed: true });
  assert.equal(closed.current, 0.6);
  assert.equal(closed.power, 7.2);
  assert.equal(closed.status, 'closed');
  assertNoBadNumbers(closed);

  const open = calculateOhmsLaw({ voltage: 24, resistance: 5, circuitClosed: false });
  assert.equal(open.current, 0);
  assert.equal(open.power, 0);
  assert.equal(open.status, 'open');

  // Clamping & NaN protection
  const clamped = calculateOhmsLaw({ voltage: Number.NaN, resistance: -10, circuitClosed: true });
  assert.equal(clamped.voltage, 12);
  assert.equal(clamped.resistance, 1);
  assertNoBadNumbers(clamped);

  const seriesIU = generateOhmsChartSeries({ voltage: 12, resistance: 20, chartMode: 'I_vs_U' });
  assert.equal(seriesIU.points.length, 24);
  assert.equal(seriesIU.operatingPoint.y, 0.6);
});

test('Free Fall: calculates s = g*t^2/2, v = g*t, t = sqrt(2h/g)', () => {
  const landed = calculateFreeFall({ height: 80, gravity: 10 });
  assert.equal(landed.totalTime, 4);
  assert.equal(landed.impactVelocity, 40);
  assert.equal(landed.currentHeight, 0);
  assert.equal(landed.distanceFallen, 80);
  assert.equal(landed.isLanded, true);
  assertNoBadNumbers(landed);

  const mid = calculateFreeFall({ height: 80, gravity: 10, elapsedTime: 2 });
  assert.equal(mid.distanceFallen, 20);
  assert.equal(mid.currentHeight, 60);
  assert.equal(mid.velocity, 20);
  assert.equal(mid.isLanded, false);

  // Overshoot time clamps to totalTime
  const overshoot = calculateFreeFall({ height: 80, gravity: 10, elapsedTime: 999 });
  assert.equal(overshoot.time, 4);
  assert.equal(overshoot.currentHeight, 0);

  const series = generateFreeFallSeries({ height: 80, gravity: 10, steps: 20 });
  assert.equal(series.heightPoints.length, 21);
  assert.equal(series.heightPoints[0].y, 80);
  assert.equal(series.heightPoints[20].y, 0);
});

test('Projectile Motion: calculates range, maxHeight, flightTime, and component velocities', () => {
  const res = calculateProjectile({ velocity: 20, angle: 45, gravity: 10 });
  assert.ok(Math.abs(res.range - 40) < 0.01);
  assert.ok(Math.abs(res.maxHeight - 10) < 0.01);
  assert.ok(Math.abs(res.flightTime - 2.828) < 0.01);
  assert.equal(res.isLanded, true);
  assertNoBadNumbers(res);

  // Symmetric angles (30 and 60) yield equal range
  const p30 = calculateProjectile({ velocity: 25, angle: 30, gravity: 9.81 });
  const p60 = calculateProjectile({ velocity: 25, angle: 60, gravity: 9.81 });
  assert.ok(Math.abs(p30.range - p60.range) < 0.05);
  assert.ok(p60.maxHeight > p30.maxHeight);

  // Apex check
  const atApex = calculateProjectile({ velocity: 20, angle: 45, gravity: 10, elapsedTime: res.timeToApex });
  assert.ok(Math.abs(atApex.y - 10) < 0.02);
  assert.ok(Math.abs(atApex.vy) < 0.05);

  const traj = generateProjectileTrajectory({ velocity: 20, angle: 45, gravity: 10, steps: 20 });
  assert.equal(traj.trajectoryPoints.length, 21);
  assert.equal(traj.trajectoryPoints[0].x, 0);
});

test("Refraction: calculates Snell's law and detects Total Internal Reflection", () => {
  // Air -> Glass at 30 deg: sin(theta2) = 1.0 * 0.5 / 1.5 = 1/3 => ~19.47 deg
  const airGlass = calculateRefraction({ incidentAngle: 30, n1: 1.0, n2: 1.5 });
  assert.equal(airGlass.isTotalInternalReflection, false);
  assert.equal(airGlass.criticalAngle, null);
  assert.ok(Math.abs(airGlass.refractedAngle - 19.47) < 0.05);
  assert.equal(airGlass.reflectedAngle, 30);
  assertNoBadNumbers(airGlass);

  // Glass -> Air at 50 deg: critical angle = asin(1/1.5) ≈ 41.81 deg => TIR!
  const tir = calculateRefraction({ incidentAngle: 50, n1: 1.5, n2: 1.0 });
  assert.equal(tir.isTotalInternalReflection, true);
  assert.equal(tir.refractedAngle, null);
  assert.equal(tir.sinTheta2, null);
  assert.equal(tir.reflectance, 1);
  assert.equal(tir.transmittance, 0);
  assert.ok(Math.abs(tir.criticalAngle - 41.81) < 0.05);

  const curve = generateRefractionCurve({ n1: 1.5, n2: 1.0 });
  assert.ok(curve.points.every((pt) => pt.x < 42));
});

test('Unified computeExperimentState works for all experiments and rejects unknown ids', () => {
  const res = computeExperimentState('ohms-law', { voltage: 10, resistance: 10 });
  assert.equal(res.current, 1);
  assert.throws(() => computeExperimentState('quantum-warp', {}));
});
