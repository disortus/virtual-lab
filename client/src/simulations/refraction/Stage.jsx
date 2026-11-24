import { degToRad } from '../utils.js';

function describeMedium(n) {
  if (n <= 1.05) return 'Воздух';
  if (n <= 1.38) return 'Вода';
  if (n <= 1.65) return 'Стекло';
  return 'Плотная среда';
}

export function RefractionStage({ state }) {
  const { incidentAngle, reflectedAngle, refractedAngle, n1, n2, criticalAngle, isTotalInternalReflection, reflectance } =
    state;

  const cx = 320;
  const cy = 180;
  const rayLen = 155;

  // Medium shading proportional to refractive index
  const alpha1 = Math.min(0.28, Math.max(0.03, (n1 - 1) * 0.18));
  const alpha2 = Math.min(0.32, Math.max(0.04, (n2 - 1) * 0.2));

  const th1 = degToRad(incidentAngle);
  // Incident ray comes from top-left toward (cx, cy)
  const incX = cx - rayLen * Math.sin(th1);
  const incY = cy - rayLen * Math.cos(th1);

  // Reflected ray goes to top-right
  const refX = cx + rayLen * Math.sin(th1);
  const refY = cy - rayLen * Math.cos(th1);

  // Refracted ray goes to bottom-right ONLY if not TIR
  const th2 = refractedAngle !== null ? degToRad(refractedAngle) : 0;
  const trX = cx + rayLen * Math.sin(th2);
  const trY = cy + rayLen * Math.cos(th2);

  // Critical angle marker if n1 > n2
  const critRad = criticalAngle !== null ? degToRad(criticalAngle) : null;
  const critX = critRad !== null ? cx - 125 * Math.sin(critRad) : 0;
  const critY = critRad !== null ? cy - 125 * Math.cos(critRad) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <svg
        viewBox="0 0 640 360"
        role="img"
        aria-label={`Преломление света: n1=${n1}, n2=${n2}, угол падения ${incidentAngle}°, ${isTotalInternalReflection ? 'полное внутреннее отражение' : `угол преломления ${refractedAngle}°`}`}
        className="grid-surface"
        style={{
          width: '100%',
          height: 'auto',
          border: '1px solid var(--border-strong)',
          borderRadius: '2px',
        }}
      >
        <title>Оптический стенд: закон Снеллиуса</title>

        {/* Medium 1 (Top) */}
        <rect x="0" y="0" width="640" height={cy} fill={`rgba(49, 91, 232, ${alpha1})`} />
        {/* Medium 2 (Bottom) */}
        <rect x="0" y={cy} width="640" height={360 - cy} fill={`rgba(49, 91, 232, ${alpha2})`} />

        {/* Interface Boundary */}
        <line x1="0" y1={cy} x2="640" y2={cy} stroke="#17212B" strokeWidth="2.5" />

        {/* Normal Line */}
        <line x1={cx} y1="18" x2={cx} y2="342" stroke="#17212B" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x={cx + 8} y="28" fontSize="11" fontFamily="IBM Plex Mono" fill="#505862">
          НОРМАЛЬ
        </text>

        {/* Protractor Arc */}
        <circle cx={cx} cy={cy} r="58" fill="none" stroke="rgba(23,33,43,0.22)" strokeDasharray="2 3" />

        {/* Critical Angle Guide if n1 > n2 */}
        {critRad !== null ? (
          <g>
            <line x1={cx} y1={cy} x2={critX} y2={critY} stroke="#B55610" strokeWidth="1.3" strokeDasharray="3 3" />
            <text x={critX - 6} y={critY - 6} textAnchor="end" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#B55610">
              θ_кр = {criticalAngle}°
            </text>
          </g>
        ) : null}

        {/* Incident Ray */}
        <line x1={incX} y1={incY} x2={cx} y2={cy} stroke="#EF8737" strokeWidth="3.5" />
        <circle cx={incX} cy={incY} r="7" fill="#17212B" stroke="#EF8737" strokeWidth="2" />
        <text x={incX - 8} y={Math.max(22, incY - 10)} textAnchor="end" fontSize="11.5" fontFamily="IBM Plex Mono" fill="#B55610" fontWeight="600">
          θ₁ = {incidentAngle}°
        </text>

        {/* Reflected Ray */}
        <line
          x1={cx}
          y1={cy}
          x2={refX}
          y2={refY}
          stroke="#EF8737"
          strokeWidth={isTotalInternalReflection ? 3.5 : 2.2}
          strokeOpacity={isTotalInternalReflection ? 1 : Math.max(0.32, reflectance)}
        />
        <text x={refX + 8} y={Math.max(22, refY - 8)} fontSize="11.5" fontFamily="IBM Plex Mono" fill="#505862">
          θ_отр = {reflectedAngle}°
        </text>

        {/* Refracted Ray — strictly hidden when Total Internal Reflection occurs */}
        {!isTotalInternalReflection && refractedAngle !== null ? (
          <g>
            <line x1={cx} y1={cy} x2={trX} y2={trY} stroke="#315BE8" strokeWidth="3.5" />
            <text x={trX + 8} y={Math.min(346, trY + 14)} fontSize="11.5" fontFamily="IBM Plex Mono" fill="#315BE8" fontWeight="600">
              θ₂ = {refractedAngle}°
            </text>
          </g>
        ) : null}

        {/* Medium labels */}
        <text x="16" y="28" fontSize="12" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
          СРЕДА 1: n₁ = {n1.toFixed(2)} ({describeMedium(n1)})
        </text>
        <text x="16" y={cy + 24} fontSize="12" fontFamily="IBM Plex Mono" fill="#17212B" fontWeight="600">
          СРЕДА 2: n₂ = {n2.toFixed(2)} ({describeMedium(n2)})
        </text>

        {/* TIR Badge on Stage */}
        {isTotalInternalReflection ? (
          <g transform="translate(365, 294)">
            <rect width="260" height="46" rx="2" fill="#FFFFFF" stroke="#B55610" strokeWidth="2" />
            <text x="12" y="20" fontSize="11.5" fontFamily="IBM Plex Mono" fill="#B55610" fontWeight="700">
              ПОЛНОЕ ВНУТРЕННЕЕ ОТРАЖЕНИЕ
            </text>
            <text x="12" y="37" fontSize="10.5" fontFamily="IBM Plex Mono" fill="#17212B">
              θ₁ ({incidentAngle}°) ≥ θ_кр ({criticalAngle}°) · преломления нет
            </text>
          </g>
        ) : null}
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--ink-secondary)' }} className="mono">
        <span>Оранжевый — падающий и отражённый лучи</span>
        <span>Синий — преломлённый луч</span>
      </div>
    </div>
  );
}
