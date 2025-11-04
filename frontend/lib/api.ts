const BASE = '';

export const api = {
  async getQuestions(filename: string) {
    const response = await fetch(`${BASE}/api/questions/${encodeURIComponent(filename)}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`status=${response.status}; body=${text.slice(0, 500)}`);
    }
    return response.json();
  },

  async getHistory() {
    const response = await fetch(`${BASE}/api/history`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  async getResultStatus(logFile: string) {
    const response = await fetch(`${BASE}/api/result-status?log=${encodeURIComponent(logFile)}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch result status');
    return response.json();
  },

  async getResults() {
    const response = await fetch(`${BASE}/api/results`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch results');
    return response.json();
  },

  async getResult(filename: string) {
    const response = await fetch(`${BASE}/api/view-result/${encodeURIComponent(filename)}`, { cache: 'no-store' });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`status=${response.status}; body=${text.slice(0, 500)}`);
    }
    return response.json();
  },

  async submitInterview(data: {
    candidate_name: string;
    candidate_id: string;
    responses: Array<{ question_id: number; answer: string }>;
  }) {
    const response = await fetch(`${BASE}/api/submit-interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`submit failed: status=${response.status}; body=${text.slice(0,500)}`);
    }
    return response.json();
  },
};

