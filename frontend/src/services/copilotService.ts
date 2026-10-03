import { apiClient, setUsingMockData } from './api';
import { CopilotResponse } from '../types';
import { mockCopilotAnswers } from '../data/mockData';

export async function askCopilot(message: string): Promise<CopilotResponse> {
  try {
    const response = await apiClient.post<CopilotResponse>('/api/copilot', { message });
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn('[VOLTIS API] Backend unreachable for copilot, using smart fallback response:', error);
    setUsingMockData(true);

    const lower = message.toLowerCase();
    if (lower.includes('increase') || lower.includes('surge') || lower.includes('yesterday') || lower.includes('why')) {
      return mockCopilotAnswers.why_increase;
    }
    if (lower.includes('waste') || lower.includes('most') || lower.includes('compressor')) {
      return mockCopilotAnswers.waste_machine;
    }
    if (lower.includes('inspect') || lower.includes('check') || lower.includes('today')) {
      return mockCopilotAnswers.what_to_inspect;
    }
    if (lower.includes('optim') || lower.includes('opportunity') || lower.includes('saving')) {
      return mockCopilotAnswers.biggest_optimization;
    }
    return mockCopilotAnswers.default;
  }
}
