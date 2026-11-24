# Архитектура Virtual Science Lab

## Главный архитектурный принцип

**Simulation Engine полностью отделён от AI Learning Engine.** ИИ никогда не вычисляет физические величины и не подменяет математическую модель.

```text
User Interaction (ползунки, ключ цепи, запуск)
       │
       ▼
Simulation Engine (client/src/simulations/*/model.js)
       │ — чистый JS, граничные ограничения, защита от NaN/Infinity
       ▼
Calculated Results ──► SVG-стенд + Цифровые приборы + Chart.js
       │
       ▼ (отправка только параметров и действий)
Backend API (/api/mentor/*)
       │
       ├──► physicsVerifier.js (повторный серверный расчёт истинных значений)
       ├──► mentorValidator.js (валидация схемы, лимиты, prompt-injection фильтр)
       └──► geminiService.js ──► Gemini API (@google/genai) или Demo Mode
```

## Структура модулей

- `client/src/simulations/` — детерминированные математические модели, конфигурации, SVG-стенды и unit-тесты (`simulations.test.js`).
- `client/src/features/research/` — 6-шаговый цикл `GuidedWorkflow.jsx`.
- `client/src/pages/` — Landing, Laboratories (Physics + Chemistry Coming Soon), PhysicsLab, ExperimentWorkspace, Reports, ReportDetail.
- `client/src/services/` — `mentorApi.js` (HTTP-клиент + честный offline-fallback при недоступности сервера) и `reportStorage.js` (`localStorage`).
- `server/src/` — Express API с CORS, rate limiting (`express-rate-limit`), системным промптом на сервере (`prompts/mentorSystemPrompt.js`), серверной проверкой физики (`services/physicsVerifier.js`) и демонстрационным движком (`services/demoMentorService.js`).
