import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteReport, listReports } from '../services/reportStorage.js';

export function ReportsPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    document.title = 'Научные отчёты | Virtual Science Lab';
    setReports(listReports());
  }, []);

  const handleDelete = (id) => {
    setReports(deleteReport(id));
  };

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
          <span className="eyebrow">LAB ARCHIVE · LOCALSTORAGE</span>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginTop: '0.25rem' }}>Научные отчёты</h1>
        </div>
        <Link to="/labs/physics" className="btn btn--primary">
          Провести новое исследование
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="panel">
          <div className="panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '620px' }}>
            <h2>Пока нет сохранённых отчётов</h2>
            <p style={{ color: 'var(--ink-secondary)' }}>
              Пройдите любой эксперимент в режиме <strong>Исследование (Guided)</strong>: выдвиньте гипотезу,
              соберите не менее двух замеров, обсудите данные с AI Lab Mentor и сформулируйте вывод. После этого
              система сформирует готовый отчёт с возможностью печати в PDF.
            </p>
            <div>
              <Link to="/labs/physics/ohms-law?mode=guided" className="btn btn--blue">
                Начать исследование: Закон Ома →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {reports.map((rep) => (
            <article key={rep.id} className="panel">
              <div className="panel__header">
                <span className="badge badge--blue">{rep.experimentCode}</span>
                <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--ink-secondary)' }}>
                  {new Date(rep.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div className="panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '1.1rem' }}>{rep.experimentTitle}</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)' }}>
                  <strong>Вывод:</strong> {rep.conclusion.slice(0, 140)}
                  {rep.conclusion.length > 140 ? '…' : ''}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <Link to={`/reports/${rep.id}`} className="btn btn--primary btn--sm">
                    Открыть отчёт
                  </Link>
                  <button type="button" className="btn btn--sm" onClick={() => handleDelete(rep.id)}>
                    Удалить
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
