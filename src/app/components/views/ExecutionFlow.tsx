import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { mockExecutionFlow, ExecutionStep } from "../../data/mockData";
import { RepoData } from "../../services/api";

const stepTypeLabel: Record<string, string> = {
  route:     "route",
  component: "render",
  fetch:     "fetch",
  action:    "action",
  cache:     "cache",
  render:    "render",
};

const scenarios = [
  { id: "analyze", label: "repo analysis", desc: "POST /api/analyze → Git clone → Analyzer scan → Metrics → Client sync" },
  { id: "chat",    label: "ai chat query", desc: "POST /api/chat → context payload → gemini-3-flash → formatting → stream" },
];

interface StepCardProps {
  step: ExecutionStep;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  totalSteps: number;
}

function StepCard({ step, index, isExpanded, onToggle, totalSteps }: StepCardProps) {
  return (
    <div className="relative">
      {index < totalSteps - 1 && (
        <div className="absolute left-4 top-full w-px bg-zinc-800 z-0" style={{ height: 8 }} />
      )}
      <div className="border border-zinc-800 hover:border-zinc-700 transition-colors bg-zinc-950/50">
        <button
          onClick={onToggle}
          className="w-full flex items-start gap-4 px-4 py-3.5 text-left"
        >
          <div className="flex-shrink-0 flex items-center gap-3 mt-0.5">
            <span className="text-[10px] text-zinc-700 w-4">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-[10px] text-zinc-600 w-10 uppercase tracking-tighter">{stepTypeLabel[step.type]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-zinc-300 mb-0.5 uppercase tracking-wide" style={{ fontWeight: 600 }}>
              {step.title}
            </div>
            <div className="text-[11px] text-zinc-500 leading-relaxed">{step.description}</div>
            <div className="text-[10px] text-zinc-700 mt-1 font-mono">{step.file}</div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 text-[10px]">
            {step.duration && <span className="text-zinc-600 font-mono">{step.duration}</span>}
            {isExpanded
              ? <ChevronUp className="w-3 h-3 text-zinc-600" />
              : <ChevronDown className="w-3 h-3 text-zinc-600" />
            }
          </div>
        </button>
        {isExpanded && step.details && (
          <div className="px-4 pb-4 border-t border-zinc-800/50 pt-3 ml-14">
            <div className="space-y-1.5">
              {step.details.map((d, i) => (
                <div key={i} className="text-[10px] text-zinc-600 flex items-start gap-2">
                  <span className="text-zinc-800">›</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ExecutionFlowProps {
  repoData: RepoData | null;
}

export default function ExecutionFlow({ repoData }: ExecutionFlowProps) {
  const executionFlow = repoData?.executionFlow || mockExecutionFlow;
  const [activeScenario, setActiveScenario] = useState("analyze");
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(["1", "2"]));

  const toggleStep = (id: string) => {
    setExpandedSteps((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const totalDuration = "3.2s";

  return (
    <div className="flex-1 overflow-y-auto" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="max-w-2xl mx-auto px-8 py-8">

        {/* Scenario tabs */}
        <div className="text-[10px] text-zinc-700 mb-3 uppercase tracking-widest"># select a flow to trace</div>
        <div className="flex border-b border-zinc-800 mb-6 gap-0">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s.id)}
              className={`px-6 py-2 text-[10px] uppercase tracking-widest transition-colors border-b-2 -mb-px ${
                activeScenario === s.id
                  ? "border-zinc-400 text-zinc-200"
                  : "border-transparent text-zinc-600 hover:text-zinc-400"
              }`}
              style={{ fontWeight: activeScenario === s.id ? 600 : 400 }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Scenario desc */}
        <div className="border border-zinc-800 bg-zinc-900/20 px-4 py-3 mb-6">
          <div className="text-[11px] text-zinc-500 italic">
            <span className="text-zinc-700 not-italic mr-2">›</span> 
            {scenarios.find((s) => s.id === activeScenario)?.desc}
          </div>
          <div className="text-[10px] text-zinc-600 mt-1 flex gap-4 uppercase tracking-tighter">
            <span>total: {totalDuration}</span>
            <span>·</span>
            <span>1 git instance</span>
            <span>·</span>
            <span>{executionFlow.length} modules</span>
          </div>
        </div>

        {/* Timeline bar */}
        <div className="border border-zinc-800 px-4 py-3 mb-6">
          <div className="text-xs text-zinc-700 mb-2">timeline</div>
          <div className="flex h-5 gap-px">
            {executionFlow.map((step, i) => {
              const w = 100 / executionFlow.length;
              const brightness = 60 - (i * 5);
              return (
                <div
                  key={step.id}
                  style={{ width: `${w}%`, backgroundColor: `rgb(${brightness},${brightness},${brightness})` }}
                  className="cursor-pointer hover:opacity-80 transition-opacity relative group"
                  onClick={() => toggleStep(step.id)}
                  title={step.title}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-zinc-800 uppercase">0ms</span>
            <span className="text-[10px] text-zinc-800 uppercase">{totalDuration}</span>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {executionFlow.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              index={i}
              totalSteps={executionFlow.length}
              isExpanded={expandedSteps.has(step.id)}
              onToggle={() => toggleStep(step.id)}
            />
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 border border-zinc-800 px-4 py-4">
          <div className="text-[10px] text-zinc-700 mb-3 uppercase tracking-widest"># summary</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { v: executionFlow.length, l: "execution modules" },
              { v: totalDuration, l: "total latency" },
              { v: "1",      l: "git instance" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-sm text-zinc-300" style={{ fontWeight: 700 }}>{s.v}</div>
                <div className="text-[10px] text-zinc-700 mt-0.5 uppercase tracking-tighter">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
