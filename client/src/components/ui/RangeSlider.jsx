import { useEffect, useId, useRef, useState } from 'react';
import { clamp } from '../../simulations/utils.js';

function getStepPrecision(step) {
  const s = String(step);
  const dotIdx = s.indexOf('.');
  return dotIdx === -1 ? 0 : s.length - dotIdx - 1;
}

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
  const sliderId = useId();
  const numberId = useId();
  const inputRef = useRef(null);
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  // Sync CSS custom properties for active track fill across WebKit/Safari/Firefox
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.setProperty('--attr-min', String(min));
    el.style.setProperty('--attr-max', String(max));
    el.style.setProperty('--control-value', String(value));
  }, [min, max, value]);

  const commitDraft = (rawText) => {
    const normalized = String(rawText).replace(',', '.').trim();
    const parsed = Number(normalized);
    if (!normalized || !Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = clamp(parsed, min, max);
    const precision = getStepPrecision(step);
    const snapped = Number((Math.round(clamped / step) * step).toFixed(precision));
    const finalVal = clamp(snapped, min, max);
    setDraft(String(finalVal));
    onChange(finalVal);
  };

  const formattedValue = `${value}${unit ? ` ${unit}` : ''}`;

  return (
    <div className="control-field">
      <div className="control-field__top">
        <label htmlFor={sliderId} className="control-field__label">
          {label}{' '}
          {symbol ? (
            <span className="mono" style={{ color: 'var(--ink-secondary)' }}>
              ({symbol})
            </span>
          ) : null}
        </label>

        <div className="control-field__input-wrap">
          <label htmlFor={numberId} className="visually-hidden">
            Точное значение: {label} ({unit || 'ед.'})
          </label>
          <input
            id={numberId}
            type="number"
            inputMode="decimal"
            className="control-field__number"
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commitDraft(draft)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitDraft(draft);
                e.currentTarget.blur();
              }
            }}
          />
          {unit ? <span className="control-field__unit">{unit}</span> : null}
        </div>
      </div>

      <input
        ref={inputRef}
        id={sliderId}
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
