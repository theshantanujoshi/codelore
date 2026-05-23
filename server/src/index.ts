import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GitService } from './GitService.js';
import { Analyzer } from './Analyzer.js';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '../..');
const distPath = path.join(projectRoot, 'dist');

dotenv.config();

import os from 'os';
const app = express();
const port = process.env.PORT || 3001;
const reposDir = process.env.VERCEL ? path.join(os.tmpdir(), 'repos') : path.join(__dirname, '../data/repos');
const useViteMiddleware = process.env.CODELORE_VITE_MIDDLEWARE === '1';

// Initialize Gemini or prepare for OpenRouter
const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const isOpenRouter = apiKey.startsWith('sk-or-');
const genAI = (!isOpenRouter && apiKey)
  ? new GoogleGenerativeAI(apiKey)
  : null;

const gitService = new GitService(reposDir);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

let vite: any = null;
if (useViteMiddleware) {
  const { createServer } = await import('vite');
  vite = await createServer({
    root: projectRoot,
    appType: 'custom',
    server: {
      middlewareMode: true,
      watch: {
        ignored: ['**/server/data/**']
      }
    }
  });
} else {
  app.use(express.static(distPath));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'codelore backend is active', ai: !!genAI });
});

app.post('/api/chat', async (req, res) => {
  const { message, context } = req.body;

  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your .env file.' });
  }

  try {
    const prompt = `You are Codelore AI, a elite software architect and codebase expert.
    
    Format your response strictly using this structure for maximum technical clarity:
    
    ### ✦ STATUS: ANALYZED
    Provide a high-level summary of the resolution or answer (max 2 sentences).
    
    ### ✦ ARCHITECTURAL INSIGHTS
    Break down the logic, patterns, and implementation details. Use nested bullet points if necessary. Focus on how components interact.
    
    ### ✦ CODE IMPLEMENTATION
    If the user asked for code or if an example is helpful, provide it here. Use markdown blocks.
    
    ### ✦ SOURCE GRAPH
    List the specific files or modules that were referenced in this answer.
    
    ### ✦ RECOMMENDED EXPLORATION
    Suggest follow-up questions or areas for the user to investigate next.
    
    Context about the repository:
    ${JSON.stringify(context, null, 2)}
    
    User question: ${message}`;

    let text = '';
    
    if (isOpenRouter) {
      const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [{ role: "user", content: prompt }]
        })
      });
      const orData: any = await orRes.json();
      if (orData.error) throw new Error(orData.error.message || 'OpenRouter API Error');
      text = orData.choices[0].message.content;
    } else {
      const model = genAI!.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      text = result.response.text();
    }

    res.json({ response: text });
  } catch (error: any) {
    console.error('[server]: AI Error:', error);
    res.status(500).json({ error: 'Failed to generate AI response', details: error.message });
  }
});

