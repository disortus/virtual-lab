import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EXPERIMENT_LIST } from '../simulations/index.js';

const BRANCH_SECTIONS = [
  {
    key: 'mechanics',
    code: 'SEC—01',
    title: 'Mechanics & Motion',
    subtitle: 'Механика и движение: кинематика падения, баллистика и динамика сил',
    accent: '#315BE8',
  },
  {
    key: 'electricity',
    code: 'SEC—02',
    title: 'Electricity & Circuits',
    subtitle: 'Электричество и цепи: закон Ома и многоконтурные соединения',
    accent: '#17212B',
  },
  {
    key: 'optics',
    code: 'SEC—03',
    title: 'Optics',
    subtitle: 'Оптика: преломление на границе сред и полное внутреннее отражение',
    accent: '#315BE8',
  },
  {
    key: 'thermodynamics',
    code: 'SEC—04',
    title: 'Thermodynamics',
    subtitle: 'Термодинамика: уравнение состояния идеального газа и изотермы',
    accent: '#B55610',
  },
  {
    key: 'waves',
    code: 'SEC—05',
    title: 'Waves & Oscillations',
    subtitle: 'Волны и колебания: суперпозиция, фазовый сдвиг и интерференция',
    accent: '#315BE8',
  },
];

const BRANCH_FILTERS = [
  { key: 'all', label: 'Все разделы (8)' },
  { key: 'mechanics', label: 'Mechanics & Motion' },
  { key: 'electricity', label: 'Electricity & Circuits' },
  { key: 'optics', label: 'Optics' },
  { key: 'thermodynamics', label: 'Thermodynamics' },
  { key: 'waves', label: 'Waves & Oscillations' },
];

