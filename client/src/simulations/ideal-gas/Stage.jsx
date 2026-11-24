import { useEffect, useRef } from 'react';
import { IDEAL_GAS_BOUNDS } from './model.js';

function createParticles(count, boxLeft, boxRight, boxTop, boxBottom) {
  const particles = [];
  for (let i = 0; i < count; i += 1) {
    const angle = ((i * 137.5) % 360) * (Math.PI / 180);
    particles.push({
      x: boxLeft + 14 + ((i * 53) % Math.max(20, boxRight - boxLeft - 28)),
      y: boxTop + 14 + ((i * 37) % Math.max(20, boxBottom - boxTop - 28)),
      vx: Math.cos(angle),
      vy: Math.sin(angle),
    });
  }
  return particles;
}

export function IdealGasStage({ state }) {
  const { temperature, tempCelsius, volume, moles, pressureKpa, pressureAtm, avgSpeedFactor } = state;
  const canvasRef = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const particlesRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');

    const W = 660;
    const H = 355;
    const cylLeft = 72;
    const cylWidth = 290;
    const cylTop = 38;
    const cylBottom = 305;
    const maxChamberH = cylBottom - cylTop;

    const targetCount = Math.max(8, Math.min(72, Math.round(moles * 14)));
    if (!particlesRef.current) {
      particlesRef.current = createParticles(targetCount, cylLeft, cylLeft + cylWidth, cylTop + 40, cylBottom);
    } else if (particlesRef.current.length < targetCount) {
      const extra = createParticles(
        targetCount - particlesRef.current.length,
        cylLeft,
        cylLeft + cylWidth,
        cylTop + 60,
        cylBottom
      );
      particlesRef.current.push(...extra);
    } else if (particlesRef.current.length > targetCount) {
      particlesRef.current.length = targetCount;
    }

    let rafId;
    let last = performance.now();

    const render = (now) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const cur = stateRef.current;

      // Compute piston Y from volume [5..50 L]
      const volRatio = cur.volume / IDEAL_GAS_BOUNDS.volume.max;
      const chamberH = Math.max(36, volRatio * maxChamberH);
      const pistonBottom = cylBottom - chamberH;

      // Clear & draw blueprint grid
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

      // Thermal base plate tint (cool blue at 200K -> hot orange at 800K)
      const heatRatio = (cur.temperature - 200) / 600;
      const rCol = Math.round(49 + heatRatio * (239 - 49));
      const gCol = Math.round(91 + heatRatio * (135 - 91));
      const bCol = Math.round(232 + heatRatio * (55 - 232));

      // Chamber subtle thermal interior
      ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, 0.09)`;
      ctx.fillRect(cylLeft, pistonBottom, cylWidth, chamberH);

      // Update & draw molecules inside [cylLeft..cylLeft+cylWidth, pistonBottom..cylBottom]
      const speedPx = 85 * cur.avgSpeedFactor;
      const radius = 4.2;
      ctx.fillStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;

      for (const p of particlesRef.current) {
        p.x += p.vx * speedPx * dt;
        p.y += p.vy * speedPx * dt;

        if (p.x < cylLeft + radius + 2) {
          p.x = cylLeft + radius + 2;
          p.vx = Math.abs(p.vx);
        } else if (p.x > cylLeft + cylWidth - radius - 2) {
          p.x = cylLeft + cylWidth - radius - 2;
          p.vx = -Math.abs(p.vx);
        }

        if (p.y < pistonBottom + radius + 2) {
          p.y = pistonBottom + radius + 2;
          p.vy = Math.abs(p.vy);
        } else if (p.y > cylBottom - radius - 2) {
          p.y = cylBottom - radius - 2;
          p.vy = -Math.abs(p.vy);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cylinder walls
      ctx.strokeStyle = '#17212B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cylLeft, cylTop - 10);
      ctx.lineTo(cylLeft, cylBottom);
      ctx.lineTo(cylLeft + cylWidth, cylBottom);
      ctx.lineTo(cylLeft + cylWidth, cylTop - 10);
      ctx.stroke();

      // Thermal Heater Base Plate
      ctx.fillStyle = `rgb(${rCol}, ${gCol}, ${bCol})`;
      ctx.fillRect(cylLeft - 2, cylBottom + 3, cylWidth + 4, 10);
      ctx.strokeStyle = '#17212B';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cylLeft - 2, cylBottom + 3, cylWidth + 4, 10);

      // Piston Head & Shaft
      ctx.fillStyle = '#EAE5D9';
      ctx.fillRect(cylLeft + 2, pistonBottom - 16, cylWidth - 4, 16);
      ctx.strokeStyle = '#17212B';
      ctx.lineWidth = 2;
      ctx.strokeRect(cylLeft + 2, pistonBottom - 16, cylWidth - 4, 16);
      // Shaft
      ctx.fillStyle = '#17212B';
      ctx.fillRect(cylLeft + cylWidth / 2 - 7, 6, 14, Math.max(4, pistonBottom - 22));

      // Volume ruler on left of cylinder
      ctx.fillStyle = '#505862';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'right';
      for (const vMark of [10, 20, 30, 40, 50]) {
        const yMark = cylBottom - (vMark / IDEAL_GAS_BOUNDS.volume.max) * maxChamberH;
        ctx.strokeStyle = '#17212B';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cylLeft - 8, yMark);
        ctx.lineTo(cylLeft, yMark);
        ctx.stroke();
        ctx.fillText(`${vMark}л`, cylLeft - 12, yMark + 3);
      }

      // Analog Manometer Dial on right (connected via pipe)
      const gaugeX = 515;
      const gaugeY = 128;
      const gaugeR = 64;

      ctx.strokeStyle = '#17212B';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cylLeft + cylWidth, cylBottom - 28);
      ctx.lineTo(gaugeX, cylBottom - 28);
      ctx.lineTo(gaugeX, gaugeY + gaugeR);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, gaugeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pressure scale (0..3000 kPa)
      const maxScaleKpa = 3000;
      const pRatio = Math.min(1, cur.pressureKpa / maxScaleKpa);
      const needleAng = ((-125 + pRatio * 250) * Math.PI) / 180;
      ctx.strokeStyle = '#EF8737';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gaugeX, gaugeY);
      ctx.lineTo(gaugeX + Math.sin(needleAng) * 44, gaugeY - Math.cos(needleAng) * 44);
      ctx.stroke();

      ctx.fillStyle = '#17212B';
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.textAlign = 'center';
      ctx.font = '600 11px "IBM Plex Mono", monospace';
      ctx.fillText('МАНОМЕТР', gaugeX, gaugeY - gaugeR - 10);
      ctx.fillStyle = '#315BE8';
      ctx.font = '700 13px "IBM Plex Mono", monospace';
      ctx.fillText(`${cur.pressureKpa} кПа`, gaugeX, gaugeY + 34);

      // State Summary Card (Bottom Right)
      ctx.fillStyle = '#FAF8F3';
      ctx.fillRect(408, 214, 232, 102);
      ctx.strokeStyle = '#17212B';
      ctx.lineWidth = 1.3;
      ctx.strokeRect(408, 214, 232, 102);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#17212B';
      ctx.font = '600 11px "IBM Plex Mono", monospace';
      ctx.fillText(`T = ${cur.temperature} К (${cur.tempCelsius} °C)`, 420, 238);
      ctx.fillText(`V = ${cur.volume} л · n = ${cur.moles} моль`, 420, 260);
      ctx.fillStyle = '#315BE8';
      ctx.fillText(`P = ${cur.pressureKpa} кПа (${cur.pressureAtm} атм)`, 420, 282);
      ctx.fillStyle = '#505862';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.fillText(`v_ср ~ ${cur.avgSpeedFactor}× от 300 К`, 420, 303);

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [moles]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <canvas
        ref={canvasRef}
        width={660}
        height={355}
        role="img"
        aria-label={`Симуляция идеального газа: T = ${temperature} К, V = ${volume} л, n = ${moles} моль, P = ${pressureKpa} кПа`}
        style={{
          width: '100%',
          height: 'auto',
          border: '1px solid var(--border-strong)',
          borderRadius: '2px',
          background: '#FFFFFF',
        }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.5rem' }} className="mono">
        <span style={{ fontSize: '0.76rem', color: 'var(--ink-secondary)' }}>
          Качественная кинетическая модель: число точек ~ n, скорость ~ √T, давление P = nRT/V строго по формуле
        </span>
        <span style={{ fontSize: '0.76rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
          {pressureAtm} атм · {tempCelsius} °C · {avgSpeedFactor}× v₀
        </span>
      </div>
    </div>
  );
}
