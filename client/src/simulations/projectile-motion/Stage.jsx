import { useEffect, useRef, useState } from 'react';
import { calculateProjectile, generateProjectileTrajectory } from './model.js';
import { PauseIcon, PlayIcon, ResetIcon } from '../../components/ui/Icons.jsx';

export function ProjectileStage({ params, measurements = [], onLiveStateChange }) {
  const full = calculateProjectile(params);
  const curve = generateProjectileTrajectory(params);

  const [elapsedTime, setElapsedTime] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    setRunning(false);
    setElapsedTime(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [params.velocity, params.angle, params.gravity]);

  const live = calculateProjectile({ ...params, elapsedTime });

  useEffect(() => {
    if (onLiveStateChange) onLiveStateChange(live);
  }, [live.time, live.x, live.y, live.vy, params.velocity, params.angle, params.gravity]);

  useEffect(() => {
    if (!running) return undefined;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setElapsedTime((prev) => {
        const next = Math.min(full.flightTime, prev + dt);
        if (next >= full.flightTime) {
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
  }, [running, full.flightTime]);

  const handlePlayPause = () => {
    if (live.isLanded) {
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

  const maxX = Math.max(25, full.range * 1.15, ...measurements.map((m) => (m.results?.range || 0) * 1.12));
  const maxY = Math.max(12, full.maxHeight * 1.32, ...measurements.map((m) => (m.results?.maxHeight || 0) * 1.28));

  const left = 58;
  const right = 618;
  const bottom = 304;
  const top = 34;
  const toSvgX = (x) => left + (x / maxX) * (right - left);
  const toSvgY = (y) => bottom - (y / maxY) * (bottom - top);

  const mainPath = curve.trajectoryPoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.x).toFixed(1)} ${toSvgY(pt.y).toFixed(1)}`)
    .join(' ');

  const rad = (params.angle * Math.PI) / 180;
  const barrelLen = 34;
  const barrelX = left + Math.cos(rad) * barrelLen;
  const barrelY = bottom - Math.sin(rad) * barrelLen;

  // Initial velocity decomposition vectors at launch
  const vScale = 56 / Math.max(1, params.velocity);
  const v0EndX = left + full.vx * vScale;
  const v0EndY = bottom - full.vy0 * vScale;

  // Live velocity vectors on projectile
  const liveScale = 42 / Math.max(1, params.velocity);
  const liveVxEnd = toSvgX(live.x) + live.vx * liveScale;
  const liveVyEnd = toSvgY(live.y) - live.vy * liveScale;

  const projX = toSvgX(live.x);
  const projY = toSvgY(live.y);
  const apexX = toSvgX(full.range / 2);
  const apexY = toSvgY(full.maxHeight);

  // Angle arc near launcher
  const arcR = 26;
  const arcX = left + Math.cos(rad) * arcR;
  const arcY = bottom - Math.sin(rad) * arcR;

  const gridFractions = [0.25, 0.5, 0.75, 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <svg
        viewBox="0 0 660 365"
        role="img"
        aria-label={`Баллистическая траектория под углом ${params.angle}° со скоростью ${params.velocity} м/с`}
        className="grid-surface"
        style={{
          width: '100%',
          height: 'auto',
          border: '1px solid var(--border-strong)',
          borderRadius: '2px',
        }}
      >
        <title>Баллистический стенд с разложением вектора скорости</title>

        {/* Coordinate Grid & Tick Values */}
        {gridFractions.map((f) => {
          const gx = toSvgX(maxX * f);
          const gy = toSvgY(maxY * f);
          return (
            <g key={f}>
              <line x1={gx} y1={top} x2={gx} y2={bottom} stroke="rgba(23,33,43,0.1)" strokeDasharray="3 3" />
              <text x={gx} y={bottom + 16} textAnchor="middle" fontSize="10" fontFamily="IBM Plex Mono" fill="#505862">
                {Math.round(maxX * f)} м
              </text>
              <line x1={left} y1={gy} x2={right} y2={gy} stroke="rgba(23,33,43,0.1)" strokeDasharray="3 3" />
              <text x={left - 8} y={gy + 3} textAnchor="end" fontSize="10" fontFamily="IBM Plex Mono" fill="#505862">
                {Math.round(maxY * f)} м
              </text>
            </g>
          );
        })}

        {/* Main Axes */}
        <line x1={left} y1={top - 8} x2={left} y2={bottom} stroke="#17212B" strokeWidth="2" />
        <line x1="36" y1={bottom} x2="634" y2={bottom} stroke="#17212B" strokeWidth="2.4" />

        {/* Ghost trajectories from recorded runs */}
        {measurements.slice(-3).map((m, idx) => {
          const gCurve = generateProjectileTrajectory(m.parameters);
          const gPath = gCurve.trajectoryPoints
            .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.x).toFixed(1)} ${toSvgY(pt.y).toFixed(1)}`)
            .join(' ');
          return (
            <g key={m.id || idx}>
              <path d={gPath} fill="none" stroke="rgba(116,123,131,0.6)" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx={toSvgX(gCurve.range)} cy={bottom} r="3.5" fill="#747B83" />
            </g>
          );
        })}

        {/* Current Predicted Trajectory */}
        <path d={mainPath} fill="none" stroke="#315BE8" strokeWidth="2.4" strokeDasharray="6 4" />

        {/* Apex Callout */}
        <line x1={apexX} y1={apexY} x2={apexX} y2={bottom} stroke="rgba(239,135,55,0.5)" strokeDasharray="3 3" />
        <circle cx={apexX} cy={apexY} r="4" fill="#EF8737" />
        <text x={apexX} y={Math.max(18, apexY - 8)} textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" fill="#B55610" fontWeight="600">
          H = {full.maxHeight} м
        </text>

        {/* Range Callout */}
        <circle cx={toSvgX(full.range)} cy={bottom} r="4.5" fill="#17212B" />
        <text x={toSvgX(full.range)} y={bottom + 32} textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
          L = {full.range} м
        </text>

        {/* Launcher Base, Angle Arc & Initial Decomposition */}
        <rect x={left - 12} y={bottom - 4} width="24" height="8" fill="#17212B" />
        <path d={`M ${left + arcR} ${bottom} A ${arcR} ${arcR} 0 0 0 ${arcX} ${arcY}`} fill="rgba(49,91,232,0.14)" stroke="#315BE8" strokeWidth="1.4" />
        <text x={left + arcR + 6} y={bottom - 8} fontSize="10.5" fontFamily="IBM Plex Mono" fill="#315BE8" fontWeight="600">
          α = {params.angle}°
        </text>

        {/* Launch v_x & v_y dashed components */}
        <line x1={left} y1={bottom} x2={v0EndX} y2={bottom} stroke="#505862" strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1={v0EndX} y1={bottom} x2={v0EndX} y2={v0EndY} stroke="#505862" strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1={left} y1={bottom} x2={barrelX} y2={barrelY} stroke="#17212B" strokeWidth="7" strokeLinecap="round" />
        <circle cx={left} cy={bottom} r="6.5" fill="#EF8737" stroke="#17212B" strokeWidth="2" />

        {/* Live Projectile & Velocity Vector Decomposition */}
        {!live.isLanded && elapsedTime > 0 ? (
          <g>
            {/* vx vector */}
            <line x1={projX} y1={projY} x2={liveVxEnd} y2={projY} stroke="#315BE8" strokeWidth="1.8" strokeDasharray="3 2" />
            {/* vy vector */}
            <line x1={projX} y1={projY} x2={projX} y2={liveVyEnd} stroke="#EF8737" strokeWidth="1.8" strokeDasharray="3 2" />
            {/* resultant v vector */}
            <line x1={projX} y1={projY} x2={liveVxEnd} y2={liveVyEnd} stroke="#17212B" strokeWidth="2.2" />
          </g>
        ) : null}
        <circle cx={projX} cy={projY} r="7.5" fill="#EF8737" stroke="#17212B" strokeWidth="2" />

        {/* Telemetry Box */}
        <g transform="translate(442, 16)">
          <rect width="204" height="88" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="1.3" />
          <rect width="204" height="22" fill="#17212B" />
          <text x="10" y="15" fontSize="10" fontFamily="IBM Plex Mono" fill="#FFFFFF" fontWeight="600">
            ВЕКТОР СКОРОСТИ v(t)
          </text>
          <text x="10" y="38" fontSize="11" fontFamily="IBM Plex Mono" fill="#17212B">
            t = {live.time} / {full.flightTime} с
          </text>
          <text x="10" y="56" fontSize="11" fontFamily="IBM Plex Mono" fill="#315BE8" fontWeight="600">
            vx = {live.vx} м/с · vy = {live.vy} м/с
          </text>
          <text x="10" y="75" fontSize="11" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
            |v| = {live.speed} м/с
          </text>
        </g>
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn--primary btn--sm" onClick={handlePlayPause}>
            {running ? <PauseIcon /> : <PlayIcon />}
            {running ? 'Пауза' : live.isLanded ? 'Повторить запуск' : elapsedTime > 0 ? 'Продолжить' : 'Запустить'}
          </button>
          <button type="button" className="btn btn--sm" onClick={handleReset}>
            <ResetIcon />
            Сброс
          </button>
        </div>
        <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--ink-secondary)' }}>
          Во время полёта показаны vx (синий), vy (оранжевый) и результирующий v (чёрный)
        </span>
      </div>
    </div>
  );
}
