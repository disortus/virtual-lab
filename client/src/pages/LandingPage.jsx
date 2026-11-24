import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EXPERIMENT_LIST } from '../simulations/index.js';
import { ArrowRightIcon } from '../components/ui/Icons.jsx';

const RESEARCH_STEPS = [
  { num: '01', en: 'Explore', ru: 'Изучение', desc: 'Постановка вопроса и границ явления без перегрузки теорией.' },
  { num: '02', en: 'Hypothesize', ru: 'Гипотеза', desc: 'Ученик делает прогноз и объясняет, почему он так считает.' },
  { num: '03', en: 'Experiment', ru: 'Эксперимент', desc: 'Изменение физических параметров и запуск модели.' },
  { num: '04', en: 'Observe', ru: 'Наблюдение', desc: 'Фиксация серий замеров, дельт и кривых на графике.' },
  { num: '05', en: 'Analyze', ru: 'Анализ', desc: 'AI Lab Mentor помогает увидеть закономерность вопросами.' },
  { num: '06', en: 'Conclude', ru: 'Вывод', desc: 'Самостоятельный вывод и формирование научного отчёта.' },
];

export function LandingPage() {
  useEffect(() => {
    document.title = 'Virtual Science Lab — Don’t just learn science. Discover it.';
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{ borderBottom: '1px solid var(--border-strong)', paddingBlock: '3rem 3.5rem' }}>
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2.25rem',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <span className="badge badge--blue">ITFEST 2026 BETA</span>
              <span className="eyebrow">MINDS &amp; MACHINES IN RETHINKING LEARNING</span>
            </div>

            <h1 style={{ fontSize: 'var(--text-hero)' }}>
              Don&apos;t just learn science.{' '}
              <span style={{ color: 'var(--accent-blue)' }}>Discover it.</span>
            </h1>

            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-secondary)', maxWidth: '56ch' }}>
              Интерактивная исследовательская лаборатория, где ученик сам проверяет физические законы на точных
              симуляциях, а <strong>AI Lab Mentor</strong> направляет мышление вопросами по методу Сократа вместо
              выдачи готовых ответов.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.35rem' }}>
              <Link to="/labs/physics/ohms-law?mode=guided" className="btn btn--primary">
                Запустить исследование
                <ArrowRightIcon />
              </Link>
              <Link to="/labs/physics" className="btn">
                Все эксперименты (8)
              </Link>
              <Link to="/labs" className="btn">
                Каталог лабораторий
              </Link>
            </div>
          </div>

          {/* Editorial Schematic Instrument Preview */}
          <div className="panel" aria-label="Схема архитектуры симуляции">
            <div className="panel__header">
              <span className="eyebrow">SPECIMEN · SIMULATION → AI PIPELINE</span>
              <span className="badge badge--live">DETERMINISTIC MATH</span>
            </div>
            <div className="panel__body grid-surface" style={{ padding: '1.25rem' }}>
              <svg
                viewBox="0 0 460 270"
                role="img"
                aria-label="Схема работы: физическая модель вычисляет показатели, а AI-наставник анализирует контекст"
                style={{ width: '100%', height: 'auto' }}
              >
                <title>Архитектура Simulation Engine и AI Lab Mentor</title>
                {/* Ballistic parabola */}
                <line x1="36" y1="220" x2="425" y2="220" stroke="#17212B" strokeWidth="2" />
                <line x1="36" y1="36" x2="36" y2="220" stroke="#17212B" strokeWidth="2" />
                <path
                  d="M 36 220 Q 195 28 354 220"
                  fill="none"
                  stroke="#315BE8"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />
                <circle cx="195" cy="124" r="7" fill="#EF8737" stroke="#17212B" strokeWidth="2" />
                <line x1="195" y1="124" x2="195" y2="220" stroke="#EF8737" strokeWidth="1.3" strokeDasharray="3 3" />
                <text x="206" y="120" fontSize="11.5" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
                  H = v₀²·sin²(α) / 2g
                </text>
                <text x="354" y="242" textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" fill="#505862">
                  L = 63.71 м
                </text>

                {/* Optics insert */}
                <rect x="275" y="18" width="165" height="82" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="1.5" />
                <line x1="275" y1="59" x2="440" y2="59" stroke="#17212B" strokeWidth="1.5" />
                <line x1="358" y1="26" x2="358" y2="92" stroke="#747B83" strokeDasharray="2 2" />
                <line x1="312" y1="28" x2="358" y2="59" stroke="#EF8737" strokeWidth="2.5" />
                <line x1="358" y1="59" x2="386" y2="92" stroke="#315BE8" strokeWidth="2.5" />
                <text x="285" y="34" fontSize="10" fontFamily="IBM Plex Mono" fill="#505862">
                  n₁·sinθ₁ = n₂·sinθ₂
                </text>
              </svg>
              <div
                className="mono"
                style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.65rem',
                  borderTop: '1px solid var(--border-hairline)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  fontSize: '0.78rem',
                  color: 'var(--ink-secondary)',
                }}
              >
                <span>Расчёты: чистый JS Simulation Engine</span>
                <span>Диалог: Socratic AI Mentor</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principle & Socratic Dialogue */}
      <section style={{ borderBottom: '1px solid var(--border-strong)', background: 'var(--bg-paper)', paddingBlock: '3rem' }}>
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <span className="eyebrow">ПЕДАГОГИЧЕСКИЙ ПРИНЦИП</span>
            <h2 style={{ fontSize: 'var(--text-2xl)' }}>
              The AI should teach students HOW to think, not WHAT to think.
            </h2>
            <p style={{ color: 'var(--ink-secondary)' }}>
              Обычные учебники и чат-боты дают готовую формулу или ответ сразу. В Virtual Science Lab ИИ видит
              параметры вашей установки, вашу гипотезу и реальные показания приборов — и помогает самостоятельно
              найти физическую закономерность.
            </p>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>Физические расчёты всегда выполняются детерминированным Simulation Engine, а не ИИ.</li>
              <li>Два режима работы: пошаговый <strong>Guided Research</strong> и свободный <strong>Free Exploration</strong>.</li>
              <li>Автоматический научный отчёт с возможностью редактирования вывода и печати в PDF.</li>
            </ul>
          </div>

          <div className="panel panel--muted">
            <div className="panel__header">
              <span className="eyebrow">ПРИМЕР ДИАЛОГА · МЕТОД СОКРАТА</span>
              <span className="badge badge--blue">EXP—01</span>
            </div>
            <div className="panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div className="mentor-msg mentor-msg--mentor">
                <div className="mentor-msg__meta">
                  <span>AI LAB MENTOR</span>
                </div>
                Ты увеличил сопротивление с 10 Ом до 20 Ом. Как думаешь, что произойдёт с силой тока?
              </div>
              <div className="mentor-msg mentor-msg--student">
                <div className="mentor-msg__meta">
                  <span>УЧЕНИК</span>
                </div>
                Наверное, она увеличится.
              </div>
              <div className="mentor-msg mentor-msg--mentor">
                <div className="mentor-msg__meta">
                  <span>AI LAB MENTOR</span>
                </div>
                Интересная гипотеза. Вспомним закон Ома: если напряжение остаётся прежним, как большее сопротивление
                влияет на поток зарядов? Проверь показания амперметра!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Step Guided Research Cycle */}
      <section style={{ borderBottom: '1px solid var(--border-strong)', paddingBlock: '3rem' }}>
        <div className="container">
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="eyebrow">МЕТОДОЛОГИЯ ИССЛЕДОВАНИЯ</span>
            <h2 style={{ fontSize: 'var(--text-2xl)', marginTop: '0.25rem' }}>
              Полный научный цикл в каждом эксперименте
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
              gap: '1px',
              background: 'var(--border-hairline)',
              border: '1px solid var(--border-strong)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            {RESEARCH_STEPS.map((step) => (
              <div key={step.num} style={{ background: 'var(--bg-paper)', padding: '1rem' }}>
                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                  {step.num} · {step.en.toUpperCase()}
                </div>
                <h3 style={{ fontSize: '1.05rem', marginTop: '0.25rem', marginBottom: '0.4rem' }}>{step.ru}</h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiments & Labs Preview */}
      <section style={{ paddingBlock: '3rem 1.5rem' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span className="eyebrow">ДОСТУПНО В BETA · PHYSICS LAB · 5 НАПРАВЛЕНИЙ</span>
              <h2 style={{ fontSize: 'var(--text-2xl)', marginTop: '0.25rem' }}>Восемь интерактивных экспериментов</h2>
            </div>
            <Link to="/labs" className="btn">
              Все лаборатории (Physics &amp; Chemistry)
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {EXPERIMENT_LIST.map((exp) => (
              <article key={exp.id} className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="panel__header">
                    <span className="eyebrow">{exp.code}</span>
                    <span className="badge badge--blue">{exp.formula}</span>
                  </div>
                  <div className="panel__body">
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.45rem' }}>{exp.title}</h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>{exp.description}</p>
                  </div>
                </div>
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderTop: '1px solid var(--border-hairline)',
                    display: 'flex',
                    gap: '0.5rem',
                  }}
                >
                  <Link to={`/labs/physics/${exp.id}?mode=guided`} className="btn btn--primary btn--sm">
                    Исследование
                  </Link>
                  <Link to={`/labs/physics/${exp.id}?mode=free`} className="btn btn--sm">
                    Свободно
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