app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;
  console.log(`[server]: Received request to analyze: ${url}`);

  if (!url) {
    return res.status(400).json({ error: 'Repository URL is required' });
  }

  try {
    console.log(`[server]: Cloning repository...`);
    const repoDir = await gitService.clone(url);
    console.log(`[server]: Clone complete at ${repoDir}. Starting analysis...`);
    
    const analyzer = new Analyzer(repoDir);
    const metrics = await analyzer.getMetrics();
    console.log(`[server]: Analysis complete. Found ${metrics.totalFiles} files.`);

    const repoName = url.split('/').pop()?.replace('.git', '') || 'unknown';
    const owner = url.split('/').slice(-2, -1)[0] || 'unknown';

    // Fetch real GitHub stats
    let stars = 0;
    let description = 'Automatically analyzed repository';
    try {
      const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);
      if (ghRes.ok) {
        const ghData: any = await ghRes.json();
        stars = ghData.stargazers_count || 0;
        description = ghData.description || description;
      }
    } catch (e) {
      console.warn(`[server]: Failed to fetch github stats:`, e);
    }

    // --- AI Generation ---
    let aiScore = metrics.score || 85;
    let aiScoreCategories = undefined;
    let aiInsights = undefined;
    let aiExecutionFlow = undefined;
    let aiOnboarding = undefined;
    let aiArchitecture = undefined;

    if (apiKey) {
      try {
        console.log(`[server]: Generating AI analysis...`);
        let text = '';
        
        // Limit tree size for prompt
        const summarizeTree = (nodes: any[], depth = 0): any[] => {
          if (depth > 2 || !nodes) return [];
          return nodes.slice(0, 30).map((n: any) => ({
            path: n.path,
            type: n.type,
            language: n.language,
            lines: n.lines,
            ...(n.type === 'directory' ? { children: summarizeTree(n.children, depth + 1) } : {})
          }));
        };

        const treeSnippet = JSON.stringify(summarizeTree(metrics.tree), null, 2);
        const depsSnippet = JSON.stringify(metrics.dependencies.slice(0, 20).map((d: any) => `${d.name}@${d.version} (${d.type})`));

        const megaPrompt = `You are an expert code analyzer. Analyze this repository and return a single JSON object.

Repository: ${owner}/${repoName}
Description: ${description}
Languages: ${JSON.stringify(metrics.languages)}
Total Files: ${metrics.totalFiles}
Total Lines: ${metrics.totalLines}
Dependencies: ${depsSnippet}
README (first 1500 chars): ${metrics.readme?.slice(0, 1500) || 'No README found'}

Directory Structure:
${treeSnippet}

Return this EXACT JSON structure:
{
  "score": <number 0-100>,
  "scoreCategories": [
    {"label": "Architecture", "score": <0-100>},
    {"label": "Code Quality", "score": <0-100>},
    {"label": "Security", "score": <0-100>},
    {"label": "Performance", "score": <0-100>},
    {"label": "Maintainability", "score": <0-100>}
  ],
  "insights": [
    {"id": "1", "category": "<architecture|quality|security|performance|maintainability>", "severity": "<success|warning|error|info>", "title": "<short lowercase>", "description": "<1-2 sentences>", "effort": "<low|medium|high>", "file": "<optional file path>"}
  ],
  "executionFlow": [
    {"id": "1", "title": "<step title>", "description": "<what happens>", "type": "<route|component|fetch|action|cache|render>", "file": "<file path>", "duration": "<estimated time>", "details": ["<detail1>", "<detail2>"]}
  ],
  "onboarding": [
    {"id": 1, "title": "<step title>", "description": "<what to do>", "commands": ["<cmd1>", "<cmd2>"], "notes": ["<note1>"]}
  ],
  "architecture": {
    "nodes": [
      {"id": "<unique>", "label": "<module name>", "sublabel": "<file path>", "type": "<page|component|api|util|external>", "x": <number>, "y": <number>, "width": 130, "height": 44}
    ],
    "edges": [
      {"from": "<node id>", "to": "<node id>"}
    ]
  },
  "fileMetadata": [
    {"path": "<file path>", "description": "<1-2 sentences explaining what this file does>", "complexity": "<low|medium|high>"}
  ]
}

Rules:
- Generate 3-5 insights based on actual code patterns you see
- Generate 3-6 execution flow steps showing how a typical request flows through this specific codebase
- Generate 2-4 onboarding steps with real commands based on the package.json and README
- Generate 6-12 architecture nodes showing the actual modules. 
- You MUST assign their Y coordinates strictly based on their type: page=55, component=195, api=335, util=475, external=475.
- Distribute their X coordinates sequentially (e.g. 60, 220, 380, 540, 700) and NEVER assign the same X and Y to two different nodes.
- Generate edges showing real data flow between modules
- Generate fileMetadata for the 10-15 most important files, providing a short description and complexity rating.
- All data must be specific to THIS repository, not generic`;
        if (isOpenRouter) {
          const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.0-flash-001",
              response_format: { type: "json_object" },
              messages: [{ role: "user", content: megaPrompt }]
            })
          });
          const orData: any = await orRes.json();
          if (orData.error) throw new Error(orData.error.message || 'OpenRouter API Error');
          text = orData.choices[0].message.content;
        } else {
          const model = genAI!.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
          });
          const result = await model.generateContent(megaPrompt);
          text = result.response.text();
        }
        text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const aiData = JSON.parse(text);
        
        if (typeof aiData.score === 'number') aiScore = aiData.score;
        if (Array.isArray(aiData.scoreCategories)) aiScoreCategories = aiData.scoreCategories;
        if (Array.isArray(aiData.insights)) aiInsights = aiData.insights.map((ins: any, i: number) => ({ ...ins, id: String(i + 1) }));
        if (Array.isArray(aiData.executionFlow)) aiExecutionFlow = aiData.executionFlow;
        if (Array.isArray(aiData.onboarding)) aiOnboarding = aiData.onboarding;
        if (aiData.architecture?.nodes) aiArchitecture = aiData.architecture;
        
        if (Array.isArray(aiData.fileMetadata)) {
          const metaMap = new Map(aiData.fileMetadata.map((m: any) => [m.path, m]));
          const enrichTree = (nodes: any[]) => {
            for (const node of nodes) {
              if (metaMap.has(node.path)) {
                const meta = metaMap.get(node.path) as any;
                node.description = meta.description;
                node.complexity = meta.complexity;
              }
              if (node.children) enrichTree(node.children);
            }
          };
          enrichTree(metrics.tree);
        }
        
        console.log(`[server]: AI generated ${aiInsights?.length || 0} insights, ${aiExecutionFlow?.length || 0} flow steps, ${aiOnboarding?.length || 0} onboarding steps, ${aiArchitecture?.nodes?.length || 0} arch nodes, ${aiData.fileMetadata?.length || 0} file metas.`);
      } catch (e: any) {
        console.warn(`[server]: AI generation failed:`, e.message);
      }
    }

    // Build response
    const repoInfo = {
      name: repoName,
      owner: owner,
      fullName: `${owner}/${repoName}`,
      url: url,
      branch: 'main',
      description: description,
      files: metrics.totalFiles,
      lines: metrics.totalLines,
      primaryLanguage: Object.entries(metrics.languages).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'Unknown',
      stars: stars,
      lastAnalyzed: new Date().toLocaleString(),
      score: aiScore,
      scoreCategories: aiScoreCategories,
      insights: aiInsights,
      fileTree: metrics.tree,
      languages: metrics.languages,
      dependencies: metrics.dependencies,
      architecture: aiArchitecture || metrics.architecture,
      executionFlow: aiExecutionFlow,
      onboarding: aiOnboarding,
    };

    // Clean up repo
    try {
      fs.rmSync(repoDir, { recursive: true, force: true });
      console.log(`[server]: Cleaned up repository clone at ${repoDir}`);
    } catch (e) {
      console.warn(`[server]: Failed to delete repo clone:`, e);
    }

    console.log(`[server]: Sending results back to client.`);
    res.json(repoInfo);
  } catch (error: any) {
    console.error(`[server]: Analysis failed:`, error);
    res.status(500).json({ 
      error: 'Failed to analyze repository', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

if (vite) {
  app.use(vite.middlewares);
}

// Fallback for SPA routing
app.get('*', async (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }

  if (vite) {
    try {
      const indexHtmlPath = path.join(projectRoot, 'index.html');
      const template = fs.readFileSync(indexHtmlPath, 'utf-8');
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (error: any) {
      vite.ssrFixStacktrace(error);
      console.error('[server]: Failed to render Vite index.html', error);
      return res.status(500).send(error.message);
    }
  }

  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      if (!req.path.startsWith('/api')) {
        res.status(404).send('Codelore Frontend not found. Run "npm run build" or use Vite dev server.');
      }
    }
  });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

export default app;
