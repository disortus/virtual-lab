import { useEffect, useState } from 'react';

export function SeriesParallelStage({ state, onToggleCircuit, onSwitchTopology }) {
  const { circuitType, voltage, r1, r2, circuitClosed, rTotal, iTotal, i1, i2, v1, v2 } = state;
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!circuitClosed || iTotal <= 0) return undefined;
    let frameId;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setPhase((p) => (p + dt * 120) % 1000);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [circuitClosed, iTotal]);

  const isParallel = circuitType === 'parallel';

  // Animated dots along Series loop
  const seriesDots = [0, 200, 400, 600, 800].map((off) => {
    const speed = Math.min(2.2, 0.3 + iTotal * 0.45);
    const d = (((phase * speed + off) % 1000) / 1000) * 1260;
    if (d < 420) return { x: 110 + d, y: 76 };
    if (d < 630) return { x: 530, y: 76 + (d - 420) };
    if (d < 1050) return { x: 530 - (d - 630), y: 286 };
    return { x: 110, y: 286 - (d - 1050) };
  });

  // Animated dots along two Parallel branches
  const branch1Dots = [0, 333, 666].map((off) => {
    const speed = Math.min(2.4, 0.25 + i1 * 0.5);
    const t = ((phase * speed + off) % 1000) / 1000;
    return { x: 220 + t * 240, y: 120 };
  });

  const branch2Dots = [0, 333, 666].map((off) => {
    const speed = Math.min(2.4, 0.25 + i2 * 0.5);
    const t = ((phase * speed + off) % 1000) / 1000;
    return { x: 220 + t * 240, y: 242 };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <svg
        viewBox="0 0 660 365"
        role="img"
        aria-label={`Схема ${isParallel ? 'параллельного' : 'последовательного'} соединения резисторов R1=${r1} Ом и R2=${r2} Ом`}
        className="grid-surface"
        style={{
          width: '100%',
          height: 'auto',
          border: '1px solid var(--border-strong)',
          borderRadius: '2px',
        }}
      >
        <title>Интерактивная схема соединения резисторов</title>

        {/* Left Power Supply */}
        <g transform="translate(110, 181)">
          <rect x="-36" y="-44" width="72" height="88" rx="3" fill="#FFFFFF" stroke="#17212B" strokeWidth="2.2" />
          <rect x="-28" y="-36" width="56" height="20" rx="2" fill="#17212B" />
          <text x="0" y="-22" textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" fill="#FFFFFF" fontWeight="600">
            {voltage} В
          </text>
          <line x1="-12" y1="6" x2="12" y2="6" stroke="#17212B" strokeWidth="2.5" />
          <line x1="-7" y1="15" x2="7" y2="15" stroke="#17212B" strokeWidth="3.5" />
          <text x="0" y="34" textAnchor="middle" fontSize="9.5" fontFamily="IBM Plex Mono" fill="#505862">
            ИСТОЧНИК
          </text>
        </g>

        {/* Interactive Switch */}
        <g
          transform="translate(172, 76)"
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
          <rect x="-8" y="-34" width="84" height="50" fill="transparent" />
          <circle cx="0" cy="0" r="4" fill="#17212B" />
          <circle cx="68" cy="0" r="4" fill="#17212B" />
          <line
            x1="0"
            y1="0"
            x2={circuitClosed ? 68 : 58}
            y2={circuitClosed ? 0 : -24}
            stroke={circuitClosed ? '#315BE8' : '#EF8737'}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <text x="34" y="-30" textAnchor="middle" fontSize="10" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
            {circuitClosed ? 'ЗАМКНУТ' : 'РАЗОМКНУТ'}
          </text>
        </g>

        {!isParallel ? (
          <g>
            {/* Series Loop */}
            <path
              d="M 110 137 L 110 76 L 172 76 M 240 76 L 530 76 L 530 286 L 460 286 M 345 286 L 295 286 M 180 286 L 110 286 L 110 225"
              fill="none"
              stroke="#17212B"
              strokeWidth="3"
            />
            {/* Resistor R1 */}
            <g transform="translate(180, 286)">
              <rect x="0" y="-18" width="115" height="36" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="2.2" />
              <rect x="10" y="-17" width="7" height="34" fill="#315BE8" />
              <text x="64" y="4" textAnchor="middle" fontSize="12" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
                R₁ = {r1} Ом
              </text>
              <text x="58" y="34" textAnchor="middle" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#315BE8" fontWeight="600">
                U₁ = {v1} В · I₁ = {i1} А
              </text>
            </g>
            {/* Resistor R2 */}
            <g transform="translate(345, 286)">
              <rect x="0" y="-18" width="115" height="36" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="2.2" />
              <rect x="10" y="-17" width="7" height="34" fill="#EF8737" />
              <text x="64" y="4" textAnchor="middle" fontSize="12" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
                R₂ = {r2} Ом
              </text>
              <text x="58" y="34" textAnchor="middle" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#B55610" fontWeight="600">
                U₂ = {v2} В · I₂ = {i2} А
              </text>
            </g>

            {circuitClosed && iTotal > 0
              ? seriesDots.map((pt, idx) => (
                  <circle key={idx} cx={pt.x} cy={pt.y} r="4" fill="#315BE8" stroke="#FFFFFF" strokeWidth="1" />
                ))
              : null}
          </g>
        ) : (
          <g>
            {/* Parallel Bus & Branches */}
            <path
              d="M 110 137 L 110 76 L 172 76 M 240 76 L 220 76 L 220 242 M 220 120 L 290 120 M 405 120 L 460 120 M 220 242 L 290 242 M 405 242 L 460 242 M 460 120 L 460 242 M 460 181 L 530 181 L 530 286 L 110 286 L 110 225"
              fill="none"
              stroke="#17212B"
              strokeWidth="3"
            />
            {/* Branch junction nodes */}
            <circle cx="220" cy="120" r="4.5" fill="#17212B" />
            <circle cx="460" cy="181" r="4.5" fill="#17212B" />

            {/* Branch 1: R1 */}
            <g transform="translate(290, 120)">
              <rect x="0" y="-18" width="115" height="36" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="2.2" />
              <rect x="10" y="-17" width="7" height="34" fill="#315BE8" />
              <text x="64" y="4" textAnchor="middle" fontSize="12" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
                R₁ = {r1} Ом
              </text>
              <text x="58" y="-26" textAnchor="middle" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#315BE8" fontWeight="600">
                I₁ = {i1} А · U₁ = {v1} В
              </text>
            </g>

            {/* Branch 2: R2 */}
            <g transform="translate(290, 242)">
              <rect x="0" y="-18" width="115" height="36" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="2.2" />
              <rect x="10" y="-17" width="7" height="34" fill="#EF8737" />
              <text x="64" y="4" textAnchor="middle" fontSize="12" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
                R₂ = {r2} Ом
              </text>
              <text x="58" y="34" textAnchor="middle" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#B55610" fontWeight="600">
                I₂ = {i2} А · U₂ = {v2} В
              </text>
            </g>

            {circuitClosed && i1 > 0
              ? branch1Dots.map((pt, idx) => (
                  <circle key={`b1-${idx}`} cx={pt.x} cy={pt.y} r="4" fill="#315BE8" stroke="#FFFFFF" strokeWidth="1" />
                ))
              : null}
            {circuitClosed && i2 > 0
              ? branch2Dots.map((pt, idx) => (
                  <circle key={`b2-${idx}`} cx={pt.x} cy={pt.y} r="4" fill="#EF8737" stroke="#FFFFFF" strokeWidth="1" />
                ))
              : null}
          </g>
        )}

        {/* Right Total Meter Box */}
        <g transform="translate(530, 181)">
          <rect x="-48" y="-42" width="96" height="84" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="2" />
          <rect x="-48" y="-42" width="96" height="20" fill="#17212B" />
          <text x="0" y="-28" textAnchor="middle" fontSize="9.5" fontFamily="IBM Plex Mono" fill="#FFFFFF" fontWeight="600">
            ОБЩИЙ ТОК
          </text>
          <text x="0" y="2" textAnchor="middle" fontSize="14" fontFamily="IBM Plex Mono" fill="#315BE8" fontWeight="700">
            {iTotal} А
          </text>
          <text x="0" y="24" textAnchor="middle" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#505862">
            R_общ = {rTotal} Ом
          </text>
        </g>

        {/* Topology Badge */}
        <rect x="285" y="14" width="295" height="26" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="1.2" />
        <text x="296" y="31" fontSize="11" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
          {isParallel ? 'ПАРАЛЛЕЛЬНАЯ ЦЕПЬ: I_общ = I₁ + I₂' : 'ПОСЛЕДОВАТЕЛЬНАЯ ЦЕПЬ: U_общ = U₁ + U₂'}
        </text>
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn--sm ${!isParallel ? 'btn--primary' : ''}`}
            onClick={() => onSwitchTopology('series')}
          >
            Последовательная схема
          </button>
          <button
            type="button"
            className={`btn btn--sm ${isParallel ? 'btn--primary' : ''}`}
            onClick={() => onSwitchTopology('parallel')}
          >
            Параллельная схема
          </button>
          <button type="button" className="btn btn--sm" onClick={onToggleCircuit}>
            {circuitClosed ? 'Разомкнуть ключ' : 'Замкнуть ключ'}
          </button>
        </div>
        <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--ink-secondary)' }}>
          Сравни I₁ и I₂ при изменении сопротивлений
        </span>
      </div>
    </div>
  );
}
