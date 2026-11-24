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
      const speed = Math.min(220, 26 + current * 24);
      setPhase((p) => (p + speed * dt) % 1000);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [circuitClosed, current]);

  // Dynamic ammeter full-scale range for legible needle deflection
  const scaleMax = current <= 2 ? 2 : current <= 6 ? 6 : current <= 12 ? 12 : 24;
  const needleRatio = Math.min(1, current / scaleMax);
  const needleDeg = -65 + needleRatio * 130;

  const heatOpacity = circuitClosed ? Math.min(0.42, power / 60) : 0;
  const voltageRatio = (voltage - 1) / 23;

  const electronOffsets = [0, 125, 250, 375, 500, 625, 750, 875];
  const getLoopPoint = (dist) => {
    const d = ((dist % 1000) / 1000) * 1280;
    if (d < 420) return { x: 120 + d, y: 80 };
    if (d < 640) return { x: 540, y: 80 + (d - 420) };
    if (d < 1060) return { x: 540 - (d - 640), y: 300 };
    return { x: 120, y: 300 - (d - 1060) };
  };

  // Ammeter dial tick marks
  const dialTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <svg
        viewBox="0 0 660 365"
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
        <title>Лабораторная схема закона Ома</title>

        {/* Circuit copper-ink bus wires */}
        <path
          d="M 120 142 L 120 80 L 250 80 M 335 80 L 540 80 L 540 138 M 540 242 L 540 300 L 405 300 M 255 300 L 120 300 L 120 238"
          fill="none"
          stroke="#17212B"
          strokeWidth="3.2"
          strokeLinecap="square"
        />

        {/* Laboratory DC Power Supply Box (Left) */}
        <g transform="translate(120, 190)">
          <rect x="-42" y="-48" width="84" height="96" rx="3" fill="#FFFFFF" stroke="#17212B" strokeWidth="2.2" />
          <rect x="-34" y="-40" width="68" height="22" rx="2" fill="#17212B" />
          <text x="0" y="-25" textAnchor="middle" fontSize="11.5" fontFamily="IBM Plex Mono" fill="#FFFFFF" fontWeight="600">
            {voltage} В
          </text>
          {/* Voltage output bar */}
          <rect x="-32" y="-10" width="64" height="8" rx="1" fill="#EAE5D9" stroke="#17212B" strokeWidth="1" />
          <rect x="-32" y="-10" width={Math.max(3, 64 * voltageRatio)} height="8" rx="1" fill="#315BE8" />
          {/* Cell symbol inside */}
          <line x1="-14" y1="14" x2="14" y2="14" stroke="#17212B" strokeWidth="2.5" />
          <line x1="-8" y1="22" x2="8" y2="22" stroke="#17212B" strokeWidth="3.5" />
          <circle cx="0" cy="-48" r="4" fill="#EF8737" stroke="#17212B" strokeWidth="1.5" />
          <circle cx="0" cy="48" r="4" fill="#315BE8" stroke="#17212B" strokeWidth="1.5" />
          <text x="12" y="-54" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#B55610" fontWeight="700">
            +
          </text>
          <text x="12" y="62" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#315BE8" fontWeight="700">
            −
          </text>
          <text x="-52" y="4" textAnchor="end" fontSize="10" fontFamily="IBM Plex Mono" fill="#505862">
            ИСТОЧНИК
          </text>
        </g>

        {/* Mechanical Knife Switch (Top) */}
        <g
          transform="translate(250, 80)"
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
          <rect x="-12" y="-42" width="110" height="64" fill="transparent" />
          <rect x="-8" y="-6" width="16" height="12" fill="#EAE5D9" stroke="#17212B" strokeWidth="1.5" />
          <rect x="77" y="-6" width="16" height="12" fill="#EAE5D9" stroke="#17212B" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="4.5" fill="#17212B" />
          <circle cx="85" cy="0" r="4.5" fill="#17212B" />
          <line
            x1="0"
            y1="0"
            x2={circuitClosed ? 85 : 74}
            y2={circuitClosed ? 0 : -28}
            stroke={circuitClosed ? '#315BE8' : '#EF8737'}
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <text x="42" y="-36" textAnchor="middle" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
            КЛЮЧ: {circuitClosed ? 'ЗАМКНУТ' : 'РАЗОМКНУТ'}
          </text>
        </g>

        {/* Precision Analog + Digital Ammeter (Right) */}
        <g transform="translate(540, 190)">
          <circle cx="0" cy="0" r="52" fill="#FFFFFF" stroke="#17212B" strokeWidth="2.4" />
          <circle cx="0" cy="0" r="46" fill="none" stroke="#D4CEC0" strokeWidth="1" />

          {/* Calibrated scale arc & ticks */}
          <path d="M -32 -12 A 34 34 0 0 1 32 -12" fill="none" stroke="#17212B" strokeWidth="1.8" />
          {dialTicks.map((t) => {
            const ang = ((-65 + t * 130) * Math.PI) / 180;
            const x1 = Math.sin(ang) * 30;
            const y1 = -Math.cos(ang) * 30;
            const x2 = Math.sin(ang) * 36;
            const y2 = -Math.cos(ang) * 36;
            return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#17212B" strokeWidth="1.4" />;
          })}
          <text x="-30" y="3" fontSize="8.5" fontFamily="IBM Plex Mono" fill="#505862">
            0
          </text>
          <text x="0" y="-37" textAnchor="middle" fontSize="8.5" fontFamily="IBM Plex Mono" fill="#505862">
            {scaleMax / 2}
          </text>
          <text x="30" y="3" textAnchor="end" fontSize="8.5" fontFamily="IBM Plex Mono" fill="#505862">
            {scaleMax}А
          </text>

          {/* Moving needle */}
          <g transform={`rotate(${needleDeg})`}>
            <line x1="0" y1="6" x2="0" y2="-32" stroke="#315BE8" strokeWidth="2.4" />
          </g>
          <circle cx="0" cy="2" r="4" fill="#17212B" />

          {/* Digital LCD inset */}
          <rect x="-32" y="14" width="64" height="20" rx="2" fill="#17212B" />
          <text x="0" y="28" textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" fill="#FFFFFF" fontWeight="600">
            {current} А
          </text>
          <text x="0" y="-59" textAnchor="middle" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#505862" fontWeight="600">
            АМПЕРМЕТР
          </text>
        </g>

        {/* Precision Resistor + Thermal Power Dissipation Visualization (Bottom) */}
        <g transform="translate(255, 300)">
          {circuitClosed && power > 0 ? (
            <g>
              <rect
                x="-8"
                y="-26"
                width="166"
                height="52"
                rx="6"
                fill={`rgba(239, 135, 55, ${heatOpacity})`}
              />
              {/* Heat dissipation waves */}
              <path
                d="M 35 -28 Q 40 -36 35 -44 M 75 -28 Q 80 -38 75 -46 M 115 -28 Q 120 -36 115 -44"
                fill="none"
                stroke="#EF8737"
                strokeWidth="1.6"
                strokeOpacity={Math.min(1, 0.25 + power / 24)}
              />
            </g>
          ) : null}

          <rect x="0" y="-19" width="150" height="38" rx="3" fill="#FFFFFF" stroke="#17212B" strokeWidth="2.4" />
          <rect x="16" y="-18" width="9" height="36" fill="#315BE8" />
          <rect x="33" y="-18" width="9" height="36" fill="#17212B" />
          <rect x="50" y="-18" width="9" height="36" fill="#EF8737" />
          <rect x="124" y="-18" width="8" height="36" fill="#B8C94B" />
          <text x="86" y="4" textAnchor="middle" fontSize="12.5" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
            {resistance} Ом
          </text>
          <text x="75" y="38" textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" fill="#505862">
            РЕЗИСТОР R · ТЕПЛОВАЯ МОЩНОСТЬ P = {power} Вт{' '}
            {thermalLoad === 'high' ? '(ВЫСОКИЙ НАГРЕВ)' : ''}
          </text>
        </g>

        {/* Charge Flow Markers (Visual Current Direction Model) */}
        {circuitClosed && current > 0
          ? electronOffsets.map((offset) => {
              const pt = getLoopPoint(phase + offset);
              return (
                <circle
                  key={offset}
                  cx={pt.x}
                  cy={pt.y}
                  r="4.2"
                  fill="#315BE8"
                  stroke="#FFFFFF"
                  strokeWidth="1.2"
                />
              );
            })
          : null}

        {/* Top-left Status Stamp */}
        <rect x="14" y="14" width="212" height="26" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="1.2" />
        <text x="24" y="31" fontSize="11" fontFamily="IBM Plex Mono" fill={circuitClosed ? '#315BE8' : '#B55610'} fontWeight="600">
          {circuitClosed ? `ЦЕПЬ ЗАМКНУТА · I = ${current} А` : 'ЦЕПЬ РАЗОМКНУТА · I = 0 А'}
        </text>
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <button
          type="button"
          className={`btn btn--sm ${circuitClosed ? 'btn--ink' : 'btn--primary'}`}
          onClick={onToggleCircuit}
        >
          {circuitClosed ? 'Разомкнуть ключ' : 'Замкнуть ключ'}
        </button>
        <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--ink-secondary)' }}>
          Синие точки — визуальная модель направления тока (нажмите на ключ на схеме)
        </span>
      </div>
    </div>
  );
}
