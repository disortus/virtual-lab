import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getExperimentById } from '../simulations/index.js';
import { OHMS_BOUNDS, generateOhmsChartSeries } from '../simulations/ohms-law/model.js';
import { FREE_FALL_BOUNDS, generateFreeFallSeries } from '../simulations/free-fall/model.js';
import { PROJECTILE_BOUNDS, generateProjectileTrajectory } from '../simulations/projectile-motion/model.js';
import { REFRACTION_BOUNDS, generateRefractionCurve } from '../simulations/refraction/model.js';
import { MEDIA_PRESETS } from '../simulations/refraction/config.js';
import { OhmsLawStage } from '../simulations/ohms-law/Stage.jsx';
import { FreeFallStage } from '../simulations/free-fall/Stage.jsx';
import { ProjectileStage } from '../simulations/projectile-motion/Stage.jsx';
import { RefractionStage } from '../simulations/refraction/Stage.jsx';
import { RangeSlider } from '../components/ui/RangeSlider.jsx';
import { MeterReadout } from '../components/ui/MeterReadout.jsx';
import { ScientificChart } from '../components/charts/ScientificChart.jsx';
import { MeasurementsTable } from '../components/experiments/MeasurementsTable.jsx';
import { MentorPanel } from '../components/mentor/MentorPanel.jsx';
import { fetchMentorHealth, requestMentor } from '../services/mentorApi.js';
import { GuidedWorkflow } from '../features/research/GuidedWorkflow.jsx';
import { useResearchState } from '../hooks/useResearchState.js';
import { saveReport } from '../services/reportStorage.js';

