import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { GitService } from './GitService.js';
import { Analyzer } from './Analyzer.js';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const reposDir = path.join(__dirname, '../data/repos');

// Initialize Gemini
const genAI = process.env.GOOGLE_GENERATIVE_AI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
  : null;

const gitService = new GitService(reposDir);

app.use(cors());
app.use(express.json());

// Serve frontend static files if they exist
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'codelore backend is active', ai: !!genAI });
});

app.post('/api/chat', async (req, res) => {
  const { message, context } = req.body;

  if (!genAI) {
    return res.status(503).json({ error: 'AI service not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your .env file.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

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

    const repoInfo = {
      name: repoName,
      owner: owner,
      fullName: `${owner}/${repoName}`,
      url: url,
      branch: 'main',
      description: 'Automatically analyzed repository',
      files: metrics.totalFiles,
      lines: metrics.totalLines,
      primaryLanguage: Object.entries(metrics.languages).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'Unknown',
      stars: 0,
      lastAnalyzed: new Date().toLocaleString(),
      score: 85,
      fileTree: metrics.tree,
      languages: metrics.languages
    };

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

// Fallback for SPA routing - serve index.html for any non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return; // Already handled or 404
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      // If index.html is missing, it's likely dev mode where Vite serves the frontend
      // We don't want to error out the whole server, just provide a hint
      if (!req.path.startsWith('/api')) {
        res.status(404).send('Codelore Frontend not found. Run "npm run build" or use Vite dev server.');
      }
    }
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
