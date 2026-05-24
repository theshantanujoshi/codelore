import { ArrowLeft, Terminal, ChevronRight } from "lucide-react";

interface DemoSelectProps {
  onSelect: (url: string) => void;
  onBack: () => void;
}

const DEMO_REPOS = [
  {
    name: "theshantanujoshi/codelore",
    url: "https://github.com/theshantanujoshi/codelore",
    description: "Analyze Codelore's own codebase. Excellent for checking out React component hierarchies, Vite configs, and Tailwind v4 setups.",
    tags: ["TypeScript", "React", "Express", "Tailwind v4"],
    highlight: "Meta Analysis",
    stats: "Full-Stack Project"
  },
  {
    name: "pmndrs/zustand",
    url: "https://github.com/pmndrs/zustand",
    description: "A popular, lightweight state management library for React. Perfect for exploring clean TypeScript files and module exports.",
    tags: ["TypeScript", "React", "Zustand"],
    highlight: "State & Flow Graphs",
    stats: "Library (2.3k+ LOC)"
  },
  {
    name: "expressjs/cors",
    url: "https://github.com/expressjs/cors",
    description: "The standard CORS middleware for Express. A highly focused utility package that showcases fast indexing and simple architecture.",
    tags: ["JavaScript", "Express", "Node.js"],
    highlight: "Fast Analysis",
    stats: "Utility Package"
  }
];

export default function DemoSelect({ onSelect, onBack }: DemoSelectProps) {
  return (
    <div
      className="min-h-full bg-zinc-950 text-zinc-300 flex flex-col"
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
        <span className="text-zinc-500 text-xs">demos</span>
      </div>

      <div className="flex-1 flex items-start justify-center pt-16 px-6 pb-16 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Prompt line */}
          <div className="text-xs text-zinc-700 mb-6">
            <span className="text-zinc-500">$</span> codelore select-demo
          </div>

          <h1 className="text-xl text-zinc-100 mb-1" style={{ fontWeight: 700 }}>
            select a demo repository
          </h1>
          <p className="text-xs text-zinc-600 mb-8">
            choose a curated repository to explore and test codelore's analysis features instantly.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {DEMO_REPOS.map((demo) => (
              <button
                key={demo.url}
                onClick={() => onSelect(demo.url)}
                className="group relative flex flex-col md:flex-row md:items-center justify-between p-6 bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60 active:bg-zinc-900 transition-all text-left rounded-sm cursor-pointer overflow-hidden"
              >
                {/* Visual side accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-800 group-hover:bg-zinc-400 transition-colors" />

                <div className="flex-1 pr-6">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-50 transition-colors">
                      {demo.name}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-sm">
                      {demo.stats}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-medium bg-zinc-100/10 text-zinc-300 rounded-sm ml-auto md:ml-0">
                      {demo.highlight}
                    </span>
                  </div>
                  
                  <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                    {demo.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {demo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-zinc-600 font-mono"
                      >
                        #{tag.toLowerCase()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end mt-4 md:mt-0">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 group-hover:text-zinc-200 transition-colors font-semibold">
                    <span>analyze</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 text-xs text-zinc-700 leading-relaxed">
            {`// click any demo repository above to run our automated analysis pipeline`}
          </div>
        </div>
      </div>
    </div>
  );
}
