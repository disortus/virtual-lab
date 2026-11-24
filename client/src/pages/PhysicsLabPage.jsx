import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EXPERIMENT_LIST } from '../simulations/index.js';

const BRANCH_FILTERS = [
  { key: 'all', label: 'Все разделы' },
  { key: 'electricity', label: 'Электричество' },
  { key: 'mechanics', label: 'Механика' },
  { key: 'optics', label: 'Оптика' },
];

function ExperimentThumbnail({ id }) {
  if (id === 'ohms-law') {
    return (
      <svg viewBox="0 0 220 90" aria-hidden="true" className="grid-surface" style={{ width: '100%', height: '90px', borderBottom: '1px solid var(--border-hairline)' }}>
        <rect x="28" y="20" width="164" height="50" fill="none" stroke="#17212B" strokeWidth="2" />
        <rect x="82" y="60" width="56" height="18" fill="#FFFFFF" stroke="#17212B" strokeWidth="2" />
        <circle cx="28" cy="45" r="11" fill="#FFFFFF" stroke="#EF8737" strokeWidth="2" />
        <circle cx="192" cy="45" r="11" fill="#FFFFFF" stroke="#315BE8" strokeWidth="2" />
      </svg>
    );
  }
  if (id === 'free-fall') {
    return (
      <svg viewBox="0 0 220 90" aria-hidden="true" className="grid-surface" style={{ width: '100%', height: '90px', borderBottom: '1px solid var(--border-hairline)' }}>
        <line x1="65" y1="12" x2="65" y2="76" stroke="#17212B" strokeWidth="1.5" />
        <line x1="40" y1="76" x2="180" y2="76" stroke="#17212B" strokeWidth="2" />
        <circle cx="115" cy="20" r="5" fill="rgba(49,91,232,0.2)" stroke="#315BE8" strokeDasharray="2 2" />
        <circle cx="115" cy="36" r="6" fill="rgba(49,91,232,0.25)" stroke="#315BE8" strokeDasharray="2 2" />
        <circle cx="115" cy="60" r="8" fill="#EF8737" stroke="#17212B" strokeWidth="1.8" />
      </svg>
    );
  }
  if (id === 'projectile-motion') {
    return (
      <svg viewBox="0 0 220 90" aria-hidden="true" className="grid-surface" style={{ width: '100%', height: '90px', borderBottom: '1px solid var(--border-hairline)' }}>
        <line x1="25" y1="74" x2="195" y2="74" stroke="#17212B" strokeWidth="2" />
        <path d="M 32 74 Q 110 8 188 74" fill="none" stroke="#315BE8" strokeWidth="2.2" strokeDasharray="4 3" />
        <circle cx="110" cy="41" r="6" fill="#EF8737" stroke="#17212B" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 220 90" aria-hidden="true" className="grid-surface" style={{ width: '100%', height: '90px', borderBottom: '1px solid var(--border-hairline)' }}>
      <rect x="0" y="45" width="220" height="45" fill="rgba(49,91,232,0.09)" />
      <line x1="0" y1="45" x2="220" y2="45" stroke="#17212B" strokeWidth="1.8" />
      <line x1="110" y1="8" x2="110" y2="82" stroke="#747B83" strokeDasharray="3 3" />
      <line x1="56" y1="12" x2="110" y2="45" stroke="#EF8737" strokeWidth="2.5" />
      <line x1="110" y1="45" x2="146" y2="82" stroke="#315BE8" strokeWidth="2.5" />
    </svg>
  );
}

export function PhysicsLabPage() {
  const [branch, setBranch] = useState('all');

  useEffect(() => {
    document.title = 'Physics Lab — Эксперименты | Virtual Science Lab';
  }, []);

  const filtered =
    branch === 'all' ? EXPERIMENT_LIST : EXPERIMENT_LIST.filter((e) => e.branchKey === branch);

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
          <span className="eyebrow">LAB—01 · PHYSICS LAB</span>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.15rem' }}>
        {filtered.map((exp) => (
          <article
            key={exp.id}
            className="panel"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div className="panel__header">
                <span className="eyebrow">
                  {exp.code} · {exp.branch}
                </span>
                <span className="badge badge--blue">{exp.formula}</span>
              </div>
              <ExperimentThumbnail id={exp.id} />
              <div className="panel__body">
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.45rem' }}>{exp.title}</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>{exp.description}</p>
              </div>
            </div>
            <div
              style={{
                padding: '0.85rem 1rem',
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
                Free Exploration
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
