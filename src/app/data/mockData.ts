export const mockRepo = {
  name: "codelore",
  owner: "theshantanujoshi",
  fullName: "theshantanujoshi/codelore",
  url: "https://github.com/theshantanujoshi/codelore",
  branch: "main",
  description:
    "a high-performance codebase architecture visualizer and ai-powered documentation engine.",
  files: 42,
  lines: 8420,
  primaryLanguage: "TypeScript",
  lastCommit: "Just now",
  stars: 120,
  lastAnalyzed: "Just now",
  score: 98,
};

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "directory";
  path: string;
  language?: string;
  size?: number;
  lines?: number;
  children?: FileNode[];
  description?: string;
  imports?: string[];
  exports?: string[];
  complexity?: "low" | "medium" | "high";
}

export const mockFileTree: FileNode[] = [
  {
    id: "src",
    name: "src",
    type: "directory",
    path: "src",
    description: "Frontend source code including React components and services",
    children: [
      {
        id: "src-app",
        name: "app",
        type: "directory",
        path: "src/app",
        children: [
          {
            id: "app-tsx",
            name: "App.tsx",
            type: "file",
            path: "src/app/App.tsx",
            language: "TypeScript",
            lines: 120,
            complexity: "medium",
            description: "Main application entry point and routing orchestration.",
          },
          {
            id: "components",
            name: "components",
            type: "directory",
            path: "src/app/components",
            children: [
              {
                id: "comp-views",
                name: "views",
                type: "directory",
                path: "src/app/components/views",
                children: [
                  { id: "v-arch", name: "ArchitectureView.tsx", type: "file", path: "src/app/components/views/ArchitectureView.tsx" },
                  { id: "v-chat", name: "AIChat.tsx", type: "file", path: "src/app/components/views/AIChat.tsx" }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "server",
    name: "server",
    type: "directory",
    path: "server",
    description: "Node.js backend for codebase analysis and AI integration",
    children: [
      {
        id: "server-index",
        name: "index.ts",
        type: "file",
        path: "server/src/index.ts",
        language: "TypeScript",
        lines: 150,
        complexity: "high",
        description: "Express server handling AI chat and repository analysis.",
      }
    ]
  }
];

export interface ArchNode {
  id: string;
  label: string;
  sublabel?: string;
  type: "page" | "component" | "api" | "util" | "store" | "external";
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

export const archNodes: ArchNode[] = [
  // Top Layer - UI
  { id: "view-overview", label: "Overview", sublabel: "views/Overview.tsx", type: "page", x: 60, y: 55, width: 110, height: 44 },
  { id: "view-arch", label: "Architecture", sublabel: "views/ArchitectureView.tsx", type: "page", x: 210, y: 55, width: 150, height: 44 },
  { id: "view-chat", label: "AI Chat", sublabel: "views/AIChat.tsx", type: "page", x: 400, y: 55, width: 90, height: 44 },

  // Middle Layer - Components
  { id: "comp-sidebar", label: "Sidebar", sublabel: "components/Sidebar.tsx", type: "component", x: 60, y: 195, width: 90, height: 44 },
  { id: "comp-graph", label: "NodeGraph", sublabel: "components/Graph.tsx", type: "component", x: 195, y: 195, width: 110, height: 44 },
  { id: "comp-terminal", label: "TerminalUI", sublabel: "components/Terminal.tsx", type: "component", x: 355, y: 195, width: 100, height: 44 },

  // API Layer
  { id: "api-chat", label: "Chat API", sublabel: "server/api/chat", type: "api", x: 60, y: 335, width: 110, height: 44 },
  { id: "api-analyze", label: "Analyzer API", sublabel: "server/api/analyze", type: "api", x: 210, y: 335, width: 110, height: 44 },

  // Service Layer
  { id: "service-analyzer", label: "RepoAnalyzer", sublabel: "server/Analyzer.ts", type: "util", x: 60, y: 475, width: 120, height: 44 },
  { id: "service-git", label: "GitService", sublabel: "server/GitService.ts", type: "util", x: 220, y: 475, width: 100, height: 44 },

  // External
  { id: "ext-gemini", label: "Gemini AI", sublabel: "google-generative-ai", type: "external", x: 380, y: 475, width: 130, height: 44 },
];

export const archEdges: ArchEdge[] = [
  { from: "view-arch", to: "comp-graph" },
  { from: "view-chat", to: "comp-terminal" },
  { from: "comp-terminal", to: "api-chat" },
  { from: "api-chat", to: "ext-gemini" },
  { from: "view-overview", to: "api-analyze" },
  { from: "api-analyze", to: "service-analyzer" },
  { from: "service-analyzer", to: "service-git" },
];

export interface Dependency {
  name: string;
  version: string;
  type: "production" | "development";
  size: string;
  description: string;
  vulnerabilities: number;
  weekly_downloads: string;
  license: string;
}

export const mockDependencies: Dependency[] = [
  { name: "@google/generative-ai", version: "0.24.1", type: "production", size: "150 KB", description: "Google Gemini AI SDK for Node.js and Browser.", vulnerabilities: 0, weekly_downloads: "500K", license: "Apache-2.0" },
  { name: "framer-motion", version: "11.2.10", type: "production", size: "450 KB", description: "Production-ready animation library for React.", vulnerabilities: 0, weekly_downloads: "3.2M", license: "MIT" },
  { name: "lucide-react", version: "0.378.0", type: "production", size: "120 KB", description: "Beautiful & consistent icon toolkit made by the community.", vulnerabilities: 0, weekly_downloads: "1.5M", license: "ISC" },
  { name: "express", version: "4.19.2", type: "production", size: "210 KB", description: "Fast, unopinionated, minimalist web framework for Node.js.", vulnerabilities: 0, weekly_downloads: "35M", license: "MIT" },
];

export interface ExecutionStep {
  id: string;
  title: string;
  description: string;
  type: "route" | "component" | "fetch" | "action" | "cache" | "render";
  file: string;
  duration?: string;
  details?: string[];
}

export const mockExecutionFlow: ExecutionStep[] = [
  {
    id: "1",
    title: "User enters repository URL",
    description: "The frontend sends a POST request to /api/analyze with the Git URL.",
    type: "route",
    file: "src/app/components/RepoImport.tsx",
    duration: "~10ms",
    details: ["Endpoint: /api/analyze", "Payload: { url: 'https://github.com/...' }"],
  },
  {
    id: "2",
    title: "GitService clones repository",
    description: "The backend creates a temporary directory and clones the repository into it.",
    type: "action",
    file: "server/src/GitService.ts",
    duration: "~2.5s",
    details: ["Library: simple-git", "Strategy: shallow clone --depth 1"],
  },
  {
    id: "3",
    title: "Analyzer scans source files",
    description: "Recursive scan of the directory to build the file tree and calculate metrics.",
    type: "fetch",
    file: "server/src/Analyzer.ts",
    duration: "~400ms",
    details: ["Metrics: SLOC, file count, language distribution", "Tree: JSON structure for FileExplorer"],
  },
  {
    id: "4",
    title: "Frontend updates state",
    description: "The UI transitions from 'Processing' to 'Dashboard' with the new metadata.",
    type: "render",
    file: "src/app/App.tsx",
    duration: "~10ms",
  },
];

export interface Insight {
  id: string;
  category: "architecture" | "quality" | "security" | "performance" | "maintainability";
  severity: "info" | "warning" | "error" | "success";
  title: string;
  description: string;
  file?: string;
  effort: "low" | "medium" | "high";
}

export const mockInsights: Insight[] = [
  { id: "1", category: "architecture", severity: "success", title: "modular view structure", description: "Each view is isolated in its own component within components/views/.", effort: "low" },
  { id: "2", category: "performance", severity: "success", title: "efficient git operations", description: "Using shallow clones significantly reduces analysis time for large repos.", effort: "low" },
  { id: "3", category: "security", severity: "warning", title: "api key in env", description: "Ensure the .env file is never committed to version control.", file: "server/.env", effort: "low" },
];

export const mockOnboardingSteps = [
  {
    id: 1,
    title: "Configuration",
    description: "Set up your Gemini API key in the backend environment.",
    commands: ["cd server", "echo GOOGLE_GENERATIVE_AI_API_KEY=your_key > .env"],
    notes: ["Get a key from AI Studio"],
    completed: true,
  },
  {
    id: 2,
    title: "Installation",
    description: "Install dependencies for both frontend and backend.",
    commands: ["npm install"],
    notes: ["This installs all workspace packages"],
    completed: true,
  },
];

export const aiQAPairs = [
  {
    question: "How does the AI chat work?",
    answer: "Codelore uses the **Google Gemini Pro** model. The backend receives your question along with the current repository metadata as context. This allows the AI to give specific answers about your files, architecture, and logic patterns without needing to upload the entire codebase.",
  }
];
