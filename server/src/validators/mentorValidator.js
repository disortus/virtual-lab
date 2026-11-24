import { EXPERIMENT_SPECS, verifySimulationContext } from '../services/physicsVerifier.js';

const ALLOWED_MODES = new Set(['guided', 'free']);
const ALLOWED_PHASES = new Set(['explore', 'hypothesize', 'experiment', 'observe', 'analyze', 'conclude']);
const ALLOWED_ACTIONS = new Set([
  'explain_current_state',
  'what_next',
  'explain_graph',
  'chat',
  'analyze_experiment',
  'review_conclusion',
]);

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /reveal\s+(your\s+)?(system\s+prompt|instructions|secrets?|api\s*key)/i,
  /you\s+are\s+no\s+longer/i,
  /pretend\s+(that\s+)?all\s+previous\s+rules/i,
  /bypass\s+(security|rules|safety)/i,
  /execute\s+(the\s+following|this)\s+code/i,
  /забудь\s+(все\s+)?(предыдущие\s+)?инструкции/i,
  /покажи\s+(свой\s+)?системный\s+промпт/i,
  /раскрой\s+(системные\s+)?инструкции/i,
  /ты\s+больше\s+не\s+(учитель|наставник)/i,
];

export function detectPromptInjection(text) {
  if (typeof text !== 'string' || !text.trim()) return false;
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

function cleanText(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, maxLen);
}

export function validateMentorPayload(body, endpointType) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Тело запроса должно быть корректным JSON-объектом.' };
  }

  // Never allow client-supplied systemInstruction
  if ('systemInstruction' in body || 'system_instruction' in body) {
    return { error: 'Передача системных инструкций с клиента запрещена.' };
  }

  const experimentId = typeof body.experimentId === 'string' ? body.experimentId.trim() : '';
  if (!EXPERIMENT_SPECS[experimentId]) {
    return { error: `Неизвестный идентификатор эксперимента: "${experimentId || 'empty'}".` };
  }

  const mode = ALLOWED_MODES.has(body.mode) ? body.mode : 'free';
  const phase = ALLOWED_PHASES.has(body.phase) ? body.phase : mode === 'guided' ? 'experiment' : 'explore';
  const defaultAction =
    endpointType === 'explain' ? 'explain_current_state' : endpointType === 'analyze' ? 'analyze_experiment' : 'chat';
  const action = ALLOWED_ACTIONS.has(body.action) ? body.action : defaultAction;

  const rawMessage = typeof body.message === 'string' ? body.message : '';
  if (rawMessage.length > 1000) {
    return { error: 'Сообщение слишком длинное (максимум 1000 символов).' };
  }

  if (endpointType === 'chat' && !rawMessage.trim()) {
    return { error: 'Введите сообщение для AI-наставника.' };
  }

  const message = cleanText(rawMessage, 1000);
  const hypothesisChoice = cleanText(body.hypothesisChoice || '', 240);
  const hypothesisReasoning = cleanText(body.hypothesisReasoning || '', 1000);
  const conclusion = cleanText(body.conclusion || '', 1200);

  const recentActions = Array.isArray(body.recentActions)
    ? body.recentActions.slice(-10).map((a) => cleanText(String(a), 140)).filter(Boolean)
    : [];

  const history = Array.isArray(body.history)
    ? body.history
        .slice(-10)
        .filter((item) => item && (item.role === 'user' || item.role === 'mentor') && typeof item.text === 'string')
        .map((item) => ({
          role: item.role,
          text: cleanText(item.text, 800),
        }))
        .filter((item) => item.text.length > 0)
    : [];

  const verifiedContext = verifySimulationContext(experimentId, body.parameters, body.measurements);

  const isInjectionAttempt =
    detectPromptInjection(message) ||
    detectPromptInjection(hypothesisReasoning) ||
    detectPromptInjection(conclusion);

  return {
    data: {
      endpointType,
      experimentId,
      mode,
      phase,
      action,
      message,
      hypothesisChoice,
      hypothesisReasoning,
      conclusion,
      recentActions,
      history,
      verifiedContext,
      isInjectionAttempt,
    },
  };
}
