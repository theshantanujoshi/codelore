import { useState } from "react";
import { Check, Circle, Copy, ChevronDown, ChevronRight } from "lucide-react";
import { mockOnboardingSteps } from "../../data/mockData";

function CommandBlock({ commands }: { commands: string[] }) {
  const [copied, setCopied] = useState(false);
  if (commands.length === 0) return null;
  return (
    <div className="mt-3 border border-zinc-800">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 bg-zinc-900/60">
        <span className="text-[15px] text-zinc-400">terminal</span>
        <button
          onClick={() => { navigator.clipboard.writeText(commands.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-[15px] text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <div className="p-3 space-y-1">
        {commands.map((cmd, i) => (
          <div key={i} className={`text-[15px] ${cmd.startsWith("#") ? "text-zinc-400" : "text-zinc-100"}`}>
            {!cmd.startsWith("#") && <span className="text-zinc-300 mr-1.5">$</span>}
            {cmd}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingGuide() {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1, 2, 3]));
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set([1, 2]));

  const toggleExpand = (id: number) => {
    setExpandedSteps((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleComplete = (id: number) => {
    setCompletedSteps((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const progress = Math.round((completedSteps.size / mockOnboardingSteps.length) * 100);

  return (
    <div className="flex-1 overflow-y-auto" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="max-w-xl mx-auto px-8 py-8">

        {/* Header */}
        <div className="text-[15px] text-zinc-400 mb-1">{`// ai-generated · tailored to antigravity/codelore`}</div>
        <div className="text-[15px] text-zinc-300 mb-8">
          step-by-step setup instructions. not a generic README.
        </div>

        {/* Progress */}
        <div className="border border-zinc-800 px-4 py-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[15px] text-zinc-300">setup progress</span>
            <span className="text-[15px] text-zinc-200">{completedSteps.size}/{mockOnboardingSteps.length} steps</span>
          </div>
          <div className="h-px bg-zinc-800 mb-1.5">
            <div className="h-full bg-zinc-400 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between">
            <span className="text-[15px] text-zinc-400">{progress}%</span>
            {progress === 100 && <span className="text-[15px] text-zinc-100">ready to run</span>}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {mockOnboardingSteps.map((step) => {
            const isExpanded = expandedSteps.has(step.id);
            const isCompleted = completedSteps.has(step.id);

            return (
              <div
                key={step.id}
                className={`border transition-colors ${isCompleted ? "border-zinc-700" : "border-zinc-800"}`}
              >
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <button
                    onClick={() => toggleComplete(step.id)}
                    className="flex-shrink-0 mt-0.5 hover:opacity-80 transition-opacity"
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-zinc-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] text-zinc-400">{String(step.id).padStart(2, "0")}</span>
                      <h3
                        className={`text-[15px] ${isCompleted ? "text-zinc-300 line-through" : "text-white"}`}
                        style={{ fontWeight: 500 }}
                      >
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-[15px] text-zinc-400 mt-0.5 leading-relaxed">{step.description}</p>
                  </div>

                  <button
                    onClick={() => toggleExpand(step.id)}
                    className="flex-shrink-0 text-zinc-400 hover:text-zinc-100 transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-zinc-800 pt-3 ml-7">
                    <CommandBlock commands={step.commands} />
                    {step.notes.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {step.notes.map((note, i) => {
                          const isEnvVar = note.includes("—") && note.split("—")[0].trim().match(/^[A-Z_]+$/);
                          if (isEnvVar) {
                            const [varName, ...rest] = note.split("—");
                            return (
                              <div key={i} className="flex items-start gap-2 text-[15px] border border-zinc-800 px-3 py-2">
                                <span className="text-zinc-100 flex-shrink-0" style={{ fontWeight: 500 }}>{varName.trim()}</span>
                                <span className="text-zinc-400 leading-relaxed">— {rest.join("—")}</span>
                              </div>
                            );
                          }
                          return (
                             <div key={i} className="flex items-start gap-2 text-[15px] text-zinc-400">
                              <span className="text-zinc-500 flex-shrink-0 mt-0.5">→</span>
                              <span className="leading-relaxed">{note}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tip */}
        <div className="mt-8 border border-zinc-800 px-4 py-4">
          <div className="text-[15px] text-zinc-400 mb-2">{`// pro tip`}</div>
          <p className="text-[15px] text-zinc-300 leading-relaxed">
            after running <code className="px-1 py-0.5 border border-zinc-800 bg-zinc-900">npm run dev:all</code>, the backend will act as a proxy. you can trace the ai analysis requests in the server console, not just the browser network tab.
          </p>
        </div>
      </div>
    </div>
  );
}
