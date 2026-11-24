# Virtual Science Lab — ITFest 2026 Beta (Phase 2)

> **Don't just learn science. Discover it.**

**Virtual Science Lab** — интерактивная исследовательская лаборатория для секции *Minds and Machines in Rethinking Learning* (ITFest 2026). Ученик исследует физические законы на детерминированных симуляциях, выдвигает гипотезы, вводит точные параметры (слайдерами или вручную), собирает измерения и работает с **AI Lab Mentor** по методу Сократа (*«The AI should teach students HOW to think, not WHAT to think»*).

---

## 8 интерактивных экспериментов по 5 разделам физики

### 1. Mechanics & Motion
- `EXP—02` **Свободное падение тела** (`s = g·t² / 2`) — вакуумная башня со шкалой высоты, стробоскопическими отметками каждые $T/6$ и сравнением планет.
- `EXP—03` **Движение тела под углом к горизонту** (`L = v₀²·sin(2α) / g`) — баллистический стенд с транспортиром и разложением $\vec{v}(t)$ на $v_x$ и $v_y$.
- `EXP—06` **Второй закон Ньютона** (`a = (F_тяги − F_тр) / m`) — рельс с тележкой, векторами сил и порогом трения покоя.

### 2. Electricity & Circuits
- `EXP—01` **Закон Ома для участка цепи** (`I = U / R`, `P = U·I`) — лабораторный блок питания, ключ цепи, калиброванный амперметр и тепловая мощность резистора.
- `EXP—05` **Последовательное и параллельное соединение** (`R_посл = R₁+R₂ | 1/R_пар = 1/R₁+1/R₂`) — живое переключение топологии цепи и токи ветвей.

### 3. Optics
- `EXP—04` **Преломление света и ПВО** (`n₁·sin(θ₁) = n₂·sin(θ₂)`) — оптический гониометр со шкалой 360°, дугами углов и полным внутренним отражением.

### 4. Thermodynamics
- `EXP—07` **Уравнение идеального газа** (`P·V = n·R·T`) — цилиндр с подвижным поршнем, манометр, кинетическая модель молекул и изотермы $P(V)$.

### 5. Waves & Oscillations
- `EXP—08` **Интерференция и суперпозиция волн** (`y_рез = y₁ + y₂`) — двухлучевой волновой осциллограф с фазовым сдвигом $\Delta\varphi$ и режимами усиления/гашения.

> **Chemistry Lab** (`LAB—02`) остаётся в статусе **Coming Soon** без фиктивных симуляций.

---

## Ключевые особенности Phase 2

- **Единый акцентный цвет `#315BE8`** для интерфейса, кнопок, навигации и контролов; `#EF8737` зарезервирован для физических явлений (тепло, векторы сил, активные точки графиков, предупреждения ПВО).
- **Синхронизированный числовой ввод + слайдеры**: точное значение можно ввести вручную (`Enter` / `onBlur` с ограничением `min`/`max`).
- **Guided Research (основной режим)**: 6-этапный цикл `Explore → Hypothesize → Experiment → Observe → Analyze → Conclude`, при этом `Free Exploration` и кнопка *«Объяснить происходящее»* доступны в любой момент.
- **Человекочитаемые научные отчёты**: структурированные параметры с единицами измерения (без сырого JSON), сохранение в `localStorage` и печать в PDF.
- **AI Lab Mentor**: `@google/genai` (Interactions API) + серверная проверка физики (`physicsVerifier.js`) + защита от prompt injection + честный **Demo Mode** без API-ключа.

---

## Быстрый старт и проверка

```bash
npm run install:all
npm run dev:server   # Backend на http://localhost:5000 (DEMO MODE без GEMINI_API_KEY)
npm run dev:client   # Frontend на http://localhost:5173
```

Сборка и тесты:
```bash
npm run build        # Production-сборка client/dist
npm test             # 10 unit-тестов физики + 6 тестов API/безопасности
```

---

## Развёртывание (Vercel + Render)

1. **Backend (Render)**: используйте `render.yaml` (`Root Directory = server`, `Build = npm install`, `Start = npm start`, `Health = /api/health`). Задайте `GEMINI_API_KEY` (опционально), `GEMINI_MODEL=gemini-3.8-flash` и `CLIENT_URL=https://ваш-фронтенд.vercel.app`.
2. **Frontend (Vercel)**: `Root Directory = client` (`client/vercel.json` настроен для SPA), `Build = npm run build`, `Output = dist`. Задайте `VITE_API_URL=https://ваш-бэкенд.onrender.com`.

---

## Документация

- [Архитектура](docs/ARCHITECTURE.md)
- [Руководство разработчика](docs/DEVELOPMENT.md)
- [AI Lab Mentor и безопасность](docs/AI_BEHAVIOR.md)
- [Сценарий демонстрации ITFest 2026](docs/DEMO_SCRIPT.md)
