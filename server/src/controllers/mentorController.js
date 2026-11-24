import { validateMentorPayload } from '../validators/mentorValidator.js';
import { askMentor } from '../services/geminiService.js';

function createMentorHandler(endpointType) {
  return async function handleMentorRequest(req, res, next) {
    try {
      const { error, data } = validateMentorPayload(req.body, endpointType);
      if (error) {
        return res.status(400).json({ error });
      }

      const result = await askMentor(data);
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  };
}

export const explainExperiment = createMentorHandler('explain');
export const chatWithMentor = createMentorHandler('chat');
export const analyzeExperiment = createMentorHandler('analyze');
