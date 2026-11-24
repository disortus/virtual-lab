# Virtual Science Lab — ITFest 2026 Beta

> **Don't just learn science. Discover it.**

**Virtual Science Lab** — интерактивная образовательная платформа для секции *Minds and Machines in Rethinking Learning* (ITFest 2026). Ученик исследует физические явления на детерминированных симуляциях, выдвигает гипотезы, собирает измерения и работает с **AI Lab Mentor**, который обучает по методу Сократа (*«The AI should teach students HOW to think, not WHAT to think»*).

---

## Ключевые возможности Beta

- **4 интерактивные физические симуляции** (`client/src/simulations/`):
  1. `EXP—01` **Закон Ома** (`I = U / R`, `P = U · I`) — интерактивная схема с ключом, амперметром, потоком зарядов и графиками `I(U)` / `I(R)`.
  2. `EXP—02` **Свободное падение** (`s = g·t² / 2`, `v = g·t`) — башня падения со стробоскопическими метками, пресетами планет (Луна, Марс, Земля, Юпитер) и кривыми `h(t)`, `v(t)`.
  3. `EXP—03` **Движение под углом к горизонту** (`L = v₀²·sin(2α) / g`) — баллистический стенд, сравнение прошлых бросков (ghost curves), разложение на `vx` и `vy`.
  4. `EXP—04` **Преломление света** (`n₁·sin(θ₁) = n₂·sin(θ₂)`) — оптический стенд с нормалью, углами отражения/преломления и полным внутренним отражением (ПВО).
- **Guided Research Mode**: 6-этапный цикл `Explore → Hypothesize → Experiment → Observe → Analyze → Conclude`.
- **Free Exploration Mode**: мгновенный доступ к стенду и кнопка **«Объяснить происходящее»**.
- **AI Lab Mentor**: интеграция с `@google/genai` (Interactions API) на Backend + честный **Demo Mode** без API-ключа.
- **Научные отчёты**: сохранение в `localStorage`, редактирование заключения, печать / сохранение в PDF.
- **Каталог лабораторий**: `Physics Lab` (доступно) и `Chemistry Lab` (обозначено как *Coming Soon*).

---

## Стек

- **Frontend**: React 18, Vite, React Router, Chart.js, чистый ES-модульный JavaScript, SVG/Canvas, CSS Design System (*Scientific Editorial Design*).
- **Backend**: Node.js, Express, `express-rate-limit`, `cors`, `@google/genai`.
- **Хранение данных**: `localStorage` (состояние исследований и научные отчёты).

---

## Быстрый старт (локально)

Требуется **Node.js >= 20**.

1. Установите зависимости:
   ```bash
   npm run install:all
   ```

2. (Опционально) Для реального Gemini API создайте `server/.env` на основе `.env.example`:
   ```env
   GEMINI_API_KEY=ваш_ключ_gemini
   GEMINI_MODEL=gemini-3.8-flash
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```
   > Без `GEMINI_API_KEY` сервер автоматически и честно запускается в **DEMO MODE**.

3. Запустите Backend и Frontend в двух терминалах:
   ```bash
   npm run dev:server
   npm run dev:client
   ```
   Откройте в браузере `http://localhost:5173`.

---

## Тестирование и сборка

```bash
# Продакшн-сборка клиента
npm run build

# Unit-тесты физики (client) + тесты безопасности и API наставника (server)
npm test
```

---

## Развёртывание (Vercel + Render)

1. **Backend (Render)**:
   - Подключите репозиторий, выберите Blueprint (`render.yaml`) или Web Service с `Root Directory = server`, `Build Command = npm install`, `Start Command = npm start`.
   - Задайте переменные окружения: `GEMINI_API_KEY` (опционально), `GEMINI_MODEL=gemini-3.8-flash`, `CLIENT_URL=https://ваш-домен.vercel.app`.
2. **Frontend (Vercel)**:
   - Импортируйте репозиторий, выберите `Root Directory = client`, Build Command `npm run build`, Output Directory `dist` (`client/vercel.json` уже настроен для SPA-роутинга).
   - Укажите переменную окружения `VITE_API_URL=https://ваш-бэкенд.onrender.com`.

---

## Документация

- [Архитектура системы](docs/ARCHITECTURE.md)
- [Руководство разработчика](docs/DEVELOPMENT.md)
- [Поведение AI Lab Mentor и безопасность](docs/AI_BEHAVIOR.md)
- [Сценарий демонстрации для жюри ITFest 2026](docs/DEMO_SCRIPT.md)

---

## Атрибуция AI-инструментов

В разработке прототипа применялись инструменты генеративного ИИ (**Google Antigravity** и **Gemini**) для проектирования архитектуры, генерации компонентов и тестирования; при этом физические вычисления выполняются детерминированным JavaScript-кодом без участия LLM.
