import { useState } from "react";
import { ArrowLeft, Terminal, Copy, Check, ChevronRight } from "lucide-react";

interface CliInstallProps {
  onBack: () => void;
}

export default function CliInstall({ onBack }: CliInstallProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const steps = [
    {
      title: "1. global installation",
      desc: "install the CLI package globally using npm, yarn, or pnpm.",
      cmd: "npm install -g codelore"
    },
    {
      title: "2. authenticate (optional)",
      desc: "set your gemini API key to enable codebase Q&A and AI-generated insights.",
      cmd: "codelore config set api_key <your-gemini-key>"
    },
    {
      title: "3. run codebase analysis",
      desc: "navigate to any local project directory and execute the scanner.",
      cmd: "codelore analyze"
    }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      className="min-h-full bg-zinc-950 text-zinc-300 flex flex-col animate-fade-in"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-3 flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => { window.location.hash = "#/"; }}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm cursor-pointer transition-colors"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="font-semibold text-zinc-400 hover:text-zinc-200">codelore</span>
        </button>
        <span className="text-zinc-700 text-xs">/</span>
        <span className="text-zinc-500 text-xs">cli-install</span>
      </div>

      <div className="flex-1 flex items-start justify-center pt-16 px-6 pb-16 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Prompt line */}
          <div className="text-xs text-zinc-700 mb-6">
            <span className="text-zinc-500">$</span> codelore help install
          </div>

          <h1 className="text-xl text-zinc-100 mb-1" style={{ fontWeight: 700 }}>
            cli setup guide
          </h1>
          <p className="text-xs text-zinc-600 mb-8">
            run codelore directly inside your local terminal to scan repositories without uploading source code.
          </p>

          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div key={idx} className="border border-zinc-800 bg-zinc-900/10 p-5 rounded-sm">
                <div className="text-xs font-semibold text-zinc-300 mb-1">{step.title}</div>
                <div className="text-[11px] text-zinc-500 mb-4">{step.desc}</div>
                
                <div className="relative flex items-center bg-zinc-900/50 border border-zinc-800/80 px-4 py-3 text-xs text-zinc-400 font-mono">
                  <span className="text-zinc-600 select-none mr-2">$</span>
                  <code className="text-zinc-300 flex-1 truncate">{step.cmd}</code>
                  <button
                    onClick={() => handleCopy(step.cmd, idx)}
                    className="ml-3 text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}

            {/* Mock CLI Output terminal box */}
            <div className="border border-zinc-800 rounded-sm overflow-hidden bg-zinc-950/60 mt-8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">terminal - codelore analyze</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <pre className="p-4 text-[10px] text-zinc-500 leading-relaxed overflow-x-auto whitespace-pre font-mono">
                {`$ codelore analyze
[info] Scanning current directory: /Users/dev/my-project
[info] Scanning files... Found 84 files
[info] Building structural module graph... Done
[info] Requesting AI diagnostic models...
[success] Analysis Complete!
--------------------------------------------------
Health Score: 96/100
Issues: 2 warnings, 0 errors
Insights:
 - [warn] heavy module bundling found in src/utils
 - [ok] clean React component separation detected

Run "codelore dashboard" to open UI portal locally.`}
              </pre>
            </div>
          </div>

          <div className="mt-8 text-xs text-zinc-700 leading-relaxed">
            {`// global package supports npm, pnpm, yarn, and bun environments.`}
          </div>
        </div>
      </div>
    </div>
  );
}
