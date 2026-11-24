# Архитектура Virtual Science Lab (Phase 2)

## Главный принцип

**Simulation Engine полностью отделён от AI Learning Engine.** ИИ никогда не вычисляет физические величины и не подменяет математическую модель.

```text
User Interaction (слайдеры, ручной ввод, переключатели)
       │
       ▼
Simulation Engine (client/src/simulations/*/model.js)
       │ — 8 детерминированных моделей, граничные ограничения, защита от NaN/Infinity
       ▼
Calculated Results ──► SVG/Canvas-стенд + Приборы + Chart.js
       │
       ▼ (параметры, гипотеза, история замеров)
Backend API (/api/mentor/*)
       │
       ├──► physicsVerifier.js (пересчёт всех 8 экспериментов на сервере)
       ├──► mentorValidator.js (валидация, лимиты, prompt-injection фильтр)
       └──► geminiService.js ──► Gemini API (@google/genai) или Demo Mode
```

## Разделы и модули

- `client/src/simulations/` — 8 экспериментов (`ohms-law`, `free-fall`, `projectile-motion`, `refraction`, `series-parallel`, `newtons-second-law`, `ideal-gas`, `wave-interference`), объединённых в `index.js`.
- `client/src/components/ui/RangeSlider.jsx` — нативный `<input type="range">`, синхронизированный с ручным `<input type="number">` (`Enter` / `onBlur` + clamping).
- `client/src/utils/parameterFormatter.js` — словарь человекочитаемых названий, символов и единиц измерения для научных отчётов.
- `client/src/pages/` — Landing, Laboratories (`Physics Lab` Available / `Chemistry Lab` Coming Soon), PhysicsLab (5 научных направлений), ExperimentWorkspace (Guided по умолчанию + Free), Reports & ReportDetail.
- `server/src/` — Express API с CORS, rate limiting, серверным системным промптом, серверной верификацией физики для всех 8 экспериментов и `demoMentorService.js`.
