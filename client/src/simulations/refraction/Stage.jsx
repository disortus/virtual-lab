import { degToRad } from '../utils.js';

function describeMedium(n) {
  if (n <= 1.05) return 'Воздух';
  if (n <= 1.38) return 'Вода';
  if (n <= 1.65) return 'Стекло';
  return 'Алмаз / плотная';
}

function buildAngleSectorPath(cx, cy, r, startAngleDeg, endAngleDeg) {
  const a1 = degToRad(startAngleDeg);
  const a2 = degToRad(endAngleDeg);
  const x1 = cx + r * Math.sin(a1);
  const y1 = cy - r * Math.cos(a1);
  const x2 = cx + r * Math.sin(a2);
  const y2 = cy - r * Math.cos(a2);
  const sweep = endAngleDeg >= startAngleDeg ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 ${sweep} ${x2} ${y2} Z`;
}

export function RefractionStage({ state }) {
  const { incidentAngle, reflectedAngle, refractedAngle, n1, n2, criticalAngle, isTotalInternalReflection, reflectance } =
    state;

  const cx = 330;
  const cy = 182;
  const rayLen = 152;
  const protR = 96;

  const alpha1 = Math.min(0.24, Math.max(0.02, (n1 - 1) * 0.16));
  const alpha2 = Math.min(0.3, Math.max(0.04, (n2 - 1) * 0.19));

  const th1 = degToRad(incidentAngle);
  const incX = cx - rayLen * Math.sin(th1);
  const incY = cy - rayLen * Math.cos(th1);

  const refX = cx + rayLen * Math.sin(th1);
  const refY = cy - rayLen * Math.cos(th1);

  const th2 = refractedAngle !== null ? degToRad(refractedAngle) : 0;
  const trX = cx + rayLen * Math.sin(th2);
  const trY = cy + rayLen * Math.cos(th2);

  const critRad = criticalAngle !== null ? degToRad(criticalAngle) : null;
  const critX = critRad !== null ? cx - 134 * Math.sin(critRad) : 0;
  const critY = critRad !== null ? cy - 134 * Math.cos(critRad) : 0;

  // Protractor ticks every 15 deg
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <svg
        viewBox="0 0 660 365"
        role="img"
        aria-label={`Оптический стенд: n1=${n1}, n2=${n2}, угол падения ${incidentAngle}°, ${isTotalInternalReflection ? 'полное внутреннее отражение' : `угол преломления ${refractedAngle}°`}`}
        className="grid-surface"
        style={{
          width: '100%',
          height: 'auto',
          border: '1px solid var(--border-strong)',
          borderRadius: '2px',
        }}
      >
        <title>Оптический гониометр: закон Снеллиуса</title>

        {/* Two Optical Media */}
        <rect x="0" y="0" width="660" height={cy} fill={`rgba(49, 91, 232, ${alpha1})`} />
        <rect x="0" y={cy} width="660" height={365 - cy} fill={`rgba(49, 91, 232, ${alpha2})`} />

        {/* Interface Boundary */}
        <line x1="0" y1={cy} x2="660" y2={cy} stroke="#17212B" strokeWidth="2.5" />

        {/* Graduated 360° Protractor */}
        <circle cx={cx} cy={cy} r={protR} fill="rgba(255,255,255,0.45)" stroke="#17212B" strokeWidth="1.2" />
        <circle cx={cx} cy={cy} r={protR - 12} fill="none" stroke="rgba(23,33,43,0.18)" strokeWidth="1" />
        {ticks.map((deg) => {
          const rad = degToRad(deg);
          const inner = deg % 30 === 0 ? protR - 10 : protR - 5;
          const x1 = cx + inner * Math.sin(rad);
          const y1 = cy - inner * Math.cos(rad);
          const x2 = cx + protR * Math.sin(rad);
          const y2 = cy - protR * Math.cos(rad);
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#505862" strokeWidth={deg % 30 === 0 ? 1.4 : 0.9} />;
        })}
        <text x={cx + 6} y={cy - protR - 6} fontSize="9.5" fontFamily="IBM Plex Mono" fill="#505862">
          0° (НОРМАЛЬ)
        </text>
        <text x={cx + protR + 6} y={cy - 6} fontSize="9.5" fontFamily="IBM Plex Mono" fill="#505862">
          90°
        </text>

        {/* Normal Line */}
        <line x1={cx} y1="14" x2={cx} y2="352" stroke="#17212B" strokeWidth="1.5" strokeDasharray="5 4" />

        {/* Angle Sector Arcs */}
        {incidentAngle > 0 ? (
          <path
            d={buildAngleSectorPath(cx, cy, 44, -incidentAngle, 0)}
            fill="rgba(239, 135, 55, 0.22)"
            stroke="#EF8737"
            strokeWidth="1"
          />
        ) : null}
        {reflectedAngle > 0 ? (
          <path
            d={buildAngleSectorPath(cx, cy, 40, 0, reflectedAngle)}
            fill="rgba(239, 135, 55, 0.12)"
            stroke="#EF8737"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        ) : null}
        {!isTotalInternalReflection && refractedAngle > 0 ? (
          <path
            d={buildAngleSectorPath(cx, cy, 46, 180 - refractedAngle, 180)}
            fill="rgba(49, 91, 232, 0.2)"
            stroke="#315BE8"
            strokeWidth="1"
          />
        ) : null}

        {/* Critical Angle Dashed Reference */}
        {critRad !== null ? (
          <g>
            <line x1={cx} y1={cy} x2={critX} y2={critY} stroke="#B55610" strokeWidth="1.4" strokeDasharray="4 3" />
            <text x={critX - 6} y={critY - 6} textAnchor="end" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#B55610" fontWeight="600">
              θ_кр = {criticalAngle}°
            </text>
          </g>
        ) : null}

        {/* Incident Ray + Laser Emitter */}
        <line x1={incX} y1={incY} x2={cx} y2={cy} stroke="#EF8737" strokeWidth="3.6" />
        <g transform={`translate(${incX}, ${incY}) rotate(${-incidentAngle})`}>
          <rect x="-7" y="-12" width="14" height="20" rx="2" fill="#17212B" stroke="#EF8737" strokeWidth="1.5" />
        </g>
        <text x={Math.max(12, incX - 14)} y={Math.max(22, incY - 12)} textAnchor="end" fontSize="11.5" fontFamily="IBM Plex Mono" fill="#B55610" fontWeight="700">
          θ₁ = {incidentAngle}°
        </text>

        {/* Reflected Ray */}
        <line
          x1={cx}
          y1={cy}
          x2={refX}
          y2={refY}
          stroke="#EF8737"
          strokeWidth={isTotalInternalReflection ? 3.6 : 2.3}
          strokeOpacity={isTotalInternalReflection ? 1 : Math.max(0.32, reflectance)}
        />
        <text x={Math.min(646, refX + 10)} y={Math.max(22, refY - 8)} fontSize="11" fontFamily="IBM Plex Mono" fill="#505862" fontWeight="600">
          θ_отр = {reflectedAngle}°
        </text>

        {/* Refracted Ray — strictly NOT drawn during Total Internal Reflection */}
        {!isTotalInternalReflection && refractedAngle !== null ? (
          <g>
            <line x1={cx} y1={cy} x2={trX} y2={trY} stroke="#315BE8" strokeWidth="3.6" />
            <text x={Math.min(646, trX + 10)} y={Math.min(350, trY + 14)} fontSize="11.5" fontFamily="IBM Plex Mono" fill="#315BE8" fontWeight="700">
              θ₂ = {refractedAngle}°
            </text>
          </g>
        ) : null}

        {/* Media Cards */}
        <g transform="translate(14, 14)">
          <rect width="194" height="38" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="1.2" />
          <text x="10" y="16" fontSize="10" fontFamily="IBM Plex Mono" fill="#505862">
            СРЕДА 1 ({describeMedium(n1)})
          </text>
          <text x="10" y="31" fontSize="12" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="700">
            n₁ = {n1.toFixed(2)}
          </text>
        </g>

        <g transform={`translate(14, ${cy + 14})`}>
          <rect width="194" height="38" rx="2" fill="#FFFFFF" stroke="#17212B" strokeWidth="1.2" />
          <text x="10" y="16" fontSize="10" fontFamily="IBM Plex Mono" fill="#505862">
            СРЕДА 2 ({describeMedium(n2)})
          </text>
          <text x="10" y="31" fontSize="12" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="700">
            n₂ = {n2.toFixed(2)}
          </text>
        </g>

        {/* TIR Warning Panel */}
        {isTotalInternalReflection ? (
          <g transform="translate(382, 296)">
            <rect width="264" height="50" rx="2" fill="#FFFFFF" stroke="#B55610" strokeWidth="2" />
            <text x="12" y="20" fontSize="11" fontFamily="IBM Plex Mono" fill="#B55610" fontWeight="700">
              ПОЛНОЕ ВНУТРЕННЕЕ ОТРАЖЕНИЕ
            </text>
            <text x="12" y="39" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#17212B">
              θ₁ ({incidentAngle}°) ≥ θ_кр ({criticalAngle}°) · преломления нет
            </text>
          </g>
        ) : null}
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.78rem', color: 'var(--ink-secondary)' }} className="mono">
        <span>Оранжевый — падающий и отражённый лучи</span>
        <span>Синий — преломлённый луч (исчезает при ПВО)</span>
      </div>
    </div>
  );
}