function ExperimentThumbnail({ id }) {
  if (id === 'ohms-law') {
    return (
      <svg viewBox="0 0 240 88" aria-hidden="true" className="grid-surface" style={{ width: '100%', height: '88px', borderBottom: '1px solid var(--border-hairline)' }}>
        <rect x="34" y="18" width="172" height="52" fill="none" stroke="#17212B" strokeWidth="2" />
        <rect x="90" y="60" width="60" height="18" fill="#FFFFFF" stroke="#17212B" strokeWidth="2" />
        <circle cx="34" cy="44" r="11" fill="#FFFFFF" stroke="#EF8737" strokeWidth="2" />
        <circle cx="206" cy="44" r="11" fill="#FFFFFF" stroke="#315BE8" strokeWidth="2" />
      </svg>
    );
  }
  if (id === 'series-parallel') {
    return (
      <svg viewBox="0 0 240 88" aria-hidden="true" className="grid-surface" style={{ width: '100%', height: '88px', borderBottom: '1px solid var(--border-hairline)' }}>
        <path d="M 30 44 L 70 44 L 70 22 L 170 22 L 170 44 L 210 44 M 70 44 L 70 66 L 170 66 L 170 44" fill="none" stroke="#17212B" strokeWidth="1.8" />
        <rect x="98" y="14" width="44" height="16" fill="#FFFFFF" stroke="#315BE8" strokeWidth="1.8" />
        <rect x="98" y="58" width="44" height="16" fill="#FFFFFF" stroke="#EF8737" strokeWidth="1.8" />
      </svg>
    );
  }
  if (id === 'free-fall') {
    return (
      <svg viewBox="0 0 240 88" aria-hidden="true" className="grid-surface" style={{ width: '100%', height: '88px', borderBottom: '1px solid var(--border-hairline)' }}>
        <line x1="72" y1="10" x2="72" y2="76" stroke="#17212B" strokeWidth="1.5" />
        <line x1="46" y1="76" x2="194" y2="76" stroke="#17212B" strokeWidth="2" />
        <circle cx="122" cy="18" r="4.5" fill="rgba(49,91,232,0.2)" stroke="#315BE8" strokeDasharray="2 2" />
        <circle cx="122" cy="34" r="5.5" fill="rgba(49,91,232,0.25)" stroke="#315BE8" strokeDasharray="2 2" />
        <circle cx="122" cy="58" r="8" fill="#EF8737" stroke="#17212B" strokeWidth="1.8" />
      </svg>
    );
  }
  if (id === 'projectile-motion') {
    return (
      <svg viewBox="0 0 240 88" aria-hidden="true" className="grid-surface" style={{ width: '100%', height: '88px', borderBottom: '1px solid var(--border-hairline)' }}>
        <line x1="26" y1="72" x2="214" y2="72" stroke="#17212B" strokeWidth="2" />
        <path d="M 34 72 Q 120 6 204 72" fill="none" stroke="#315BE8" strokeWidth="2.2" strokeDasharray="4 3" />
        <circle cx="120" cy="39" r="6" fill="#EF8737" stroke="#17212B" strokeWidth="1.8" />
      </svg>
    );
  }
  if (id === 'newtons-second-law') {
    return (
      <svg viewBox="0 0 240 88" aria-hidden="true" className="grid-surface" style={{ width: '100%', height: '88px', borderBottom: '1px solid var(--border-hairline)' }}>
        <line x1="20" y1="68" x2="220" y2="68" stroke="#17212B" strokeWidth="2" />
        <rect x="86" y="36" width="54" height="26" fill="#FFFFFF" stroke="#17212B" strokeWidth="2" />
        <circle cx="98" cy="64" r="4" fill="#17212B" />
        <circle cx="128" cy="64" r="4" fill="#17212B" />
        <line x1="140" y1="49" x2="195" y2="49" stroke="#315BE8" strokeWidth="2.6" />
        <line x1="86" y1="58" x2="48" y2="58" stroke="#EF8737" strokeWidth="2.2" />
      </svg>
    );
  }
  if (id === 'refraction') {
    return (
      <svg viewBox="0 0 240 88" aria-hidden="true" className="grid-surface" style={{ width: '100%', height: '88px', borderBottom: '1px solid var(--border-hairline)' }}>
        <rect x="0" y="44" width="240" height="44" fill="rgba(49,91,232,0.09)" />
        <line x1="0" y1="44" x2="240" y2="44" stroke="#17212B" strokeWidth="1.8" />
        <line x1="120" y1="6" x2="120" y2="82" stroke="#747B83" strokeDasharray="3 3" />
        <line x1="64" y1="10" x2="120" y2="44" stroke="#EF8737" strokeWidth="2.4" />
        <line x1="120" y1="44" x2="156" y2="82" stroke="#315BE8" strokeWidth="2.4" />
      </svg>
    );
  }
  if (id === 'ideal-gas') {
    return (
      <svg viewBox="0 0 240 88" aria-hidden="true" className="grid-surface" style={{ width: '100%', height: '88px', borderBottom: '1px solid var(--border-hairline)' }}>
        <rect x="64" y="14" width="84" height="62" fill="rgba(49,91,232,0.07)" stroke="#17212B" strokeWidth="2" />
        <rect x="66" y="26" width="80" height="8" fill="#EAE5D9" stroke="#17212B" strokeWidth="1.5" />
        <circle cx="88" cy="52" r="3" fill="#315BE8" />
        <circle cx="110" cy="46" r="3" fill="#EF8737" />
        <circle cx="128" cy="60" r="3" fill="#315BE8" />
        <circle cx="98" cy="64" r="3" fill="#EF8737" />
        <circle cx="182" cy="44" r="18" fill="#FFFFFF" stroke="#17212B" strokeWidth="1.8" />
        <line x1="182" y1="44" x2="192" y2="33" stroke="#EF8737" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 88" aria-hidden="true" className="grid-surface" style={{ width: '100%', height: '88px', borderBottom: '1px solid var(--border-hairline)' }}>
      <line x1="16" y1="44" x2="224" y2="44" stroke="#D4CEC0" strokeWidth="1.2" />
      <path d="M 16 44 Q 42 18 68 44 T 120 44 T 172 44 T 224 44" fill="none" stroke="#315BE8" strokeWidth="1.6" strokeDasharray="3 2" />
      <path d="M 16 44 Q 42 8 68 44 T 120 44 T 172 44 T 224 44" fill="none" stroke="#17212B" strokeWidth="2.4" />
    </svg>
  );
}

export function PhysicsLabPage() {
  const [branch, setBranch] = useState('all');

  useEffect(() => {
    document.title = 'Physics Lab — 8 экспериментов | Virtual Science Lab';
  }, []);

  const visibleSections =
    branch === 'all' ? BRANCH_SECTIONS : BRANCH_SECTIONS.filter((sec) => sec.key === branch);

  return (
    <div className="container" style={{ paddingBlock: '2rem 4rem' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '1rem',
          paddingBottom: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-strong)',
        }}
      >
        <div>
          <span className="eyebrow">LAB—01 · PHYSICS LAB · 5 НАПРАВЛЕНИЙ</span>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginTop: '0.25rem' }}>Каталог физических экспериментов</h1>
        </div>

        <div className="segmented" role="group" aria-label="Фильтр по разделу физики">
          {BRANCH_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`segmented__btn ${branch === f.key ? 'is-active' : ''}`}
              onClick={() => setBranch(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>
        {visibleSections.map((sec) => {
          const items = EXPERIMENT_LIST.filter((e) => e.branchKey === sec.key);
          return (
            <section key={sec.key} aria-labelledby={`sec-${sec.key}`}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: '0.5rem',
                  paddingBottom: '0.6rem',
                  marginBottom: '1rem',
                  borderBottom: `2px solid ${sec.accent}`,
                }}
              >
                <div>
                  <span className="eyebrow">{sec.code}</span>
                  <h2 id={`sec-${sec.key}`} style={{ fontSize: 'var(--text-xl)', marginTop: '0.15rem' }}>
                    {sec.title}
                  </h2>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>{sec.subtitle}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.15rem' }}>
                {items.map((exp) => (
                  <article
                    key={exp.id}
                    className="panel"
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div className="panel__header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span className="eyebrow">{exp.code}</span>
                          <span className="badge badge--live">AVAILABLE</span>
                        </div>
                        <span className="badge badge--blue">{exp.formula}</span>
                      </div>
                      <ExperimentThumbnail id={exp.id} />
                      <div className="panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <h3 style={{ fontSize: '1.15rem' }}>{exp.title}</h3>
                        <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
                          <strong>Цель:</strong> {exp.guided.objective}
                        </p>
                        {exp.quantities ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                            {exp.quantities.map((q) => (
                              <span key={q} className="badge badge--muted">
                                {q}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '0.8rem 1rem',
                        borderTop: '1px solid var(--border-hairline)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <Link to={`/labs/physics/${exp.id}?mode=guided`} className="btn btn--primary btn--sm">
                        Guided Research
                      </Link>
                      <Link to={`/labs/physics/${exp.id}?mode=free`} className="btn btn--sm">
                        Свободно
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
