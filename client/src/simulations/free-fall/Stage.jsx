import { useEffect, useMemo, useRef, useState } from 'react';
import { calculateFreeFall } from './model.js';
import { PauseIcon, PlayIcon, ResetIcon } from '../../components/ui/Icons.jsx';

const PLANETS = [
  { name: 'Луна', g: 1.62 },
  { name: 'Марс', g: 3.72 },
  { name: 'Земля', g: 9.81 },
  { name: 'Юпитер', g: 24.79 },
];

export function FreeFallStage({ params, onLiveStateChange }) {
  const fullState = calculateFreeFall({ height: params.height, gravity: params.gravity });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    setRunning(false);
    setElapsedTime(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [params.height, params.gravity]);

  const liveState = calculateFreeFall({
    height: params.height,
    gravity: params.gravity,
    elapsedTime,
  });

  useEffect(() => {
    if (onLiveStateChange) onLiveStateChange(liveState);
  }, [liveState.time, liveState.currentHeight, liveState.velocity, params.height, params.gravity]);

  useEffect(() => {
    if (!running) return undefined;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      setElapsedTime((prev) => {
        const next = Math.min(fullState.totalTime, prev + dt);
        if (next >= fullState.totalTime) {
          setRunning(false);
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, fullState.totalTime]);

  // Mathematically exact strobe snapshots at equal time fractions k * totalTime / 6
  const strobePositions = useMemo(() => {
    const marks = [];
    for (let k = 1; k <= 5; k += 1) {
      const tk = (fullState.totalTime * k) / 6;
      if (elapsedTime >= tk) {
        const stateAtTk = calculateFreeFall({
          height: params.height,
          gravity: params.gravity,
          elapsedTime: tk,
        });
        marks.push({ k, t: stateAtTk.time, h: stateAtTk.currentHeight, v: stateAtTk.velocity });
      }
    }
    return marks;
  }, [elapsedTime, fullState.totalTime, params.height, params.gravity]);

  const handlePlayPause = () => {
    if (liveState.isLanded) {
      setElapsedTime(0);
      setRunning(true);
    } else {
      setRunning((r) => !r);
    }
  };

  const handleReset = () => {
    setRunning(false);
    setElapsedTime(0);
  };

  const topY = 46;
  const groundY = 304;
  const spanY = groundY - topY;
  const toSvgY = (h) => groundY - (h / Math.max(1, params.height)) * spanY;
  const ballY = toSvgY(liveState.currentHeight);
  const vectorLen = Math.min(58, (liveState.velocity / Math.max(1, fullState.impactVelocity)) * 54);

  const majorTicks = [0, 0.25, 0.5, 0.75, 1];
  const minorTicks = [0.125, 0.375, 0.625, 0.875];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <svg
        viewBox="0 0 660 365"
        role="img"
        aria-label={`Стенд свободного падения с высоты ${params.height} м при g = ${params.gravity} м/с²`}
        className="grid-surface"
        style={{
          width: '100%',
          height: 'auto',
          border: '1px solid var(--border-strong)',
          borderRadius: '2px',
        }}
      >
        <title>Вакуумная башня свободного падения</title>

        {/* Tower Gantry Frame */}
        <rect x="200" y={topY - 12} width="160" height={spanY + 12} fill="rgba(255,255,255,0.45)" stroke="#D4CEC0" strokeWidth="1" />
        <line x1="200" y1={topY - 12} x2="360" y2={topY - 12} stroke="#17212B" strokeWidth="2.5" />
        {/* Release clamp */}
        <rect x="272" y={topY - 12} width="16" height="8" fill="#17212B" />

        {/* Vertical Calibrated Scale Ruler */}
        <line x1="128" y1={topY} x2="128" y2={groundY} stroke="#17212B" strokeWidth="2.2" />
        {minorTicks.map((ratio) => {
          const y = toSvgY(params.height * ratio);
          return <line key={ratio} x1="122" y1={y} x2="134" y2={y} stroke="#747B83" strokeWidth="1" />;
        })}
        {majorTicks.map((ratio) => {
          const hVal = Math.round(params.height * ratio * 10) / 10;
          const y = toSvgY(hVal);
          return (
            <g key={ratio}>
              <line x1="136" y1={y} x2="380" y2={y} stroke="rgba(23,33,43,0.12)" strokeDasharray="3 3" />
              <line x1="118" y1={y} x2="138" y2={y} stroke="#17212B" strokeWidth="1.8" />
              <text x="110" y={y + 4} textAnchor="end" fontSize="11" fontFamily="IBM Plex Mono" fill="#17212B">
                {hVal} м
              </text>
            </g>
          );
        })}

        {/* Ground Datum */}
        <rect x="90" y={groundY} width="320" height="24" fill="#EAE5D9" stroke="#17212B" strokeWidth="1.5" />
        <line x1="90" y1={groundY} x2="410" y2={groundY} stroke="#17212B" strokeWidth="2.6" />
        <text x="280" y={groundY + 16} textAnchor="middle" fontSize="10" fontFamily="IBM Plex Mono" fill="#505862">
          УРОВЕНЬ ЗЕМЛИ (h = 0 м)
        </text>

        {/* Horizontal Coordinate Tracker */}
        <line x1="138" y1={ballY} x2="262" y2={ballY} stroke="#315BE8" strokeWidth="1.2" strokeDasharray="3 2" />

        {/* Mathematically exact strobe positions */}
        {strobePositions.map((pt) => (
          <g key={pt.k}>
            <circle
              cx="280"
              cy={toSvgY(pt.h)}
              r="8.5"
              fill="rgba(49, 91, 232, 0.14)"
              stroke="#315BE8"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            <text x="210" y={toSvgY(pt.h) + 3} fontSize="9.5" fontFamily="IBM Plex Mono" fill="#315BE8">
              {pt.t} с
            </text>
          </g>
        ))}

        {/* Active Falling Sphere */}
        <circle cx="280" cy={ballY} r="13" fill="#EF8737" stroke="#17212B" strokeWidth="2.2" />
        <circle cx="276" cy={ballY - 4} r="3" fill="#FFFFFF" opacity="0.75" />

        {/* Velocity Vector */}
        {vectorLen > 3 && !liveState.isLanded ? (
          <g>
            <line x1="304" y1={ballY} x2="304" y2={ballY + vectorLen} stroke="#315BE8" strokeWidth="2.6" />
            <polygon
              points={`299,${ballY + vectorLen} 309,${ballY + vectorLen} 304,${ballY + vectorLen + 8}`}
              fill="#315BE8"
            />
            <text x="314" y={ballY + vectorLen / 2 + 4} fontSize="11" fontFamily="IBM Plex Mono" fill="#315BE8" fontWeight="600">
              v = {liveState.velocity} м/с
            </text>
          </g>
        ) : null}

        {/* Live Telemetry & Initial vs Final Comparison Card (Right) */}
        <g transform="translate(425, 22)">
          <rect width="218" height="126" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="1.4" />
          <rect width="218" height="24" fill="#17212B" />
          <text x="10" y="16" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#FFFFFF" fontWeight="600">
            ТЕЛЕМЕТРИЯ И СРАВНЕНИЕ
          </text>
          <text x="10" y="43" fontSize="11.5" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
            t = {liveState.time} / {fullState.totalTime} с
          </text>
          <text x="10" y="62" fontSize="11.5" fontFamily="IBM Plex Mono" fill="#17212B">
            h: {params.height} м → {liveState.currentHeight} м
          </text>
          <text x="10" y="81" fontSize="11.5" fontFamily="IBM Plex Mono" fill="#315BE8" fontWeight="600">
            v: 0 → {liveState.velocity} м/с
          </text>
          <text x="10" y="100" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#505862">
            v_уд = {fullState.impactVelocity} м/с
          </text>
          <text x="10" y="117" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#505862">
            g = {params.gravity} м/с²
          </text>
        </g>

        {/* Planet Gravity Comparison Table on Stage */}
        <g transform="translate(425, 166)">
          <rect width="218" height="162" rx="2" fill="#FAF8F3" stroke="#17212B" strokeWidth="1.2" />
          <text x="10" y="20" fontSize="10" fontFamily="IBM Plex Mono" fill="#505862" fontWeight="600">
            ВРЕМЯ С h = {params.height} м НА ПЛАНЕТАХ
          </text>
          <line x1="10" y1="28" x2="208" y2="28" stroke="#D4CEC0" />
          {PLANETS.map((pl, idx) => {
            const pt = Math.round(Math.sqrt((2 * params.height) / pl.g) * 100) / 100;
            const isCurrent = Math.abs(params.gravity - pl.g) < 0.05;
            const y = 50 + idx * 28;
            return (
              <g key={pl.name}>
                {isCurrent ? <rect x="6" y={y - 14} width="206" height="22" fill="rgba(49,91,232,0.1)" /> : null}
                <text x="12" y={y} fontSize="11" fontFamily="IBM Plex Mono" fill={isCurrent ? '#315BE8' : '#17212B'} fontWeight={isCurrent ? '700' : '500'}>
                  {pl.name} ({pl.g})
                </text>
                <text x="204" y={y} textAnchor="end" fontSize="11" fontFamily="IBM Plex Mono" fill={isCurrent ? '#315BE8' : '#17212B'} fontWeight="600">
                  {pt} с
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn--primary btn--sm" onClick={handlePlayPause}>
            {running ? <PauseIcon /> : <PlayIcon />}
            {running ? 'Пауза' : liveState.isLanded ? 'Повторить падение' : elapsedTime > 0 ? 'Продолжить' : 'Запустить'}
          </button>
          <button type="button" className="btn btn--sm" onClick={handleReset}>
            <ResetIcon />
            Сброс
          </button>
        </div>
        <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--ink-secondary)' }}>
          Стробоскопические отметки вычисляются каждые Δt = T/6 из s = g·t²/2
        </span>
      </div>
    </div>
  );
}
