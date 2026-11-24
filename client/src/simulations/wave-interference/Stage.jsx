import { useEffect, useRef, useState } from 'react';
import { sampleWaves } from './model.js';
import { PauseIcon, PlayIcon } from '../../components/ui/Icons.jsx';

export function WaveInterferenceStage({ params, state }) {
  const [running, setRunning] = useState(true);
  const canvasRef = useRef(null);
  const paramsRef = useRef(params);
  const stateRef = useRef(state);
  const runningRef = useRef(running);

  paramsRef.current = params;
  stateRef.current = state;
  runningRef.current = running;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');

    const W = 660;
    const H = 355;
    const padL = 52;
    const padR = 24;
    const plotW = W - padL - padR;
    const midY = 186;
    const maxAmpScale = 6.2; // cm -> px scale fits 2 * 3.0 = 6.0 cm

    let simTime = 0;
    let last = performance.now();
    let rafId;

    const render = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (runningRef.current) {
        simTime += dt * 0.45;
      }

      const p = paramsRef.current;
      const s = stateRef.current;
      const pts = sampleWaves({ ...p, time: simTime, samples: 120 });

      const toX = (xVal) => padL + (xVal / 12) * plotW;
      const toY = (yVal) => midY - (yVal / maxAmpScale) * 124;

      // Grid background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(23, 33, 43, 0.055)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y <= H; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Envelope +/- resultantAmplitude lines
      const envTop = toY(s.resultantAmplitude);
      const envBot = toY(-s.resultantAmplitude);
      ctx.strokeStyle = 'rgba(49, 91, 232, 0.28)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(padL, envTop);
      ctx.lineTo(padL + plotW, envTop);
      ctx.moveTo(padL, envBot);
      ctx.lineTo(padL + plotW, envBot);
      ctx.stroke();
      ctx.setLineDash([]);

      // Zero axis & Y-axis
      ctx.strokeStyle = '#17212B';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(padL, 46);
      ctx.lineTo(padL, 326);
      ctx.moveTo(padL, midY);
      ctx.lineTo(padL + plotW, midY);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = '#505862';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('+6 см', padL - 6, toY(6) + 3);
      ctx.fillText('0', padL - 6, midY + 3);
      ctx.fillText('−6 см', padL - 6, toY(-6) + 3);
      ctx.textAlign = 'center';
      for (const xm of [0, 3, 6, 9, 12]) {
        const px = toX(xm);
        ctx.fillText(`${xm} м`, px, 342);
      }

      // Wave 1 (Blue dashed)
      ctx.strokeStyle = 'rgba(49, 91, 232, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      pts.forEach((pt, idx) => {
        const px = toX(pt.x);
        const py = toY(pt.y1);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Wave 2 (Orange dashed)
      ctx.strokeStyle = 'rgba(239, 135, 55, 0.8)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      pts.forEach((pt, idx) => {
        const px = toX(pt.x);
        const py = toY(pt.y2);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Resultant Superposition y_total = y1 + y2 (Bold Dark Ink / Electric Blue)
      ctx.strokeStyle = s.interferenceType === 'destructive' ? '#B55610' : '#17212B';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      pts.forEach((pt, idx) => {
        const px = toX(pt.x);
        const py = toY(pt.yTotal);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Top Status Header inside Oscilloscope
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(padL, 12, plotW, 30);
      ctx.strokeStyle = '#17212B';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(padL, 12, plotW, 30);

      ctx.textAlign = 'left';
      ctx.font = '600 11px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#315BE8';
      ctx.fillText('--- y₁', padL + 10, 31);
      ctx.fillStyle = '#B55610';
      ctx.fillText('--- y₂ (Δφ=' + p.phaseShift + '°)', padL + 72, 31);
      ctx.fillStyle = '#17212B';
      ctx.fillText('━━ y₁ + y₂ (A_рез = ' + s.resultantAmplitude + ' см)', padL + 215, 31);

      const typeLabel =
        s.interferenceType === 'constructive'
          ? 'УСИЛЕНИЕ'
          : s.interferenceType === 'destructive'
            ? 'ГАШЕНИЕ'
            : 'ЧАСТИЧНАЯ';
      ctx.textAlign = 'right';
      ctx.fillStyle = s.interferenceType === 'destructive' ? '#B55610' : '#315BE8';
      ctx.fillText(typeLabel, padL + plotW - 10, 31);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <canvas
        ref={canvasRef}
        width={660}
        height={355}
        role="img"
        aria-label={`Волновой осциллограф: амплитуда ${params.amplitude} см, сдвиг фаз ${params.phaseShift}°, результирующая амплитуда ${state.resultantAmplitude} см`}
        style={{
          width: '100%',
          height: 'auto',
          border: '1px solid var(--border-strong)',
          borderRadius: '2px',
          background: '#FFFFFF',
        }}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => setRunning((r) => !r)}>
          {running ? <PauseIcon /> : <PlayIcon />}
          {running ? 'Пауза осциллографа' : 'Возобновить волны'}
        </button>
        <span className="mono" style={{ fontSize: '0.76rem', color: 'var(--ink-secondary)' }}>
          Сложение двух когерентных волн: A_рез = 2A·|cos(Δφ/2)|
        </span>
      </div>
    </div>
  );
}
