/**
 * Server-side authoritative physics recalculation.
 * Never trusts client-submitted calculation results; always recomputes from sanitized parameters.
 */

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function sanitizeNumber(value, fallback, min, max) {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return clamp(num, min, max);
}

function round(value, digits = 3) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  const rounded = Math.round((value + Number.EPSILON) * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

export const EXPERIMENT_SPECS = {
  'ohms-law': {
    id: 'ohms-law',
    title: 'Закон Ома для участка цепи',
    objective: 'Исследовать зависимость силы тока I от напряжения U и сопротивления R.',
    units: { voltage: 'В', resistance: 'Ом', current: 'А', power: 'Вт' },
    compute(rawParams = {}) {
      const voltage = round(sanitizeNumber(rawParams.voltage, 12, 1, 24), 2);
      const resistance = round(sanitizeNumber(rawParams.resistance, 20, 1, 100), 2);
      const circuitClosed = rawParams.circuitClosed !== undefined ? Boolean(rawParams.circuitClosed) : true;
      const current = circuitClosed ? round(voltage / resistance, 4) : 0;
      const power = circuitClosed ? round(voltage * current, 3) : 0;
      return {
        parameters: { voltage, resistance, circuitClosed },
        results: { current, power, status: circuitClosed ? 'closed' : 'open' },
      };
    },
  },
  'free-fall': {
    id: 'free-fall',
    title: 'Свободное падение тела',
    objective: 'Изучить равноускоренное движение тела в поле тяжести без сопротивления воздуха.',
    units: { height: 'м', gravity: 'м/с²', totalTime: 'с', impactVelocity: 'м/с', currentHeight: 'м', velocity: 'м/с' },
    compute(rawParams = {}) {
      const height = round(sanitizeNumber(rawParams.height, 80, 5, 200), 2);
      const gravity = round(sanitizeNumber(rawParams.gravity, 9.81, 1.62, 24.79), 2);
      const totalTime = round(Math.sqrt((2 * height) / gravity), 3);
      const impactVelocity = round(gravity * totalTime, 3);
      const time =
        rawParams.elapsedTime === undefined
          ? totalTime
          : round(clamp(sanitizeNumber(rawParams.elapsedTime, 0, 0, totalTime), 0, totalTime), 3);
      const distanceFallen = round(clamp(0.5 * gravity * time * time, 0, height), 3);
      const currentHeight = round(clamp(height - distanceFallen, 0, height), 3);
      const velocity = round(gravity * time, 3);
      return {
        parameters: { height, gravity },
        results: { totalTime, impactVelocity, time, distanceFallen, currentHeight, velocity },
      };
    },
  },
  'projectile-motion': {
    id: 'projectile-motion',
    title: 'Движение тела под углом к горизонту',
    objective: 'Исследовать траекторию, дальность полёта и максимальную высоту броска под углом.',
    units: { velocity: 'м/с', angle: '°', gravity: 'м/с²', range: 'м', maxHeight: 'м', flightTime: 'с', vx: 'м/с', vy0: 'м/с' },
    compute(rawParams = {}) {
      const velocity = round(sanitizeNumber(rawParams.velocity, 25, 5, 60), 2);
      const angle = round(sanitizeNumber(rawParams.angle, 45, 5, 85), 1);
      const gravity = round(sanitizeNumber(rawParams.gravity, 9.81, 1.62, 24.79), 2);
      const rad = degToRad(angle);
      const vx = velocity * Math.cos(rad);
      const vy0 = velocity * Math.sin(rad);
      const flightTime = (2 * vy0) / gravity;
      const maxHeight = (vy0 * vy0) / (2 * gravity);
      const range = (velocity * velocity * Math.sin(2 * rad)) / gravity;
      return {
        parameters: { velocity, angle, gravity },
        results: {
          vx: round(vx, 3),
          vy0: round(vy0, 3),
          flightTime: round(flightTime, 3),
          maxHeight: round(maxHeight, 3),
          range: round(range, 3),
        },
      };
    },
  },
  refraction: {
    id: 'refraction',
    title: 'Преломление света и полное внутреннее отражение',
    objective: 'Изучить закон Снеллиуса и условия полного внутреннего отражения на границе двух сред.',
    units: { incidentAngle: '°', reflectedAngle: '°', refractedAngle: '°', criticalAngle: '°', n1: '', n2: '' },
    compute(rawParams = {}) {
      const incidentAngle = round(sanitizeNumber(rawParams.incidentAngle, 35, 0, 89), 1);
      const n1 = round(sanitizeNumber(rawParams.n1, 1.0, 1.0, 2.42), 2);
      const n2 = round(sanitizeNumber(rawParams.n2, 1.5, 1.0, 2.42), 2);
      const sinTheta1 = Math.sin(degToRad(incidentAngle));
      const ratio = (n1 / n2) * sinTheta1;
      const criticalAngle = n1 > n2 ? round(radToDeg(Math.asin(n2 / n1)), 2) : null;
      const isTotalInternalReflection = ratio >= 1 - 1e-9;
      const refractedAngle = isTotalInternalReflection ? null : round(radToDeg(Math.asin(clamp(ratio, -1, 1))), 2);
      return {
        parameters: { incidentAngle, n1, n2 },
        results: {
          reflectedAngle: incidentAngle,
          refractedAngle,
          criticalAngle,
          isTotalInternalReflection,
        },
      };
    },
  },
};

export function verifySimulationContext(experimentId, rawParams, rawMeasurements = []) {
  const spec = EXPERIMENT_SPECS[experimentId];
  if (!spec) {
    return null;
  }

  const computed = spec.compute(rawParams);
  const verifiedMeasurements = Array.isArray(rawMeasurements)
    ? rawMeasurements.slice(0, 8).map((item) => {
        const mParams = item && typeof item === 'object' ? item.parameters || item : {};
        return spec.compute(mParams);
      })
    : [];

  return {
    experimentId: spec.id,
    title: spec.title,
    objective: spec.objective,
    parameters: computed.parameters,
    results: computed.results,
    units: spec.units,
    measurements: verifiedMeasurements,
  };
}
