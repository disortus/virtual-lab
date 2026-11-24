import { useId } from 'react';
import { MeasurementsTable } from '../../components/experiments/MeasurementsTable.jsx';

const PHASES = [
  { id: 'explore', num: '01', label: 'Изучение' },
  { id: 'hypothesize', num: '02', label: 'Гипотеза' },
  { id: 'experiment', num: '03', label: 'Эксперимент' },
  { id: 'observe', num: '04', label: 'Наблюдение' },
  { id: 'analyze', num: '05', label: 'Анализ' },
  { id: 'conclude', num: '06', label: 'Вывод' },
];

export function GuidedWorkflow({
  experiment,
  research,
  onPhaseChange,
  onSelectHypothesis,
  onRecordMeasurement,
  onAnalyzeWithMentor,
  onConclusionChange,
  onReviewConclusion,
  onGenerateReport,
  onResetResearch,
}) {
  const reasoningId = useId();
  const conclusionId = useId();

  const currentIdx = Math.max(
    0,
    PHASES.findIndex((p) => p.id === research.phase)
  );
  const hasHypothesis = Boolean(research.hypothesisId && research.hypothesisReasoning.trim().length >= 8);
  const hasMeasurements = research.measurements.length >= 2;
  const hasConclusion = research.conclusion.trim().length >= 15;

  const canEnterPhase = (idx) => {
    if (idx <= 1) return true;
    if (idx === 2) return hasHypothesis;
    if (idx >= 3) return hasHypothesis && hasMeasurements;
    return true;
  };

  // Compute comparison deltas between Run 1 and latest Run
  const firstRun = research.measurements[0] || null;
  const lastRun = research.measurements.length > 1 ? research.measurements[research.measurements.length - 1] : null;

  return (
    <section className="panel" aria-label="Пошаговое исследование Guided Research">
      <div className="panel__header">
        <div>
          <span className="eyebrow">GUIDED RESEARCH CYCLE</span>
          <h2 className="panel__title">Этап {PHASES[currentIdx].num}: {PHASES[currentIdx].label}</h2>
        </div>
        <button type="button" className="btn btn--sm" onClick={onResetResearch}>
          Начать цикл заново
        </button>
      </div>

      <div style={{ padding: '0.75rem 1rem 0' }}>
        <div className="stepper" role="tablist" aria-label="Этапы исследования">
          {PHASES.map((phase, idx) => {
            const isActive = phase.id === research.phase;
            const isDone = idx < currentIdx;
            const allowed = canEnterPhase(idx);
            return (
              <button
                key={phase.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                disabled={!allowed}
                className={`stepper__item ${isActive ? 'is-active' : isDone ? 'is-done' : ''}`}
                onClick={() => onPhaseChange(phase.id)}
              >
                <span className="stepper__num">{phase.num}</span>
                <span className="stepper__label">{phase.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="panel__body">
        {research.phase === 'explore' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.93rem' }}>
              <strong>Явление:</strong> {experiment.guided.phenomenon}
            </p>
            <p style={{ fontSize: '0.93rem' }}>
              <strong>Цель исследования:</strong> {experiment.guided.objective}
            </p>
            <div className="alert alert--info">
              <strong>Исследовательский вопрос:</strong> {experiment.guided.researchQuestion}
            </div>
            <div>
              <button type="button" className="btn btn--primary" onClick={() => onPhaseChange('hypothesize')}>
                Перейти к гипотезе →
              </button>
            </div>
          </div>
        ) : null}

        {research.phase === 'hypothesize' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <p style={{ fontWeight: 600 }}>{experiment.guided.researchQuestion}</p>
            <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <legend className="eyebrow" style={{ marginBottom: '0.3rem' }}>
                1. Выбери предположение
              </legend>
              {experiment.guided.hypothesisOptions.map((opt) => (
                <label
                  key={opt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.55rem',
                    padding: '0.55rem 0.7rem',
                    border: '1px solid',
                    borderColor: research.hypothesisId === opt.id ? 'var(--accent-blue)' : 'var(--border-hairline)',
                    background: research.hypothesisId === opt.id ? 'var(--accent-blue-soft)' : 'var(--bg-paper)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name={`hyp-${experiment.id}`}
                    checked={research.hypothesisId === opt.id}
                    onChange={() => onSelectHypothesis(opt.id, opt.label, research.hypothesisReasoning)}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <span style={{ fontSize: '0.9rem' }}>{opt.label}</span>
                </label>
              ))}
            </fieldset>

            <div>
              <label htmlFor={reasoningId} style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.3rem' }}>
                2. Почему ты так считаешь? (минимум 8 символов)
              </label>
              <textarea
                id={reasoningId}
                rows={2}
                maxLength={1000}
                className="lab-textarea"
                placeholder="Кратко объясни свою физическую логику перед проверкой на стенде..."
                value={research.hypothesisReasoning}
                onChange={(e) =>
                  onSelectHypothesis(research.hypothesisId, research.hypothesisLabel, e.target.value)
                }
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <button type="button" className="btn" onClick={() => onPhaseChange('explore')}>
                ← Назад
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!hasHypothesis}
                onClick={() => onPhaseChange('experiment')}
              >
                Проверить в эксперименте →
              </button>
            </div>
          </div>
        ) : null}

        {research.phase === 'experiment' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div className="alert alert--info">
              Меняй параметры на панели справа от стенда ниже и нажми{' '}
              <strong>«Зафиксировать замер»</strong> минимум <strong>2 раза</strong> при разных значениях (сейчас замеров:{' '}
              <span className="mono">{research.measurements.length}</span>).
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'space-between' }}>
              <button type="button" className="btn btn--blue" onClick={onRecordMeasurement}>
                Зафиксировать замер ({research.measurements.length})
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn" onClick={() => onPhaseChange('hypothesize')}>
                  ← Гипотеза
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={!hasMeasurements}
                  onClick={() => onPhaseChange('observe')}
                >
                  К наблюдениям →
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {research.phase === 'observe' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {firstRun && lastRun ? (
              <div className="alert alert--warning">
                <strong>Сравнение базового замера #1 и последнего замера #{research.measurements.length}:</strong>{' '}
                {experiment.measurementColumns.map((col) => {
                  const v1 = firstRun.results?.[col.key] ?? firstRun.parameters?.[col.key];
                  const v2 = lastRun.results?.[col.key] ?? lastRun.parameters?.[col.key];
                  const diff =
                    typeof v1 === 'number' && typeof v2 === 'number'
                      ? ` (${v2 - v1 >= 0 ? '+' : ''}${Math.round((v2 - v1) * 1000) / 1000})`
                      : '';
                  return (
                    <span key={col.key} className="mono" style={{ display: 'inline-block', marginRight: '0.85rem' }}>
                      {col.label}: {v1 ?? 'ПВО'} → {v2 ?? 'ПВО'}
                      {diff}
                    </span>
                  );
                })}
              </div>
            ) : null}

            <MeasurementsTable
              columns={experiment.measurementColumns}
              measurements={research.measurements}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" className="btn" onClick={() => onPhaseChange('experiment')}>
                ← Добавить замеры
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  onPhaseChange('analyze');
                  onAnalyzeWithMentor();
                }}
              >
                Перейти к анализу с AI →
              </button>
            </div>
          </div>
        ) : null}

        {research.phase === 'analyze' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <p style={{ fontSize: '0.92rem' }}>
              <strong>Твоя гипотеза:</strong> {research.hypothesisLabel}
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>
              <strong>Подсказка к анализу:</strong> {experiment.guided.analysisPromptHint}
            </p>
            <p style={{ fontSize: '0.88rem' }}>
              Посмотри на панель <strong>AI Lab Mentor</strong> справа: наставник задал вопрос по твоим замерам. Обсуди
              результат в чате и переходи к формулировке вывода.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.5rem' }}>
              <button type="button" className="btn" onClick={onAnalyzeWithMentor}>
                Запросить разбор у AI-наставника
              </button>
              <button type="button" className="btn btn--primary" onClick={() => onPhaseChange('conclude')}>
                Сформулировать вывод →
              </button>
            </div>
          </div>
        ) : null}

        {research.phase === 'conclude' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <label htmlFor={conclusionId} style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                Сформулируй научный вывод своими словами (подтвердилась ли гипотеза и почему?)
              </label>
              <textarea
                id={conclusionId}
                rows={3}
                maxLength={1200}
                className="lab-textarea"
                placeholder="Например: Моя гипотеза подтвердилась — при увеличении сопротивления вдвое (с 20 до 40 Ом) сила тока упала с 0.6 А до 0.3 А..."
                value={research.conclusion}
                onChange={(e) => onConclusionChange(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn"
                disabled={!hasConclusion}
                onClick={onReviewConclusion}
              >
                Проверить логику с AI-наставником
              </button>
              <button
                type="button"
                className="btn btn--orange"
                disabled={!hasConclusion}
                onClick={onGenerateReport}
              >
                Сформировать научный отчёт →
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
