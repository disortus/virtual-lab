import { useEffect, useId, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getReportById, updateReportConclusion } from '../services/reportStorage.js';
import { MeasurementsTable } from '../components/experiments/MeasurementsTable.jsx';

export function ReportDetailPage() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [conclusionDraft, setConclusionDraft] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const conclusionInputId = useId();

  useEffect(() => {
    const found = getReportById(reportId);
    setReport(found);
    setConclusionDraft(found?.conclusion || '');
    document.title = found ? `Отчёт: ${found.experimentTitle} | Virtual Science Lab` : 'Отчёт не найден';
  }, [reportId]);

  const handleSaveConclusion = () => {
    if (!report) return;
    const updated = updateReportConclusion(report.id, conclusionDraft.trim());
    if (updated) {
      setReport(updated);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    }
  };

  if (!report) {
    return (
      <div className="container" style={{ paddingBlock: '3rem' }}>
        <div className="panel">
          <div className="panel__body">
            <h1>Отчёт не найден</h1>
            <p style={{ marginBlock: '1rem', color: 'var(--ink-secondary)' }}>
              Возможно, отчёт был удалён из локального хранилища браузера.
            </p>
            <Link to="/reports" className="btn btn--primary">
              Вернуться к архиву отчётов
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container report-sheet" style={{ paddingBlock: '2rem 4rem', maxWidth: '940px' }}>
      <div
        className="no-print"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <Link to="/reports" className="btn btn--sm">
          ← Все отчёты
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/labs/physics/${report.experimentId}?mode=guided`} className="btn btn--sm">
            Открыть эксперимент
          </Link>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => window.print()}>
            Печать / Сохранить PDF
          </button>
        </div>
      </div>

      <article className="panel" style={{ padding: '1.75rem' }}>
        <header style={{ borderBottom: '2px solid var(--border-strong)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div className="eyebrow">
            VIRTUAL SCIENCE LAB · НАУЧНЫЙ ОТЧЁТ · {report.experimentCode}
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginTop: '0.35rem' }}>{report.experimentTitle}</h1>
          <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--ink-secondary)', marginTop: '0.45rem' }}>
            Дата создания: {new Date(report.createdAt).toLocaleString('ru-RU')}
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <section>
            <h2 className="eyebrow" style={{ marginBottom: '0.3rem' }}>
              1. Цель исследования (Research Objective)
            </h2>
            <p>{report.objective}</p>
            {report.researchQuestion ? (
              <p style={{ marginTop: '0.35rem', color: 'var(--ink-secondary)' }}>
                <strong>Исследовательский вопрос:</strong> {report.researchQuestion}
              </p>
            ) : null}
          </section>

          <section>
            <h2 className="eyebrow" style={{ marginBottom: '0.3rem' }}>
              2. Исходная гипотеза (Initial Hypothesis)
            </h2>
            <p>
              <strong>Выбранное предположение:</strong> {report.hypothesisChoice}
            </p>
            <p style={{ marginTop: '0.3rem', color: 'var(--ink-secondary)' }}>
              <strong>Обоснование ученика:</strong> {report.hypothesisReasoning}
            </p>
          </section>

          <section>
            <h2 className="eyebrow" style={{ marginBottom: '0.3rem' }}>
              3. Параметры эксперимента (Experimental Parameters)
            </h2>
            <pre
              className="mono"
              style={{
                margin: 0,
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-instrument)',
                border: '1px solid var(--border-hairline)',
                borderRadius: '2px',
                fontSize: '0.82rem',
                overflowX: 'auto',
              }}
            >
              {JSON.stringify(report.parameters, null, 2)}
            </pre>
          </section>

          <section>
            <h2 className="eyebrow" style={{ marginBottom: '0.45rem' }}>
              4. Наблюдаемые результаты (Observed Results)
            </h2>
            <MeasurementsTable columns={report.columns || []} measurements={report.measurements || []} />
          </section>

          <section>
            <h2 className="eyebrow" style={{ marginBottom: '0.3rem' }}>
              5. Анализ данных (Data Analysis)
            </h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{report.analysisNotes}</p>
          </section>

          <section>
            <h2 className="eyebrow" style={{ marginBottom: '0.35rem' }}>
              6. Вывод ученика (Conclusion)
            </h2>
            <p style={{ padding: '0.75rem', background: 'var(--bg-instrument)', borderLeft: '3px solid var(--accent-blue)' }}>
              {report.conclusion}
            </p>

            <div className="no-print" style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor={conclusionInputId} style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Редактировать заключение:
              </label>
              <textarea
                id={conclusionInputId}
                rows={3}
                maxLength={1200}
                className="lab-textarea"
                value={conclusionDraft}
                onChange={(e) => setConclusionDraft(e.target.value)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button type="button" className="btn btn--blue btn--sm" onClick={handleSaveConclusion}>
                  Сохранить изменения
                </button>
                {savedNotice ? (
                  <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }} role="status">
                    Вывод обновлён
                  </span>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
