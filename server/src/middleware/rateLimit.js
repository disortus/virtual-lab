import rateLimit from 'express-rate-limit';

export const mentorRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 35,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Слишком много запросов к AI Lab Mentor. Подождите немного и попробуйте снова.',
  },
});
