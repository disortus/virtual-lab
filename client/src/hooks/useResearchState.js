import { useCallback, useEffect, useState } from 'react';

const INITIAL_RESEARCH = {
  phase: 'explore',
  hypothesisId: '',
  hypothesisLabel: '',
  hypothesisReasoning: '',
  measurements: [],
  conclusion: '',
};

function loadResearch(experimentId) {
  try {
    const raw = localStorage.getItem(`vsl_research_${experimentId}`);
    if (!raw) return { ...INITIAL_RESEARCH };
    const parsed = JSON.parse(raw);
    return { ...INITIAL_RESEARCH, ...parsed };
  } catch {
    return { ...INITIAL_RESEARCH };
  }
}

export function useResearchState(experimentId) {
  const [research, setResearch] = useState(() => loadResearch(experimentId));

  useEffect(() => {
    setResearch(loadResearch(experimentId));
  }, [experimentId]);

  useEffect(() => {
    try {
      localStorage.setItem(`vsl_research_${experimentId}`, JSON.stringify(research));
    } catch {
      // Ignore storage quota errors safely
    }
  }, [experimentId, research]);

  const setPhase = useCallback((phase) => {
    setResearch((prev) => ({ ...prev, phase }));
  }, []);

  const setHypothesis = useCallback((hypothesisId, hypothesisLabel, hypothesisReasoning) => {
    setResearch((prev) => ({
      ...prev,
      hypothesisId: hypothesisId ?? prev.hypothesisId,
      hypothesisLabel: hypothesisLabel ?? prev.hypothesisLabel,
      hypothesisReasoning: hypothesisReasoning ?? prev.hypothesisReasoning,
    }));
  }, []);

  const addMeasurement = useCallback((measurement) => {
    setResearch((prev) => ({
      ...prev,
      measurements: [
        ...prev.measurements.slice(-11),
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
          ...measurement,
        },
      ],
    }));
  }, []);

  const removeMeasurement = useCallback((id) => {
    setResearch((prev) => ({
      ...prev,
      measurements: prev.measurements.filter((m) => m.id !== id),
    }));
  }, []);

  const clearMeasurements = useCallback(() => {
    setResearch((prev) => ({ ...prev, measurements: [] }));
  }, []);

  const setConclusion = useCallback((conclusion) => {
    setResearch((prev) => ({ ...prev, conclusion }));
  }, []);

  const resetResearch = useCallback(() => {
    setResearch({ ...INITIAL_RESEARCH });
  }, []);

  return {
    research,
    setPhase,
    setHypothesis,
    addMeasurement,
    removeMeasurement,
    clearMeasurements,
    setConclusion,
    resetResearch,
  };
}
