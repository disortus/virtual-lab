# Руководство разработчика

## Требования
- Node.js `>= 20`
- npm `>= 10`

## Команды корневого `package.json`

| Команда | Назначение |
| --- | --- |
| `npm run install:all` | Установка зависимостей в `client/` и `server/` |
| `npm run dev:server` | Запуск Express API в режиме `--watch` на порту `5000` |
| `npm run dev:client` | Запуск Vite dev-сервера на порту `5173` (с прокси `/api` → `5000`) |
| `npm run build` | Production-сборка `client/dist/` |
| `npm test` | Запуск unit-тестов физики (`client`) и API/безопасности (`server`) |

## Как добавить новый эксперимент

1. Создайте директорию `client/src/simulations/<id>/` с тремя файлами:
   - `model.js` — чистые функции расчёта и генерации графиков (`sanitizeNumber`, `round`).
   - `config.js` — метаданные, границы параметров, пресеты и вопросы Guided Research.
   - `Stage.jsx` — интерактивный SVG/Canvas стенд.
2. Зарегистрируйте эксперимент в `client/src/simulations/index.js`.
3. Добавьте серверную верификацию формул в `server/src/services/physicsVerifier.js` и сценарий Demo Mode в `server/src/services/demoMentorService.js`.
4. Добавьте unit-тесты в `client/src/simulations/simulations.test.js` и `server/src/mentor.test.js`.
