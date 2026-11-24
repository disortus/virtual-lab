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

  // Auto-scale coordinate frame based on current + recorded launches
  const maxX = Math.max(20, full.range * 1.12, ...measurements.map((m) => (m.results?.range || 0) * 1.1));
  const maxY = Math.max(10, full.maxHeight * 1.28, ...measurements.map((m) => (m.results?.maxHeight || 0) * 1.25));

  const left = 56;
  const right = 605;
  const bottom = 306;
  const top = 36;
  const toSvgX = (x) => left + (x / maxX) * (right - left);
  const toSvgY = (y) => bottom - (y / maxY) * (bottom - top);

  const mainPath = curve.trajectoryPoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.x).toFixed(1)} ${toSvgY(pt.y).toFixed(1)}`)
    .join(' ');

  const barrelLen = 30;
  const rad = (params.angle * Math.PI) / 180;
  const barrelX = left + Math.cos(rad) * barrelLen;
  const barrelY = bottom - Math.sin(rad) * barrelLen;

  const projX = toSvgX(live.x);
  const projY = toSvgY(live.y);
  const apexX = toSvgX(full.range / 2);
  const apexY = toSvgY(full.maxHeight);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <svg
        viewBox="0 0 640 360"
        role="img"
        aria-label={`Траектория броска под углом ${params.angle}° со скоростью ${params.velocity} м/с`}
        className="grid-surface"
        style={{
          width: '100%',
          height: 'auto',
          border: '1px solid var(--border-strong)',
          borderRadius: '2px',
        }}
      >
        <title>Баллистическая траектория</title>

        {/* Axes */}
        <line x1={left} y1={top} x2={left} y2={bottom} stroke="#17212B" strokeWidth="1.8" />
        <line x1="32" y1={bottom} x2="620" y2={bottom} stroke="#17212B" strokeWidth="2.5" />

        <text x={left - 8} y={top + 8} textAnchor="end" fontSize="11" fontFamily="IBM Plex Mono" fill="#505862">
          {Math.round(maxY)} м
        </text>
        <text x={right} y={bottom + 18} textAnchor="end" fontSize="11" fontFamily="IBM Plex Mono" fill="#505862">
          {Math.round(maxX)} м
        </text>

        {/* Ghost trajectories from recorded runs */}
        {measurements.slice(-3).map((m, idx) => {
          const gCurve = generateProjectileTrajectory(m.parameters);
          const gPath = gCurve.trajectoryPoints
            .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.x).toFixed(1)} ${toSvgY(pt.y).toFixed(1)}`)
            .join(' ');
          return (
            <path
              key={m.id || idx}
              d={gPath}
              fill="none"
              stroke="rgba(116, 123, 131, 0.55)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Predicted active trajectory */}
        <path d={mainPath} fill="none" stroke="#315BE8" strokeWidth="2.2" strokeDasharray="5 4" />

        {/* Apex marker */}
        <line x1={apexX} y1={apexY} x2={apexX} y2={bottom} stroke="rgba(239,135,55,0.45)" strokeDasharray="3 3" />
        <circle cx={apexX} cy={apexY} r="3.5" fill="#EF8737" />
        <text x={apexX} y={Math.max(20, apexY - 8)} textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" fill="#B55610" fontWeight="600">
          H = {full.maxHeight} м
        </text>

        {/* Range marker */}
        <circle cx={toSvgX(full.range)} cy={bottom} r="4.5" fill="#17212B" />
        <text x={toSvgX(full.range)} y={bottom + 32} textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
          L = {full.range} м
        </text>

        {/* Launcher */}
        <line x1={left} y1={bottom} x2={barrelX} y2={barrelY} stroke="#17212B" strokeWidth="7" strokeLinecap="round" />
        <circle cx={left} cy={bottom} r="7" fill="#EF8737" stroke="#17212B" strokeWidth="2" />

        {/* Active Projectile */}
        <circle cx={projX} cy={projY} r="8" fill="#EF8737" stroke="#17212B" strokeWidth="2" />

        {/* Telemetry box */}
        <g transform="translate(430, 16)">
          <rect width="194" height="72" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="1.2" />
          <text x="10" y="20" fontSize="11" fontFamily="IBM Plex Mono" fill="#505862">
            ПОЛЁТ: {live.time} / {full.flightTime} с
          </text>
          <text x="10" y="40" fontSize="11.5" fontFamily="IBM Plex Mono" fill="#17212B">
            x = {live.x} м · y = {live.y} м
          </text>
          <text x="10" y="59" fontSize="11.5" fontFamily="IBM Plex Mono" fill="#315BE8" fontWeight="600">
            vx = {live.vx} · vy = {live.vy} м/с
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
        <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)' }}>
          Серый пунктир — прошлые зафиксированные броски
        </span>
      </div>
    </div>
  );
}
