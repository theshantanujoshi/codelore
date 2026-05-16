const API_BASE = '/api';

export interface RepoData {
  name: string;
  owner: string;
  fullName: string;
  url: string;
  branch: string;
  description: string;
  files: number;
  lines: number;
  primaryLanguage: string;
  stars: number;
  lastAnalyzed: string;
  score: number;
  fileTree: any[];
  languages: Record<string, number>;
}

export const analyzeRepo = async (url: string): Promise<RepoData> => {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze repository');
  }

  return response.json();
};

export const chatWithAI = async (message: string, context: any): Promise<string> => {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, context }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`${error.error}${error.details ? ': ' + error.details : ''}`);
  }

  const data = await response.json();
  return data.response;
};
