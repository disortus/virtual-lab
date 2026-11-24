import { GoogleGenAI } from '@google/genai';
import { MENTOR_SYSTEM_PROMPT } from '../prompts/mentorSystemPrompt.js';
import { generateDemoMentorReply } from './demoMentorService.js';

const REQUEST_TIMEOUT_MS = 25000;

let cachedClient = null;
let cachedApiKey = null;

function getClient() {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new GoogleGenAI({ apiKey });
    cachedApiKey = apiKey;
  }
  return cachedClient;
}

function buildStructuredPrompt(payload) {
  const { verifiedContext, mode, phase, action, hypothesisChoice, hypothesisReasoning, conclusion, recentActions, history, message } =
    payload;

  const contextBlock = JSON.stringify(
    {
      experiment: verifiedContext.experimentId,
      title: verifiedContext.title,
      objective: verifiedContext.objective,
      mode,
      phase,
      action,
      parameters: verifiedContext.parameters,
      results: verifiedContext.results,
      units: verifiedContext.units,
      recordedMeasurementsCount: verifiedContext.measurements.length,
      recordedMeasurements: verifiedContext.measurements.slice(-4),
      recentActions: recentActions.slice(-6),
    },
    null,
    2
  );

  const historyText =
    history.length > 0
      ? history.map((h) => `${h.role === 'user' ? 'Ученик' : 'Наставник'}: ${h.text}`).join('\n')
      : 'Диалог только начался.';

  const studentSection = [
    hypothesisChoice ? `Выбранная гипотеза: ${hypothesisChoice}` : '',
    hypothesisReasoning ? `Обоснование гипотезы учеником: ${hypothesisReasoning}` : '',
    conclusion ? `Черновик научного вывода ученика: ${conclusion}` : '',
    message ? `Сообщение ученика: ${message}` : `Запрошенное действие: ${action}`,
  ]
    .filter(Boolean)
    .join('\n');

  return `<verified_simulation_data>
${contextBlock}
</verified_simulation_data>

<recent_dialogue>
${historyText}
</recent_dialogue>

<untrusted_student_input>
${studentSection}
</untrusted_student_input>`;
}

function extractInteractionText(interaction) {
  if (!interaction) return '';
  if (typeof interaction.output_text === 'string' && interaction.output_text.trim()) {
    return interaction.output_text.trim();
  }
  if (Array.isArray(interaction.steps)) {
    const outputTexts = [];
    for (const step of interaction.steps) {
      if (step?.type === 'model_output' && Array.isArray(step.content)) {
        for (const item of step.content) {
          if (item?.type === 'text' && typeof item.text === 'string') {
            outputTexts.push(item.text);
          }
        }
      }
    }
    if (outputTexts.length > 0) {
      return outputTexts.join('\n').trim();
    }
  }
  return '';
}

export async function askMentor(payload) {
  const model = (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim();

  // Always deflect obvious prompt-injection locally before calling external API
  if (payload.isInjectionAttempt) {
    return {
      reply: generateDemoMentorReply(payload),
      aiMode: getClient() ? 'live-guard' : 'demo',
      model: getClient() ? model : 'demo-scenario-engine',
      verifiedContext: payload.verifiedContext,
    };
  }

  const client = getClient();
  if (!client) {
    return {
      reply: generateDemoMentorReply(payload),
      aiMode: 'demo',
      model: 'demo-scenario-engine',
      verifiedContext: payload.verifiedContext,
    };
  }

  const promptInput = buildStructuredPrompt(payload);

  try {
    const interactionPromise = client.interactions.create({
      model,
      system_instruction: MENTOR_SYSTEM_PROMPT,
      input: promptInput,
      store: false,
      generation_config: {
        thinking_level: 'low',
      },
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API timeout exceeded')), REQUEST_TIMEOUT_MS);
    });

    const interaction = await Promise.race([interactionPromise, timeoutPromise]);
    const text = extractInteractionText(interaction);

    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    return {
      reply: text,
      aiMode: 'live',
      model,
      verifiedContext: payload.verifiedContext,
    };
  } catch (error) {
    console.warn(`[mentor] Gemini API unavailable (${error.message}). Falling back to Demo Mode.`);
    return {
      reply: generateDemoMentorReply(payload),
      aiMode: 'demo-fallback',
      model: 'demo-scenario-engine',
      fallbackReason: 'live_api_unavailable',
      verifiedContext: payload.verifiedContext,
    };
  }
}
