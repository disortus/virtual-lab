import { useEffect, useState } from 'react';

export function OhmsLawStage({ state, onToggleCircuit }) {
  const { voltage, resistance, circuitClosed, current, power, thermalLoad } = state;
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!circuitClosed || current <= 0) return undefined;
    let frameId;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Speed proportional to current, capped for comfortable visual tracking
      const speed = Math.min(180, 22 + current * 24);
      setPhase((p) => (p + speed * dt) % 1000);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [circuitClosed, current]);

  // Ammeter needle angle (-65deg to +65deg for 0..6 A scale, capped safely)
  const scaleMax = 6;
  const needleRatio = Math.min(1, current / scaleMax);
  const needleDeg = -65 + needleRatio * 130;

  const resistorFill =
    thermalLoad === 'high'
      ? 'rgba(239, 135, 55, 0.35)'
      : thermalLoad === 'moderate'
        ? 'rgba(239, 135, 55, 0.16)'
        : '#FFFFFF';

  const electronOffsets = [0, 125, 250, 375, 500, 625, 750, 875];
  const getLoopPoint = (dist) => {
    // Perimeter of loop: x in [100..540] (440), y in [80..290] (210) => total 1300
    const d = ((dist % 1000) / 1000) * 1300;
    if (d < 440) return { x: 100 + d, y: 80 };
    if (d < 650) return { x: 540, y: 80 + (d - 440) };
    if (d < 1090) return { x: 540 - (d - 650), y: 290 };
    return { x: 100, y: 290 - (d - 1090) };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <svg
        viewBox="0 0 640 360"
        role="img"
        aria-label={`Электрическая схема закона Ома: напряжение ${voltage} В, сопротивление ${resistance} Ом, цепь ${circuitClosed ? 'замкнута' : 'разомкнута'}, ток ${current} А`}
        className="grid-surface"
        style={{
          width: '100%',
          height: 'auto',
          border: '1px solid var(--border-strong)',
          borderRadius: '2px',
        }}
      >
        <title>Схема цепи закона Ома</title>
        {/* Main circuit loop wires */}
        <path
          d="M 100 155 L 100 80 L 245 80 M 325 80 L 540 80 L 540 290 L 385 290 M 255 290 L 100 290 L 100 215"
          fill="none"
          stroke="#17212B"
          strokeWidth="3"
          strokeLinecap="square"
        />

        {/* Voltage Source (Left branch) */}
        <g transform="translate(100, 185)">
          <circle cx="0" cy="0" r="30" fill="#FFFFFF" stroke="#17212B" strokeWidth="2.5" />
          <line x1="-12" y1="-8" x2="12" y2="-8" stroke="#17212B" strokeWidth="2.5" />
          <line x1="-7" y1="6" x2="7" y2="6" stroke="#17212B" strokeWidth="3.5" />
          <text x="-8" y="-14" fontSize="11" fontFamily="IBM Plex Mono" fill="#EF8737" fontWeight="600">
            +
          </text>
          <text x="-8" y="21" fontSize="11" fontFamily="IBM Plex Mono" fill="#505862" fontWeight="600">
            −
          </text>
          <text x="-76" y="-4" fontSize="11" fontFamily="IBM Plex Mono" fill="#505862">
            ИСТОЧНИК
          </text>
          <text x="-76" y="13" fontSize="14" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
            {voltage} В
          </text>
        </g>

        {/* Interactive Knife Switch (Top branch) */}
        <g
          transform="translate(245, 80)"
          onClick={onToggleCircuit}
          role="button"
          tabIndex={0}
          aria-label={circuitClosed ? 'Разомкнуть цепь' : 'Замкнуть цепь'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleCircuit();
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <rect x="-10" y="-36" width="100" height="58" fill="transparent" />
          <circle cx="0" cy="0" r="5" fill="#17212B" />
          <circle cx="80" cy="0" r="5" fill="#17212B" />
          <line
            x1="0"
            y1="0"
            x2={circuitClosed ? 80 : 70}
            y2={circuitClosed ? 0 : -26}
            stroke={circuitClosed ? '#315BE8' : '#EF8737'}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <text x="40" y="-36" textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
            КЛЮЧ: {circuitClosed ? 'ЗАМКНУТ' : 'РАЗОМКНУТ'}
          </text>
        </g>

        {/* Ammeter (Right branch) */}
        <g transform="translate(540, 185)">
          <circle cx="0" cy="0" r="42" fill="#FFFFFF" stroke="#17212B" strokeWidth="2.5" />
          {/* Dial arc */}
          <path d="M -27 -8 A 28 28 0 0 1 27 -8" fill="none" stroke="#D4CEC0" strokeWidth="4" />
          <g transform={`rotate(${needleDeg})`}>
            <line x1="0" y1="6" x2="0" y2="-28" stroke="#EF8737" strokeWidth="2.5" />
          </g>
          <circle cx="0" cy="4" r="3.5" fill="#17212B" />
          <text x="0" y="24" textAnchor="middle" fontSize="12" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
            {current} А
          </text>
          <text x="0" y="-50" textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" fill="#505862">
            АМПЕРМЕТР (A)
          </text>
        </g>

        {/* Resistor (Bottom branch) */}
        <g transform="translate(255, 290)">
          <rect
            x="0"
            y="-18"
            width="130"
            height="36"
            rx="2"
            fill={resistorFill}
            stroke="#17212B"
            strokeWidth="2.5"
          />
          {/* Color bands indicating resistance magnitude */}
          <rect x="22" y="-17" width="8" height="34" fill="#315BE8" />
          <rect x="42" y="-17" width="8" height="34" fill="#17212B" />
          <rect x="98" y="-17" width="8" height="34" fill="#EF8737" />
          <text x="65" y="4" textAnchor="middle" fontSize="13" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
            R = {resistance} Ом
          </text>
          <text x="65" y="38" textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" fill="#505862">
            МОЩНОСТЬ: P = {power} Вт
          </text>
        </g>

        {/* Charge flow markers when circuit is closed */}
        {circuitClosed && current > 0
          ? electronOffsets.map((offset) => {
              const pt = getLoopPoint(phase + offset);
              return (
                <circle
                  key={offset}
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#315BE8"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />
              );
            })
          : null}

        {/* Status Stamp */}
        <rect x="16" y="14" width="205" height="26" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="1" />
        <text x="26" y="31" fontSize="11" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
          {circuitClosed ? `ТОК ТЕЧЁТ: ${current} А` : 'ЦЕПЬ РАЗОМКНУТА (I = 0 А)'}
        </text>
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <button
          type="button"
          className={`btn btn--sm ${circuitClosed ? 'btn--primary' : 'btn--orange'}`}
          onClick={onToggleCircuit}
        >
          {circuitClosed ? 'Разомкнуть ключ' : 'Замкнуть ключ'}
        </button>
        <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)' }}>
          Совет: можно нажать прямо на ключ на схеме
        </span>
      </div>
    </div>
  );
}
