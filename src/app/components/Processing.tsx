import { useState, useEffect } from "react";
import { Check, Terminal } from "lucide-react";
import { analyzeRepo, RepoData } from "../services/api";

interface ProcessingProps {
  repoUrl: string;
  onComplete: (data: RepoData) => void;
}

const steps = [
  { id: "clone",   label: "cloning repository",          detail: "fetching source tree and git history",                     duration: 1200 },
  { id: "parse",   label: "parsing files",               detail: "building AST and counting lines",                          duration: 1800 },
  { id: "deps",    label: "resolving dependencies",      detail: "mapping package.json and imports",                         duration: 1400 },
  { id: "ai",      label: "generating AI insights",       detail: "synthesizing explanations and Q&A",                       duration: 2200 },
];

export default function Processing({ repoUrl, onComplete }: ProcessingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [globalProgress, setGlobalProgress] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [dots, setDots] = useState(".");
  const [error, setError] = useState<string | null>(null);

  const repoName = repoUrl.replace("https://github.com/", "");

  useEffect(() => {
    const interval = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 400);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const logs = [
      `$ git clone --depth=1 ${repoUrl}`,
      `cloning into '${repoName.split("/")[1]}'...`,
    ];
    setLogLines(logs);

    const runAnalysis = async () => {
      try {
        setError(null);
        setCurrentStep(0);
        setGlobalProgress(10);
        
        const data = await analyzeRepo(repoUrl);
        
        setCompletedSteps(new Set([0, 1, 2]));
        setCurrentStep(3);
        setGlobalProgress(100);
        setLogLines(prev => [...prev, `remote: enumerating objects: ${data.files}, done.`, `analysis complete: ${data.lines} lines found.`]);
        
        setTimeout(() => onComplete(data), 1000);
      } catch (err: any) {
        console.error("Analysis error:", err);
        setError(err.message);
        setLogLines(prev => [...prev, `[error] ${err.message}`]);
        if (err.stack) console.error(err.stack);
      }
    };

    runAnalysis();
  }, [repoUrl, repoName]);

  return (
    <div
      className="min-h-full bg-zinc-950 text-zinc-300 flex flex-col"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-3 flex items-center gap-2 text-zinc-600 text-xs">
        <Terminal className="w-3.5 h-3.5" />
        <span>codelore</span>
        <span className="text-zinc-800">/</span>
        <span>analyze</span>
        <span className="text-zinc-800">/</span>
        <span className="text-zinc-500">{repoName}</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          {/* Repo */}
          <div className="text-xs text-zinc-600 mb-1">
            <span className="text-zinc-500">$</span> codelore analyze github.com/{repoName}
          </div>
          {error ? (
            <div className="text-xs text-red-500 mb-8 font-bold">analysis failed: {error}</div>
          ) : (
            <div className="text-xs text-zinc-700 mb-8">analyzing codebase{dots}</div>
          )}

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-zinc-600">{Math.round(globalProgress)}%</span>
              {globalProgress === 100 && (
                <span className="text-xs text-zinc-400">done</span>
              )}
            </div>
            <div className={`h-px ${error ? 'bg-red-900' : 'bg-zinc-800'}`}>
              <div
                className={`h-full transition-all duration-200 ${error ? 'bg-red-500' : 'bg-zinc-400'}`}
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-1 mb-8">
            {steps.map((step, i) => {
              const isDone = completedSteps.has(i);
              const isActive = currentStep === i && !isDone && !error;
              const isPending = !isDone && !isActive;
              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 py-1.5 text-xs transition-opacity ${
                    isPending ? "opacity-25" : isDone ? "opacity-50" : "opacity-100"
                  }`}
                >
                  <div className="flex-shrink-0 w-4 flex items-center justify-center mt-0.5">
                    {isDone ? (
                      <Check className="w-3 h-3 text-zinc-400" />
                    ) : isActive ? (
                      <span className="text-zinc-300">›</span>
                    ) : error && currentStep === i ? (
                      <span className="text-red-500">×</span>
                    ) : (
                      <span className="text-zinc-700">·</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={isDone ? "text-zinc-600" : isActive ? "text-zinc-200" : error && currentStep === i ? "text-red-400" : "text-zinc-700"}>
                      {step.label}
                    </span>
                    {isActive && (
                      <div className="text-zinc-600 mt-0.5">{step.detail}</div>
                    )}
                  </div>
                  {isDone && <span className="text-zinc-700 flex-shrink-0">ok</span>}
                  {error && currentStep === i && <span className="text-red-900 flex-shrink-0">error</span>}
                </div>
              );
            })}
          </div>

          {/* Terminal log */}
          <div className={`border ${error ? 'border-red-900' : 'border-zinc-800'} bg-zinc-900`}>
            <div className={`flex items-center gap-2 px-3 py-2 border-b ${error ? 'border-red-900' : 'border-zinc-800'} text-xs text-zinc-700`}>
              <span>analysis.log</span>
            </div>
            <div className="p-3 space-y-1 min-h-[100px] max-h-[140px] overflow-y-auto">
              {logLines.map((line, i) => (
                <div
                  key={i}
                  className={`text-xs ${line.startsWith("$") ? "text-zinc-400" : line.startsWith("[error]") ? "text-red-500" : "text-zinc-600"}`}
                >
                  {line}
                </div>
              ))}
              {!error && globalProgress < 100 && (
                <div className="text-xs text-zinc-700">
                  › {steps[currentStep]?.detail}{dots}
                </div>
              )}
              {globalProgress === 100 && (
                <div className="text-xs text-zinc-400">analysis complete. loading dashboard...</div>
              )}
            </div>
          </div>

          {error && (
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
            >
              try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
