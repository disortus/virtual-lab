import { useEffect, useRef, useState } from 'react';
import { calculateNewtonsSecondLaw } from './model.js';
import { PauseIcon, PlayIcon, ResetIcon } from '../../components/ui/Icons.jsx';

export function NewtonsSecondLawStage({ params, onLiveStateChange }) {
  const full = calculateNewtonsSecondLaw(params);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    setRunning(false);
    setElapsedTime(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [params.mass, params.appliedForce, params.frictionForce]);

  const live = calculateNewtonsSecondLaw({ ...params, elapsedTime });

  useEffect(() => {
    if (onLiveStateChange) onLiveStateChange(live);
  }, [live.time, live.displacement, live.velocity, params.mass, params.appliedForce, params.frictionForce]);

  useEffect(() => {
    if (!running || !full.isMoving) return undefined;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setElapsedTime((prev) => {
        const next = Math.min(full.timeToEnd, prev + dt);
        if (next >= full.timeToEnd) setRunning(false);
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, full.isMoving, full.timeToEnd]);

  const handlePlayPause = () => {
    if (!full.isMoving) return;
    if (live.isFinished) {
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

  const trackLeft = 72;
  const trackRight = 590;
  const railY = 248;
  const cartWidth = Math.round(52 + (params.mass / 50) * 34);
  const cartHeight = Math.round(34 + (params.mass / 50) * 18);
  const usableTrackPx = trackRight - trackLeft - cartWidth;
  const cartX = trackLeft + (live.displacement / full.trackLength) * usableTrackPx;
  const cartCenterY = railY - 10 - cartHeight / 2;

  const appliedLen = Math.min(115, (params.appliedForce / 200) * 115);
  const frictionLen = Math.min(95, (full.effectiveFriction / 100) * 95);
  const netLen = Math.min(115, (full.netForce / 200) * 115);

  const meterTicks = [0, 10, 20, 30, 40, 50];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <svg
        viewBox="0 0 660 340"
        role="img"
        aria-label={`Динамическая тележка массой ${params.mass} кг, тяга ${params.appliedForce} Н, трение ${params.frictionForce} Н, ускорение ${full.acceleration} м/с²`}
        className="grid-surface"
        style={{
          width: '100%',
          height: 'auto',
          border: '1px solid var(--border-strong)',
          borderRadius: '2px',
        }}
      >
        <title>Стенд второго закона Ньютона</title>

        {/* Calibrated Track & Friction Surface */}
        <rect x="44" y={railY} width="572" height="24" fill="#EAE5D9" stroke="#17212B" strokeWidth="1.5" />
        <line x1="44" y1={railY} x2="616" y2={railY} stroke="#17212B" strokeWidth="2.5" />
        {meterTicks.map((m) => {
          const x = trackLeft + (m / full.trackLength) * usableTrackPx;
          return (
            <g key={m}>
              <line x1={x} y1={railY} x2={x} y2={railY + 8} stroke="#17212B" strokeWidth="1.5" />
              <text x={x} y={railY + 20} textAnchor="middle" fontSize="10" fontFamily="IBM Plex Mono" fill="#505862">
                {m} м
              </text>
            </g>
          );
        })}

        {/* Dynamics Cart Scaled by Mass */}
        <g>
          <rect
            x={cartX}
            y={railY - 10 - cartHeight}
            width={cartWidth}
            height={cartHeight}
            rx="2"
            fill="#FFFFFF"
            stroke="#17212B"
            strokeWidth="2.4"
          />
          <circle cx={cartX + 14} cy={railY - 5} r="5.5" fill="#17212B" />
          <circle cx={cartX + cartWidth - 14} cy={railY - 5} r="5.5" fill="#17212B" />
          <text
            x={cartX + cartWidth / 2}
            y={cartCenterY + 4}
            textAnchor="middle"
            fontSize="12"
            fontFamily="IBM Plex Mono"
            fill="#17212B"
            fontWeight="700"
          >
            {params.mass} кг
          </text>
        </g>

        {/* Applied Force Vector (Right, Electric Blue) */}
        {appliedLen > 4 ? (
          <g>
            <line
              x1={cartX + cartWidth}
              y1={cartCenterY}
              x2={cartX + cartWidth + appliedLen}
              y2={cartCenterY}
              stroke="#315BE8"
              strokeWidth="3.2"
            />
            <polygon
              points={`${cartX + cartWidth + appliedLen},${cartCenterY - 5} ${cartX + cartWidth + appliedLen},${cartCenterY + 5} ${cartX + cartWidth + appliedLen + 9},${cartCenterY}`}
              fill="#315BE8"
            />
            <text
              x={cartX + cartWidth + appliedLen / 2}
              y={cartCenterY - 10}
              textAnchor="middle"
              fontSize="10.5"
              fontFamily="IBM Plex Mono"
              fill="#315BE8"
              fontWeight="700"
            >
              F_тяги = {params.appliedForce} Н
            </text>
          </g>
        ) : null}

        {/* Friction Force Vector (Left, Scientific Orange) */}
        {frictionLen > 4 ? (
          <g>
            <line
              x1={cartX}
              y1={railY - 14}
              x2={cartX - frictionLen}
              y2={railY - 14}
              stroke="#EF8737"
              strokeWidth="3"
            />
            <polygon
              points={`${cartX - frictionLen},${railY - 19} ${cartX - frictionLen},${railY - 9} ${cartX - frictionLen - 9},${railY - 14}`}
              fill="#EF8737"
            />
            <text
              x={Math.max(46, cartX - frictionLen / 2)}
              y={railY - 24}
              textAnchor="middle"
              fontSize="10.5"
              fontFamily="IBM Plex Mono"
              fill="#B55610"
              fontWeight="700"
            >
              F_тр = {full.effectiveFriction} Н
            </text>
          </g>
        ) : null}

        {/* Net Resultant Force Vector Above Cart */}
        {netLen > 4 ? (
          <g>
            <line
              x1={cartX + cartWidth / 2}
              y1={railY - cartHeight - 28}
              x2={cartX + cartWidth / 2 + netLen}
              y2={railY - cartHeight - 28}
              stroke="#17212B"
              strokeWidth="2.6"
              strokeDasharray="4 2"
            />
            <polygon
              points={`${cartX + cartWidth / 2 + netLen},${railY - cartHeight - 33} ${cartX + cartWidth / 2 + netLen},${railY - cartHeight - 23} ${cartX + cartWidth / 2 + netLen + 8},${railY - cartHeight - 28}`}
              fill="#17212B"
            />
            <text
              x={cartX + cartWidth / 2 + netLen / 2}
              y={railY - cartHeight - 36}
              textAnchor="middle"
              fontSize="10.5"
              fontFamily="IBM Plex Mono"
              fill="#17212B"
              fontWeight="700"
            >
              F_рез = {full.netForce} Н · a = {full.acceleration} м/с²
            </text>
          </g>
        ) : null}

        {/* Telemetry Box */}
        <g transform="translate(436, 18)">
          <rect width="208" height="90" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="1.3" />
          <rect width="208" height="22" fill="#17212B" />
          <text x="10" y="15" fontSize="10" fontFamily="IBM Plex Mono" fill="#FFFFFF" fontWeight="600">
            ДИНАМИКА ТЕЛЕЖКИ
          </text>
          <text x="10" y="40" fontSize="11" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
            a = {full.acceleration} м/с²
          </text>
          <text x="10" y="59" fontSize="11" fontFamily="IBM Plex Mono" fill="#315BE8">
            s = {live.displacement} м · v = {live.velocity} м/с
          </text>
          <text x="10" y="77" fontSize="10.5" fontFamily="IBM Plex Mono" fill={full.isMoving ? '#505862' : '#B55610'}>
            {full.isMoving ? `Время до 50 м: ${full.timeToEnd} с` : 'Покой: F_тяги ≤ F_тр'}
          </text>
        </g>
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn--primary btn--sm" disabled={!full.isMoving} onClick={handlePlayPause}>
            {running ? <PauseIcon /> : <PlayIcon />}
            {running ? 'Пауза' : live.isFinished ? 'Повторить разгон' : elapsedTime > 0 ? 'Продолжить' : 'Запустить движение'}
          </button>
          <button type="button" className="btn btn--sm" onClick={handleReset}>
            <ResetIcon />
            Сброс
          </button>
        </div>
        <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--ink-secondary)' }}>
          {full.isMoving
            ? 'Размер тележки масштабируется по массе m'
            : 'Увеличьте F_тяги выше F_тр, чтобы сдвинуть тележку'}
        </span>
      </div>
    </div>
  );
}
