import { calculateOhmsLaw } from './ohms-law/model.js';
import { ohmsLawConfig } from './ohms-law/config.js';
import { calculateFreeFall } from './free-fall/model.js';
import { freeFallConfig } from './free-fall/config.js';
import { calculateProjectile } from './projectile-motion/model.js';
import { projectileMotionConfig } from './projectile-motion/config.js';
import { calculateRefraction } from './refraction/model.js';
import { refractionConfig } from './refraction/config.js';
import { calculateSeriesParallel } from './series-parallel/model.js';
import { seriesParallelConfig } from './series-parallel/config.js';
import { calculateNewtonsSecondLaw } from './newtons-second-law/model.js';
import { newtonsSecondLawConfig } from './newtons-second-law/config.js';
import { calculateIdealGas } from './ideal-gas/model.js';
import { idealGasConfig } from './ideal-gas/config.js';
import { calculateWaveInterference } from './wave-interference/model.js';
import { waveInterferenceConfig } from './wave-interference/config.js';

export const EXPERIMENTS = {
  'ohms-law': { ...ohmsLawConfig, calculate: calculateOhmsLaw },
  'free-fall': { ...freeFallConfig, calculate: calculateFreeFall },
  'projectile-motion': { ...projectileMotionConfig, calculate: calculateProjectile },
  refraction: { ...refractionConfig, calculate: calculateRefraction },
  'series-parallel': { ...seriesParallelConfig, calculate: calculateSeriesParallel },
  'newtons-second-law': { ...newtonsSecondLawConfig, calculate: calculateNewtonsSecondLaw },
  'ideal-gas': { ...idealGasConfig, calculate: calculateIdealGas },
  'wave-interference': { ...waveInterferenceConfig, calculate: calculateWaveInterference },
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
