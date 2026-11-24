export function MeterReadout({ label, symbol, value, unit = '', accent = false }) {
  return (
    <div className={`meter-cell ${accent ? 'meter-cell--accent' : ''}`}>
      <div className="meter-cell__head">
        <span className="meter-cell__label">{label}</span>
        {symbol ? <span className="meter-cell__symbol">{symbol}</span> : null}
      </div>
      <div className="meter-cell__value">
        {value === null || value === undefined ? '—' : value}
        {value !== null && value !== undefined && unit ? (
          <span className="meter-cell__unit">{unit}</span>
        ) : null}
      </div>
    </div>
  );
}
