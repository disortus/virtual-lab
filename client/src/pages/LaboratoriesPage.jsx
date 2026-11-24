import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../components/ui/Icons.jsx';

export function LaboratoriesPage() {
  useEffect(() => {
    document.title = 'Каталог лабораторий | Virtual Science Lab';
  }, []);

  return (
    <div className="container" style={{ paddingBlock: '2rem 4rem' }}>
      <div style={{ borderBottom: '1px solid var(--border-strong)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <span className="eyebrow">LABORATORIES DIRECTORY</span>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginTop: '0.25rem' }}>Научные лаборатории</h1>
        <p style={{ color: 'var(--ink-secondary)', maxWidth: '62ch', marginTop: '0.4rem' }}>
          Выберите направление для проведения экспериментов. В Beta-версии полностью реализована Physics Lab с
          восемью установками по пяти разделам физики; Chemistry Lab готовится к следующему этапу развития платформы.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.25rem' }}>
        <article className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="panel__header">
              <span className="eyebrow">LAB—01 · ФИЗИКА</span>
              <span className="badge badge--live">AVAILABLE · 8 ЭКСПЕРИМЕНТОВ</span>
            </div>
            <div className="panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h2 style={{ fontSize: '1.45rem' }}>Physics Lab</h2>
              <p style={{ color: 'var(--ink-secondary)' }}>
                Восемь интерактивных установок по пяти разделам физики с числовыми контролами, графиками в реальном
                времени, циклом Guided Research, научными отчётами и AI Lab Mentor.
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.15rem', fontSize: '0.9rem' }}>
                <li>Mechanics &amp; Motion: Свободное падение, Баллистика, Второй закон Ньютона</li>
                <li>Electricity &amp; Circuits: Закон Ома, Последовательное и параллельное соединение</li>
                <li>Optics: Преломление света и полное внутреннее отражение</li>
                <li>Thermodynamics: Уравнение идеального газа (PV = nRT)</li>
                <li>Waves &amp; Oscillations: Интерференция и суперпозиция волн</li>
              </ul>
            </div>
          </div>
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-hairline)' }}>
            <Link to="/labs/physics" className="btn btn--primary">
              Открыть Physics Lab
              <ArrowRightIcon />
            </Link>
          </div>
        </article>

        <article
          className="panel panel--muted"
          aria-label="Chemistry Lab — скоро будет доступна"
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div>
            <div className="panel__header">
              <span className="eyebrow">LAB—02 · ХИМИЯ</span>
              <span className="badge badge--muted">COMING SOON</span>
            </div>
            <div className="panel__body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h2 style={{ fontSize: '1.45rem', color: 'var(--ink-secondary)' }}>Chemistry Lab</h2>
              <p style={{ color: 'var(--ink-secondary)' }}>
                Раздел находится в проектировании и будет открыт после завершения онлайн-отбора ITFest 2026. В
                Beta-версии симуляции химии намеренно не добавлены, чтобы гарантировать максимальную достоверность
                физического модуля.
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.15rem', fontSize: '0.9rem', color: 'var(--ink-secondary)' }}>
                <li>Кислотно-щелочное титрование и pH-индикаторы (план)</li>
                <li>Скорость химических реакций и катализ (план)</li>
                <li>Закон сохранения массы и стехиометрия (план)</li>
              </ul>
            </div>
          </div>
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-hairline)' }}>
            <button type="button" className="btn" disabled>
              В разработке (Coming Soon)
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
