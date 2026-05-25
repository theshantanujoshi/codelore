#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Analyzer } from './Analyzer.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Colors configuration (ANSI codes)
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m'
};

const logo = `
${colors.cyan}${colors.bold}  ______   ______   _____   ______  _       ______   ______   ______ 
 / |      / |  | | | |  | \\ | |     | |     / |  | | | |  | \\ | |     
 | |      | |  | | | |  | | | |---- | |   _ | |  | | | |__| | | |---- 
 \\ |_____ \\______/ |_|__|_/ |_|____ |_|__|_|\\______/ |_|  \\_\\ |_|____ 
${colors.reset}
`;

function getAPIKey(): string {
  // 1. Check environment variable
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  }

  // 2. Look for .env in current working directory
  try {
    const localEnvPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(localEnvPath)) {
      const content = fs.readFileSync(localEnvPath, 'utf-8');
      const match = content.match(/GOOGLE_GENERATIVE_AI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch (_) {}

  // 3. Look for .env in the server directory
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const serverEnvPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(serverEnvPath)) {
      const content = fs.readFileSync(serverEnvPath, 'utf-8');
      const match = content.match(/GOOGLE_GENERATIVE_AI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch (_) {}

  return '';
}

async function run() {
  console.log(logo);

  const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();

  if (!fs.existsSync(targetDir)) {
    console.error(`${colors.red}${colors.bold}Error:${colors.reset} Directory "${targetDir}" does not exist.`);
    process.exit(1);
  }

  console.log(`${colors.bold}Scanning directory:${colors.reset} ${targetDir}`);
  console.log(`${colors.dim}This may take a moment depending on directory size...${colors.reset}\n`);

  const analyzer = new Analyzer(targetDir);
  let metrics: any;
  try {
    metrics = await analyzer.getMetrics();
  } catch (e: any) {
    console.error(`${colors.red}${colors.bold}Scan Failed:${colors.reset} ${e.message}`);
    process.exit(1);
  }

  // Header Details
  const folderName = path.basename(targetDir);
  console.log(`${colors.cyan}${colors.bold}✦ SNAPSHOT: ${folderName.toUpperCase()}${colors.reset}`);
  console.log(`${colors.bold}Files:${colors.reset} ${metrics.totalFiles} | ${colors.bold}Lines:${colors.reset} ${metrics.totalLines}`);
  console.log(`${colors.bold}Languages:${colors.reset} ${Object.entries(metrics.languages).map(([l, lines]) => `${l} (${lines} loc)`).join(', ')}`);
  
  if (metrics.dependencies.length > 0) {
    console.log(`${colors.bold}Dependencies:${colors.reset} Detected ${metrics.dependencies.length} packages (production: ${metrics.dependencies.filter((d: any) => d.type === 'production').length}, dev: ${metrics.dependencies.filter((d: any) => d.type === 'development').length})`);
  }
  console.log(`\n--------------------------------------------------\n`);

  const apiKey = getAPIKey();
  let aiData: any = null;

  if (apiKey) {
    console.log(`${colors.bold}AI Analysis is active. Requesting diagnostics from Gemini...${colors.reset}`);
    const isOpenRouter = apiKey.startsWith('sk-or-');
    
    try {
      const treeSnippet = JSON.stringify(metrics.tree.slice(0, 30).map((n: any) => ({
        path: n.path,
        type: n.type,
        language: n.language,
        lines: n.lines
      })), null, 2);
      const depsSnippet = JSON.stringify(metrics.dependencies.slice(0, 20).map((d: any) => `${d.name}@${d.version}`));

      const prompt = `You are an expert codebase analyzer. Analyze this repository structure and return a single JSON object.

Folder Name: ${folderName}
Languages: ${JSON.stringify(metrics.languages)}
Total Files: ${metrics.totalFiles}
Total Lines: ${metrics.totalLines}
Dependencies: ${depsSnippet}
README (first 1000 chars): ${metrics.readme?.slice(0, 1000) || 'None'}
Directory Tree:
${treeSnippet}

Return this EXACT JSON structure:
{
  "score": <number 0-100>,
  "insights": [
    {"category": "<architecture|quality|security|performance|maintainability>", "severity": "<success|warning|error|info>", "title": "<short title>", "description": "<1-2 sentences>"}
  ],
  "onboarding": [
    {"id": 1, "title": "<step title>", "description": "<what to do>", "commands": ["<cmd1>"]}
  ]
}

Ensure valid JSON syntax. Do not output anything other than JSON.`;

      let text = '';
      if (isOpenRouter) {
        const orRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-001",
            response_format: { type: "json_object" },
            messages: [{ role: "user", content: prompt }]
          })
        });
        const orData: any = await orRes.json();
        if (orData.error) throw new Error(orData.error.message || 'OpenRouter API Error');
        text = orData.choices[0].message.content;
      } else {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.0-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        text = result.response.text();
      }

      text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      aiData = JSON.parse(text);
    } catch (err: any) {
      console.warn(`\n${colors.red}AI generation failed:${colors.reset} ${err.message}. Displaying static metrics instead.\n`);
    }
  } else {
    console.log(`${colors.yellow}⚠️  AI Key not configured.${colors.reset} Displaying static diagnostics.`);
    console.log(`To enable AI insights, set environment variable:\nexport GOOGLE_GENERATIVE_AI_API_KEY="your-key-here"\n`);
  }

  // Print results
  const finalScore = aiData?.score || metrics.score;
  const scoreColor = finalScore > 85 ? colors.green : finalScore > 65 ? colors.yellow : colors.red;
  console.log(`${colors.bold}HEALTH SCORE:${colors.reset} ${scoreColor}${colors.bold}${finalScore}/100${colors.reset}\n`);

  if (aiData?.insights) {
    console.log(`${colors.cyan}${colors.bold}✦ CODEBASE INSIGHTS${colors.reset}`);
    for (const ins of aiData.insights) {
      let icon = '•';
      let color = colors.reset;
      
      if (ins.severity === 'success') { icon = '✔'; color = colors.green; }
      else if (ins.severity === 'warning') { icon = '⚠️'; color = colors.yellow; }
      else if (ins.severity === 'error') { icon = '✘'; color = colors.red; }
      else if (ins.severity === 'info') { icon = 'ℹ'; color = colors.cyan; }

      console.log(`${color}${colors.bold}${icon} [${ins.category.toUpperCase()}] ${ins.title}${colors.reset}`);
      console.log(`  ${ins.description}\n`);
    }
  }

  if (aiData?.onboarding && aiData.onboarding.length > 0) {
    console.log(`${colors.magenta}${colors.bold}✦ SETUP & ONBOARDING GUIDE${colors.reset}`);
    for (const step of aiData.onboarding) {
      console.log(`${colors.bold}${step.id}. ${step.title}${colors.reset}`);
      console.log(`   ${step.description}`);
      if (step.commands && step.commands.length > 0) {
        console.log(`   ${colors.dim}Run:${colors.reset} \x1b[7m ${step.commands.join(' && ')} \x1b[27m`);
      }
      console.log('');
    }
  }

  console.log(`${colors.bold}Architecture structure detected:${colors.reset}`);
  console.log(` - Modules: ${metrics.architecture.nodes.map((n: any) => n.label).join(', ')}`);
  console.log(` - Links/Data Flows: ${metrics.architecture.edges.length} connections\n`);
  
  console.log(`${colors.green}${colors.bold}Done.${colors.reset}`);
}

run();
