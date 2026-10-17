import { useState } from "react";
import { ArrowLeft, Terminal, Copy, Check, ChevronRight } from "lucide-react";

interface CliInstallProps {
  onBack: () => void;
}

export default function CliInstall({ onBack }: CliInstallProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const steps = [
    {
      title: "1. open your repository",
      desc: "run the installer in the checkout you want Codelore to review.",
      cmd: "cd ../my-project"
    },
    {
      title: "2. install into a repository",
      desc: "copy the Codelore skills and agent profiles into an existing checkout.",
      cmd: "npx codelore-agent-suite"
    },
    {
      title: "3. ask your coding agent",
      desc: "open that checkout in a supported coding harness and ask for a source-cited review.",
      cmd: "Use the codelore-workflow skill to review this repository."
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
            install Codelore's review skills into a local checkout, then run them in your coding agent.
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

            {/* Local CLI output example */}
            <div className="border border-zinc-800 rounded-sm overflow-hidden bg-zinc-950/60 mt-8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">terminal - CLI install</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <pre className="p-4 text-[10px] text-zinc-500 leading-relaxed overflow-x-auto whitespace-pre font-mono">
                {`$ npx codelore-agent-suite
Installed 113 files into /path/to/my-project (113 selected files)
Open the checkout in your coding agent and ask it to use codelore-workflow.`}
              </pre>
            </div>
          </div>

          <div className="mt-8 text-xs text-zinc-700 leading-relaxed">
            {`// Node.js 20 or later required · npm package: codelore-agent-suite`}
          </div>
        </div>
      </div>
    </div>
  );
}