export function ExperimentWorkspacePage() {
  const { experimentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const experiment = getExperimentById(experimentId);
  const initialMode = searchParams.get('mode') === 'free' ? 'free' : 'guided';
  const [mode, setMode] = useState(initialMode);

  const [params, setParams] = useState(() => (experiment ? { ...experiment.defaultParams } : {}));
  const [liveKinematics, setLiveKinematics] = useState(null);
  const [recentActions, setRecentActions] = useState([]);

  const [aiMode, setAiMode] = useState('demo');
  const [messages, setMessages] = useState([]);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorError, setMentorError] = useState('');

  const {
    research,
    setPhase,
    setHypothesis,
    addMeasurement,
    removeMeasurement,
    clearMeasurements,
    setConclusion,
    resetResearch,
  } = useResearchState(experiment?.id || 'ohms-law');

  // Reset workspace state when switching experiments
  useEffect(() => {
    if (!experiment) return;
    setParams({ ...experiment.defaultParams });
    setLiveKinematics(null);
    setRecentActions([]);
    setMessages([]);
    setMentorError('');
    document.title = `${experiment.shortTitle} | Virtual Science Lab`;
  }, [experimentId]);

  useEffect(() => {
    const queryMode = searchParams.get('mode');
    if (queryMode === 'guided' || queryMode === 'free') {
      setMode(queryMode);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMentorHealth().then((health) => {
      if (health?.aiMode) setAiMode(health.aiMode);
    });
  }, []);

  const computed = useMemo(() => {
    if (!experiment) return null;
    return experiment.calculate(params);
  }, [experiment, params]);

  const logAction = useCallback((text) => {
    setRecentActions((prev) => [...prev.slice(-9), text]);
  }, []);

  const updateParam = (key, value, label) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    if (label) logAction(`Изменено ${label} → ${value}`);
  };

  const applyPreset = (preset) => {
    setParams((prev) => ({ ...prev, ...preset.params }));
    logAction(`Выбран пресет: ${preset.label}`);
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setSearchParams({ mode: nextMode });
  };

  const handleRecordMeasurement = () => {
    if (!experiment || !computed) return;
    addMeasurement({
      parameters: { ...params },
      results: { ...computed },
    });
    logAction('Зафиксирован экспериментальный замер в журнале');
  };

  const buildMentorPayload = useCallback(
    (extra = {}) => ({
      experimentId: experiment.id,
      mode,
      phase: mode === 'guided' ? research.phase : 'explore',
      parameters: params,
      results: computed,
      hypothesisChoice: research.hypothesisLabel,
      hypothesisReasoning: research.hypothesisReasoning,
      conclusion: research.conclusion,
      recentActions,
      measurements: research.measurements,
      history: messages.filter((m) => m.role === 'user' || m.role === 'mentor').map((m) => ({
        role: m.role,
        text: m.text,
      })),
      ...extra,
    }),
    [experiment, mode, research, params, computed, recentActions, messages]
  );

  const callMentor = async (endpointType, extra = {}, userBubbleText = '') => {
    if (!experiment || mentorLoading) return;
    setMentorError('');

    if (userBubbleText) {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-u`, role: 'user', text: userBubbleText },
      ]);
    }

    setMentorLoading(true);
    try {
      const response = await requestMentor(endpointType, buildMentorPayload(extra));
      if (response.aiMode) setAiMode(response.aiMode);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-m`,
          role: 'mentor',
          text: response.reply,
          aiMode: response.aiMode,
        },
      ]);
    } catch (err) {
      setMentorError(err.message || 'Не удалось получить ответ от AI Lab Mentor.');
    } finally {
      setMentorLoading(false);
    }
  };

  const handleExplainCurrent = () => {
    callMentor('explain', { action: 'explain_current_state' }, 'Объясни, что сейчас происходит на стенде.');
  };

  const handleQuickAction = (action) => {
    if (action === 'explain_current_state') {
      handleExplainCurrent();
      return;
    }
    const label =
      action === 'what_next'
        ? 'Что мне стоит проверить дальше?'
        : 'Почему график выглядит именно так?';
    callMentor('explain', { action }, label);
  };

  const handleSendMessage = (text) => {
    callMentor('chat', { action: 'chat', message: text }, text);
  };

  const handleAnalyzeWithMentor = () => {
    callMentor(
      'analyze',
      { action: 'analyze_experiment' },
      'Помоги проанализировать гипотезу и собранные измерения.'
    );
  };

  const handleReviewConclusion = () => {
    callMentor(
      'analyze',
      { action: 'review_conclusion', conclusion: research.conclusion },
      'Проверь, пожалуйста, логичность моего научного вывода.'
    );
  };

  const handleGenerateReport = () => {
    if (!experiment) return;
    const mentorNotes = messages
      .filter((m) => m.role === 'mentor')
      .slice(-2)
      .map((m) => m.text)
      .join('\n\n');

    const report = saveReport({
      experimentId: experiment.id,
      experimentCode: experiment.code,
      experimentTitle: experiment.title,
      objective: experiment.guided.objective,
      researchQuestion: experiment.guided.researchQuestion,
      hypothesisChoice: research.hypothesisLabel || 'Не выбрана',
      hypothesisReasoning: research.hypothesisReasoning || 'Не указано',
      parameters: { ...params },
      measurements: research.measurements,
      columns: experiment.measurementColumns,
      analysisNotes:
        mentorNotes ||
        `Собрано замеров: ${research.measurements.length}. Исследована зависимость для формулы ${experiment.formula}.`,
      conclusion: research.conclusion,
    });

    navigate(`/reports/${report.id}`);
  };

  if (!experiment || !computed) {
    return (
      <div className="container" style={{ paddingBlock: '3rem' }}>
        <div className="panel">
          <div className="panel__body">
            <h1>Эксперимент не найден</h1>
            <p style={{ marginBlock: '1rem', color: 'var(--ink-secondary)' }}>
              Проверьте ссылку или выберите один из четырёх доступных экспериментов в Physics Lab.
            </p>
            <Link to="/labs/physics" className="btn btn--primary">
              Перейти в Physics Lab
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Build chart datasets per experiment
  let chartProps = null;
  if (experiment.id === 'ohms-law') {
    const series = generateOhmsChartSeries(params);
    chartProps = {
      title: series.title,
      xLabel: series.xLabel,
      yLabel: series.yLabel,
      caption: 'Синяя линия — расчётная кривая модели; оранжевая точка — текущая рабочая точка.',
      datasets: [
        { label: 'Модель I', data: series.points, color: '#315BE8', fill: true },
        {
          label: 'Текущая точка',
          data: [series.operatingPoint],
          color: '#EF8737',
          fillColor: '#EF8737',
          pointRadius: 6,
          showLine: false,
        },
      ],
    };
  } else if (experiment.id === 'free-fall') {
    const series = generateFreeFallSeries(params);
    chartProps = {
      title: `Кинематика падения (t_полн = ${series.totalTime} с)`,
      xLabel: 'Время t (с)',
      yLabel: 'Высота h (м) / Скорость v (м/с)',
      caption: 'Линейный рост скорости v(t) и параболическое убывание высоты h(t).',
      datasets: [
        { label: 'Высота h(t), м', data: series.heightPoints, color: '#315BE8' },
        { label: 'Скорость v(t), м/с', data: series.velocityPoints, color: '#EF8737' },
      ],
    };
  } else if (experiment.id === 'projectile-motion') {
    const traj = generateProjectileTrajectory(params);
    chartProps = {
      title: `Траектория y(x) · L = ${traj.range} м, H = ${traj.maxHeight} м`,
      xLabel: 'Дальность x (м)',
      yLabel: 'Высота y (м)',
      caption: 'Параболическая траектория полёта снаряда без учёта сопротивления воздуха.',
      datasets: [{ label: 'Траектория y(x)', data: traj.trajectoryPoints, color: '#315BE8', fill: true }],
    };
  } else if (experiment.id === 'refraction') {
    const refCurve = generateRefractionCurve(params);
    chartProps = {
      title: `Угол преломления θ₂(θ₁) при n₁ = ${params.n1}, n₂ = ${params.n2}`,
      xLabel: 'Угол падения θ₁ (°)',
      yLabel: 'Угол преломления θ₂ (°)',
      caption:
        refCurve.criticalAngle !== null
          ? `Критический угол ПВО: θ_кр = ${refCurve.criticalAngle}°. Выше этого угла преломления нет.`
          : 'При n₁ ≤ n₂ преломлённый луч существует для всех углов падения от 0° до 89°.',
      datasets: [
        { label: 'Закон Снеллиуса θ₂(θ₁)', data: refCurve.points, color: '#315BE8' },
        ...(computed.refractedAngle !== null
          ? [
              {
                label: 'Текущий луч',
                data: [{ x: computed.incidentAngle, y: computed.refractedAngle }],
                color: '#EF8737',
                fillColor: '#EF8737',
                pointRadius: 6,
                showLine: false,
              },
            ]
          : []),
      ],
    };
  }

  return (
    <div className="container workspace-shell">
      {/* Workspace Header Strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '1rem',
          paddingBottom: '1rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border-strong)',
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: '0.35rem' }}>
            <Link to="/labs/physics" style={{ textDecoration: 'none' }}>
              PHYSICS LAB
            </Link>{' '}
            / {experiment.code} · {experiment.branch}
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)' }}>{experiment.title}</h1>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.65rem' }}>
          <div className="segmented" role="group" aria-label="Режим работы">
            <button
              type="button"
              className={`segmented__btn ${mode === 'guided' ? 'is-active' : ''}`}
              onClick={() => handleModeChange('guided')}
            >
              Исследование (Guided)
            </button>
            <button
              type="button"
              className={`segmented__btn ${mode === 'free' ? 'is-active' : ''}`}
              onClick={() => handleModeChange('free')}
            >
              Свободный режим (Free)
            </button>
          </div>
          <Link to="/reports" className="btn btn--sm">
            Архив отчётов
          </Link>
        </div>
      </div>

      <div className="workspace-grid">
        <div className="workspace-primary">
          {/* Guided Research Stepper & Phase Card */}
          {mode === 'guided' ? (
            <GuidedWorkflow
              experiment={experiment}
              research={research}
              currentParams={params}
              currentResults={computed}
              onPhaseChange={setPhase}
              onSelectHypothesis={setHypothesis}
              onRecordMeasurement={handleRecordMeasurement}
              onAnalyzeWithMentor={handleAnalyzeWithMentor}
              onConclusionChange={setConclusion}
              onReviewConclusion={handleReviewConclusion}
              onGenerateReport={handleGenerateReport}
              onResetResearch={resetResearch}
            />
          ) : null}

          {/* Full-width Interactive Simulation Stage */}
          <section className="panel" aria-label="Симуляция эксперимента">
            <div className="panel__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge--blue">{experiment.formula}</span>
                <h2 className="panel__title">Интерактивный стенд</h2>
              </div>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={handleExplainCurrent}
                disabled={mentorLoading}
              >
                Объяснить происходящее
              </button>
            </div>
            <div className="panel__body">
              {experiment.id === 'ohms-law' ? (
                <OhmsLawStage
                  state={computed}
                  onToggleCircuit={() =>
                    updateParam('circuitClosed', !params.circuitClosed, 'положение ключа')
                  }
                />
              ) : null}

              {experiment.id === 'free-fall' ? (
                <FreeFallStage params={params} onLiveStateChange={setLiveKinematics} />
              ) : null}

              {experiment.id === 'projectile-motion' ? (
                <ProjectileStage
                  params={params}
                  measurements={research.measurements}
                  onLiveStateChange={setLiveKinematics}
                />
              ) : null}

              {experiment.id === 'refraction' ? <RefractionStage state={computed} /> : null}
            </div>
          </section>

          {/* Integrated Digital Meters Strip + Single Record Action */}
          <section aria-label="Показания измерительных приборов" className="meters-strip">
            <div className="meters-grid">
              {experiment.id === 'ohms-law' ? (
                <>
                  <MeterReadout label="Сила тока" symbol="I" value={computed.current} unit="А" accent />
                  <MeterReadout label="Напряжение" symbol="U" value={computed.voltage} unit="В" />
                  <MeterReadout label="Сопротивление" symbol="R" value={computed.resistance} unit="Ом" />
                  <MeterReadout label="Мощность" symbol="P" value={computed.power} unit="Вт" />
                </>
              ) : null}

              {experiment.id === 'free-fall' ? (
                <>
                  <MeterReadout
                    label="Полное время"
                    symbol="t_полн"
                    value={computed.totalTime}
                    unit="с"
                    accent
                  />
                  <MeterReadout
                    label="Скорость удара"
                    symbol="v_уд"
                    value={computed.impactVelocity}
                    unit="м/с"
                  />
                  <MeterReadout
                    label="Текущая высота"
                    symbol="h(t)"
                    value={liveKinematics ? liveKinematics.currentHeight : computed.height}
                    unit="м"
                  />
                  <MeterReadout
                    label="Текущая скорость"
                    symbol="v(t)"
                    value={liveKinematics ? liveKinematics.velocity : 0}
                    unit="м/с"
                  />
                </>
              ) : null}

              {experiment.id === 'projectile-motion' ? (
                <>
                  <MeterReadout label="Дальность полёта" symbol="L" value={computed.range} unit="м" accent />
                  <MeterReadout label="Макс. высота" symbol="H" value={computed.maxHeight} unit="м" />
                  <MeterReadout label="Время полёта" symbol="T" value={computed.flightTime} unit="с" />
                  <MeterReadout
                    label="Гориз. скорость"
                    symbol="vx"
                    value={computed.vx}
                    unit="м/с"
                  />
                </>
              ) : null}

              {experiment.id === 'refraction' ? (
                <>
                  <MeterReadout label="Угол падения" symbol="θ₁" value={computed.incidentAngle} unit="°" />
                  <MeterReadout label="Угол отражения" symbol="θ_отр" value={computed.reflectedAngle} unit="°" />
                  <MeterReadout
                    label="Угол преломления"
                    symbol="θ₂"
                    value={computed.isTotalInternalReflection ? 'ПВО' : computed.refractedAngle}
                    unit={computed.isTotalInternalReflection ? '' : '°'}
                    accent
                  />
                  <MeterReadout
                    label="Критич. угол"
                    symbol="θ_кр"
                    value={computed.criticalAngle}
                    unit={computed.criticalAngle !== null ? '°' : ''}
                  />
                </>
              ) : null}
            </div>
            <div className="meters-action">
              <button
                type="button"
                className="btn btn--primary"
                style={{ width: '100%', whiteSpace: 'nowrap' }}
                onClick={handleRecordMeasurement}
              >
                Зафиксировать замер ({research.measurements.length})
              </button>
            </div>
          </section>

          {/* Parameters Deck + Live Scientific Chart */}
          <div className="workspace-deck-grid">
            <section className="panel panel--muted" aria-label="Панель управления параметрами">
              <div className="panel__header">
                <h2 className="panel__title">Параметры установки</h2>
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={() => {
                    setParams({ ...experiment.defaultParams });
                    logAction('Сброшены параметры установки');
                  }}
                >
                  Сброс
                </button>
              </div>
              <div className="panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {experiment.id === 'ohms-law' ? (
                  <>
                    <RangeSlider
                      label="Напряжение"
                      symbol="U"
                      unit="В"
                      min={OHMS_BOUNDS.voltage.min}
                      max={OHMS_BOUNDS.voltage.max}
                      step={OHMS_BOUNDS.voltage.step}
                      value={params.voltage}
                      onChange={(v) => updateParam('voltage', v, 'напряжение U')}
                    />
                    <RangeSlider
                      label="Сопротивление"
                      symbol="R"
                      unit="Ом"
                      min={OHMS_BOUNDS.resistance.min}
                      max={OHMS_BOUNDS.resistance.max}
                      step={OHMS_BOUNDS.resistance.step}
                      value={params.resistance}
                      onChange={(v) => updateParam('resistance', v, 'сопротивление R')}
                    />
                    <div>
                      <span className="eyebrow" style={{ display: 'block', marginBottom: '0.35rem' }}>
                        Режим графика
                      </span>
                      <div className="segmented">
                        <button
                          type="button"
                          className={`segmented__btn ${params.chartMode !== 'I_vs_R' ? 'is-active' : ''}`}
                          onClick={() => updateParam('chartMode', 'I_vs_U', 'график I(U)')}
                        >
                          I(U) при R = const
                        </button>
                        <button
                          type="button"
                          className={`segmented__btn ${params.chartMode === 'I_vs_R' ? 'is-active' : ''}`}
                          onClick={() => updateParam('chartMode', 'I_vs_R', 'график I(R)')}
                        >
                          I(R) при U = const
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}

                {experiment.id === 'free-fall' ? (
                  <>
                    <RangeSlider
                      label="Начальная высота"
                      symbol="h"
                      unit="м"
                      min={FREE_FALL_BOUNDS.height.min}
                      max={FREE_FALL_BOUNDS.height.max}
                      step={FREE_FALL_BOUNDS.height.step}
                      value={params.height}
                      onChange={(v) => updateParam('height', v, 'высота h')}
                    />
                    <RangeSlider
                      label="Ускорение свободного падения"
                      symbol="g"
                      unit="м/с²"
                      min={FREE_FALL_BOUNDS.gravity.min}
                      max={FREE_FALL_BOUNDS.gravity.max}
                      step={FREE_FALL_BOUNDS.gravity.step}
                      value={params.gravity}
                      onChange={(v) => updateParam('gravity', v, 'ускорение g')}
                    />
                  </>
                ) : null}

                {experiment.id === 'projectile-motion' ? (
                  <>
                    <RangeSlider
                      label="Начальная скорость"
                      symbol="v₀"
                      unit="м/с"
                      min={PROJECTILE_BOUNDS.velocity.min}
                      max={PROJECTILE_BOUNDS.velocity.max}
                      step={PROJECTILE_BOUNDS.velocity.step}
                      value={params.velocity}
                      onChange={(v) => updateParam('velocity', v, 'начальная скорость v₀')}
                    />
                    <RangeSlider
                      label="Угол запуска"
                      symbol="α"
                      unit="°"
                      min={PROJECTILE_BOUNDS.angle.min}
                      max={PROJECTILE_BOUNDS.angle.max}
                      step={PROJECTILE_BOUNDS.angle.step}
                      value={params.angle}
                      onChange={(v) => updateParam('angle', v, 'угол α')}
                    />
                    <RangeSlider
                      label="Гравитация"
                      symbol="g"
                      unit="м/с²"
                      min={PROJECTILE_BOUNDS.gravity.min}
                      max={PROJECTILE_BOUNDS.gravity.max}
                      step={PROJECTILE_BOUNDS.gravity.step}
                      value={params.gravity}
                      onChange={(v) => updateParam('gravity', v, 'гравитация g')}
                    />
                  </>
                ) : null}

                {experiment.id === 'refraction' ? (
                  <>
                    <RangeSlider
                      label="Угол падения"
                      symbol="θ₁"
                      unit="°"
                      min={REFRACTION_BOUNDS.incidentAngle.min}
                      max={REFRACTION_BOUNDS.incidentAngle.max}
                      step={REFRACTION_BOUNDS.incidentAngle.step}
                      value={params.incidentAngle}
                      onChange={(v) => updateParam('incidentAngle', v, 'угол падения θ₁')}
                    />
                    <RangeSlider
                      label="Показатель среды 1"
                      symbol="n₁"
                      min={REFRACTION_BOUNDS.n1.min}
                      max={REFRACTION_BOUNDS.n1.max}
                      step={REFRACTION_BOUNDS.n1.step}
                      value={params.n1}
                      onChange={(v) => updateParam('n1', v, 'показатель n₁')}
                    />
                    <RangeSlider
                      label="Показатель среды 2"
                      symbol="n₂"
                      min={REFRACTION_BOUNDS.n2.min}
                      max={REFRACTION_BOUNDS.n2.max}
                      step={REFRACTION_BOUNDS.n2.step}
                      value={params.n2}
                      onChange={(v) => updateParam('n2', v, 'показатель n₂')}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {MEDIA_PRESETS.map((m) => (
                        <button
                          key={m.name}
                          type="button"
                          className="btn btn--sm"
                          onClick={() => updateParam('n1', m.n, `среда 1 (${m.name})`)}
                        >
                          n₁: {m.name} ({m.n})
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}

                <div>
                  <span className="eyebrow" style={{ display: 'block', marginBottom: '0.35rem' }}>
                    Быстрые пресеты
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {experiment.presets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="btn btn--sm"
                        onClick={() => applyPreset(preset)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="panel" aria-label="График эксперимента">
              <div className="panel__header">
                <h2 className="panel__title">Визуализация зависимости</h2>
              </div>
              <div className="panel__body">
                {chartProps ? <ScientificChart {...chartProps} /> : null}
              </div>
            </section>
          </div>

          {/* Measurements Log Table */}
          <section className="panel" aria-label="Журнал наблюдений">
            <div className="panel__header">
              <h2 className="panel__title">Журнал измерений</h2>
            </div>
            <div className="panel__body">
              <MeasurementsTable
                columns={experiment.measurementColumns}
                measurements={research.measurements}
                onRemove={removeMeasurement}
                onClear={clearMeasurements}
              />
            </div>
          </section>
        </div>

        {/* Docked AI Lab Mentor */}
        <div className="workspace-mentor-col">
          <MentorPanel
            experimentTitle={experiment.title}
            mode={mode}
            aiMode={aiMode}
            messages={messages}
            loading={mentorLoading}
            error={mentorError}
            contextSummary={{
              experiment: experiment.id,
              mode,
              phase: mode === 'guided' ? research.phase : 'explore',
              parameters: params,
              results: computed,
              measurements: research.measurements.length,
            }}
            onSendMessage={handleSendMessage}
            onQuickAction={handleQuickAction}
            onClearError={() => setMentorError('')}
          />
        </div>
      </div>
    </div>
  );
}
