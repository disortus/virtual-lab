export function MeasurementsTable({ columns, measurements, onRemove, onClear }) {
  if (!measurements || measurements.length === 0) {
    return (
      <div className="panel panel--muted">
        <div className="panel__body" style={{ fontSize: '0.875rem', color: 'var(--ink-secondary)' }}>
          Журнал измерений пуст. Измените параметры установки и нажмите{' '}
          <strong>«Зафиксировать замер»</strong>, чтобы сравнить результаты и построить таблицу наблюдений.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span className="eyebrow">Зафиксированные прогоны ({measurements.length})</span>
        {onClear ? (
          <button type="button" className="btn btn--sm" onClick={onClear}>
            Очистить журнал
          </button>
        ) : null}
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <caption>Таблица экспериментальных замеров (Simulation Engine)</caption>
          <thead>
            <tr>
              <th scope="col">#</th>
              {columns.map((col) => (
                <th scope="col" key={col.key} className="num">
                  {col.label}
                </th>
              ))}
              {onRemove ? <th scope="col">Действие</th> : null}
            </tr>
          </thead>
          <tbody>
            {measurements.map((m, idx) => (
              <tr key={m.id || idx}>
                <td className="mono">{idx + 1}</td>
                {columns.map((col) => {
                  const val = m.values?.[col.key] ?? m.results?.[col.key] ?? m.parameters?.[col.key];
                  return (
                    <td key={col.key} className="num">
                      {val === null || val === undefined ? 'ПВО (нет)' : val}
                    </td>
                  );
                })}
                {onRemove ? (
                  <td>
                    <button
                      type="button"
                      className="btn btn--sm"
                      onClick={() => onRemove(m.id)}
                      aria-label={`Удалить замер ${idx + 1}`}
                    >
                      Удалить
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
