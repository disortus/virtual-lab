import { useEffect, useId, useRef } from 'react';

export function RangeSlider({
  label,
  symbol,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  disabled = false,
}) {
  const inputId = useId();
  const inputRef = useRef(null);

  // Sync CSS custom properties for active track fill across WebKit/Safari/Firefox
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.setProperty('--attr-min', String(min));
    el.style.setProperty('--attr-max', String(max));
    el.style.setProperty('--control-value', String(value));
  }, [min, max, value]);

  const formattedValue = `${value}${unit ? ` ${unit}` : ''}`;

  return (
    <div className="control-field">
      <div className="control-field__top">
        <label htmlFor={inputId} className="control-field__label">
          {label} {symbol ? <span className="mono" style={{ color: 'var(--ink-secondary)' }}>({symbol})</span> : null}
        </label>
        <span className="control-field__readout">{formattedValue}</span>
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type="range"
        className="lab-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={formattedValue}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="control-field__bounds" aria-hidden="true">
        <span>
          {min}
          {unit ? ` ${unit}` : ''}
        </span>
        <span>
          {max}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
    </div>
  );
}
