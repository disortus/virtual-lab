import { calculateOhmsLaw } from './ohms-law/model.js';
import { ohmsLawConfig } from './ohms-law/config.js';
import { calculateFreeFall } from './free-fall/model.js';
import { freeFallConfig } from './free-fall/config.js';
import { calculateProjectile } from './projectile-motion/model.js';
import { projectileMotionConfig } from './projectile-motion/config.js';
import { calculateRefraction } from './refraction/model.js';
import { refractionConfig } from './refraction/config.js';

export const EXPERIMENTS = {
  'ohms-law': {
    ...ohmsLawConfig,
    calculate: calculateOhmsLaw,
  },
  'free-fall': {
    ...freeFallConfig,
    calculate: calculateFreeFall,
  },
  'projectile-motion': {
    ...projectileMotionConfig,
    calculate: calculateProjectile,
  },
  refraction: {
    ...refractionConfig,
    calculate: calculateRefraction,
  },
};

export const EXPERIMENT_LIST = Object.values(EXPERIMENTS);

export function getExperimentById(id) {
  return EXPERIMENTS[id] || null;
}

export function computeExperimentState(id, params) {
  const experiment = getExperimentById(id);
  if (!experiment) {
    throw new Error(`Unknown experiment: ${id}`);
  }
  return experiment.calculate(params);
}
