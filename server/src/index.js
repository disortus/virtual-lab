import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import mentorRoutes from './routes/mentorRoutes.js';

export function createApp() {
  const app = express();

  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        return callback(new Error('Origin not allowed by CORS'));
      },
    })
  );

  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (req, res) => {
    const hasKey = Boolean((process.env.GEMINI_API_KEY || '').trim());
    res.json({
      status: 'ok',
      aiMode: hasKey ? 'live' : 'demo',
      model: hasKey ? (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim() : 'demo-scenario-engine',
    });
  });

  app.use('/api/mentor', mentorRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден.' });
  });

  app.use((err, req, res, _next) => {
    console.error('[server error]', err.message);
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'Превышен допустимый размер запроса.' });
    }
    if (err.message && err.message.includes('CORS')) {
      return res.status(403).json({ error: 'Доступ с данного домена запрещён CORS.' });
    }
    return res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
  });

  return app;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  const port = Number(process.env.PORT) || 5000;
  const app = createApp();
  app.listen(port, () => {
    const hasKey = Boolean((process.env.GEMINI_API_KEY || '').trim());
    console.log(
      `Virtual Science Lab server listening on http://localhost:${port} (AI mode: ${hasKey ? 'LIVE' : 'DEMO'})`
    );
  });
}
