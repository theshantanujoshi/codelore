const API_BASE = '/api';

export interface Insight {
  id: string;
  category: "architecture" | "quality" | "security" | "performance" | "maintainability";
  severity: "info" | "warning" | "error" | "success";
  title: string;
  description: string;
  file?: string;
  effort: "low" | "medium" | "high";
}

export interface ScoreCategory {
  label: string;
  score: number;
}

export interface Dependency {
  name: string;
  version: string;
  type: "production" | "development";
  size?: string;
  description?: string;
  vulnerabilities?: number;
  weekly_downloads?: string;
  license?: string;
}

export interface ArchNode {
  id: string;
  label: string;
  sublabel?: string;
  type: "page" | "component" | "api" | "util" | "store" | "external" | string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ArchEdge {
  from: string;
  to: string;
  label?: string;
}

export interface ExecutionStep {
  id: string;
  title: string;
  description: string;
  type: "route" | "component" | "fetch" | "action" | "cache" | "render" | string;
  file: string;
  duration?: string;
  details?: string[];
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  commands: string[];
  notes: string[];
  completed?: boolean;
}

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
  scoreCategories?: ScoreCategory[];
  insights?: Insight[];
  fileTree: any[];
  languages: Record<string, number>;
  dependencies?: Dependency[];
  architecture?: { nodes: ArchNode[]; edges: ArchEdge[] };
  executionFlow?: ExecutionStep[];
  onboarding?: OnboardingStep[];
  isLargeRepo?: boolean;
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
