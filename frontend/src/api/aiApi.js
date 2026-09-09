import { post } from './client';

export const aiApi = {
  // Explanations are grounded in verified findings and stored evidence only.
  explain: ({ question, findingId, safetyCheckId }) =>
    post('/ai/explain', { question, findingId, safetyCheckId }),
};
