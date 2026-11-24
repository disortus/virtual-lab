import { useEffect, useRef, useState } from 'react';
import { calculateFreeFall } from './model.js';
import { PauseIcon, PlayIcon, ResetIcon } from '../../components/ui/Icons.jsx';

export function FreeFallStage({ params, onLiveStateChange }) {
  const fullState = calculateFreeFall({ height: params.height, gravity: params.gravity });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [ghosts, setGhosts] = useState([]);
  const rafRef = useRef(null);

  // Reset animation when base parameters change
  useEffect(() => {
    setRunning(false);
    setElapsedTime(0);
    setGhosts([]);
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
    let lastGhostTime = elapsedTime;

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      setElapsedTime((prev) => {
        const next = Math.min(fullState.totalTime, prev + dt);
        if (next - lastGhostTime >= Math.max(0.25, fullState.totalTime / 8)) {
          lastGhostTime = next;
          const snap = calculateFreeFall({
            height: params.height,
            gravity: params.gravity,
            elapsedTime: next,
          });
          setGhosts((g) => [...g.slice(-9), snap.currentHeight]);
        }
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
  }, [running, fullState.totalTime, params.height, params.gravity]);

  const handlePlayPause = () => {
    if (liveState.isLanded) {
      setElapsedTime(0);
      setGhosts([]);
      setRunning(true);
    } else {
      setRunning((r) => !r);
    }
  };

  const handleReset = () => {
    setRunning(false);
    setElapsedTime(0);
    setGhosts([]);
  };

  // Map height [0..params.height] to SVG Y [310..50]
  const topY = 50;
  const groundY = 310;
  const spanY = groundY - topY;
  const toSvgY = (h) => groundY - (h / Math.max(1, params.height)) * spanY;
  const ballY = toSvgY(liveState.currentHeight);
  const vectorLen = Math.min(60, (liveState.velocity / Math.max(1, fullState.impactVelocity)) * 55);

  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <svg
        viewBox="0 0 640 360"
        role="img"
        aria-label={`Сцена свободного падения с высоты ${params.height} м при g = ${params.gravity} м/с²`}
        className="grid-surface"
        style={{
          width: '100%',
          height: 'auto',
          border: '1px solid var(--border-strong)',
          borderRadius: '2px',
        }}
      >
        <title>Стенд свободного падения</title>

        {/* Drop Tower & Calibrated Height Axis */}
        <line x1="140" y1={topY} x2="140" y2={groundY} stroke="#17212B" strokeWidth="2" />
        {ticks.map((ratio) => {
          const hVal = Math.round(params.height * ratio);
          const y = toSvgY(hVal);
          return (
            <g key={ratio}>
              <line x1="132" y1={y} x2="500" y2={y} stroke="rgba(23,33,43,0.12)" strokeDasharray="3 3" />
              <line x1="132" y1={y} x2="148" y2={y} stroke="#17212B" strokeWidth="1.5" />
              <text x="124" y={y + 4} textAnchor="end" fontSize="11" fontFamily="IBM Plex Mono" fill="#505862">
                {hVal} м
              </text>
            </g>
          );
        })}

        {/* Ground */}
        <rect x="110" y={groundY} width="420" height="22" fill="#EAE5D9" stroke="#17212B" strokeWidth="1.5" />
        <line x1="110" y1={groundY} x2="530" y2={groundY} stroke="#17212B" strokeWidth="2.5" />

        {/* Strobe Ghost Positions */}
        {ghosts.map((gh, idx) => (
          <circle
            key={`${gh}-${idx}`}
            cx="320"
            cy={toSvgY(gh)}
            r="9"
            fill="rgba(49, 91, 232, 0.16)"
            stroke="#315BE8"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        ))}

        {/* Falling Object */}
        <circle cx="320" cy={ballY} r="14" fill="#EF8737" stroke="#17212B" strokeWidth="2.2" />
        <circle cx="316" cy={ballY - 4} r="3" fill="#FFFFFF" opacity="0.7" />

        {/* Velocity Vector Arrow */}
        {vectorLen > 4 && !liveState.isLanded ? (
          <g>
            <line x1="348" y1={ballY} x2="348" y2={ballY + vectorLen} stroke="#315BE8" strokeWidth="2.5" />
            <polygon
              points={`343,${ballY + vectorLen} 353,${ballY + vectorLen} 348,${ballY + vectorLen + 7}`}
              fill="#315BE8"
            />
            <text x="360" y={ballY + vectorLen / 2 + 4} fontSize="11" fontFamily="IBM Plex Mono" fill="#315BE8" fontWeight="600">
              v = {liveState.velocity} м/с
            </text>
          </g>
        ) : null}

        {/* Live Telemetry Overlay Box */}
        <g transform="translate(425, 24)">
          <rect width="195" height="92" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="1.2" />
          <text x="12" y="22" fontSize="11" fontFamily="IBM Plex Mono" fill="#505862">
            ТЕЛЕМЕТРИЯ ЗАПУСКА
          </text>
          <text x="12" y="44" fontSize="12" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
            t = {liveState.time} / {fullState.totalTime} с
          </text>
          <text x="12" y="63" fontSize="12" fontFamily="IBM Plex Mono" fill="#17212B">
            h = {liveState.currentHeight} м
          </text>
          <text x="12" y="82" fontSize="12" fontFamily="IBM Plex Mono" fill="#315BE8" fontWeight="600">
            v = {liveState.velocity} м/с
          </text>
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
        <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)' }}>
          {liveState.isLanded ? `Касание земли: t = ${fullState.totalTime} с, v = ${fullState.impactVelocity} м/с` : 'Синие круги — стробоскопические метки'}
        </span>
      </div>
    </div>
  );
}
