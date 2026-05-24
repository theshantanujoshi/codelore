import { ArrowLeft, Terminal, ChevronRight, Layers, GitBranch } from "lucide-react";

interface GetStartedSelectProps {
  onSelectOption: (option: "demo" | "custom") => void;
  onBack: () => void;
}

export default function GetStartedSelect({ onSelectOption, onBack }: GetStartedSelectProps) {
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
        <span className="text-zinc-500 text-xs">start</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Prompt line */}
          <div className="text-xs text-zinc-700 mb-6">
            <span className="text-zinc-500">$</span> codelore initialize --interactive
          </div>

          <h1 className="text-xl text-zinc-100 mb-1" style={{ fontWeight: 700 }}>
            how would you like to start?
          </h1>
          <p className="text-xs text-zinc-600 mb-10">
            select an option below to begin exploring and analyzing codebases.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Test Repo */}
            <button
              onClick={() => onSelectOption("demo")}
              className="group relative flex flex-col justify-between p-6 bg-zinc-900/20 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 active:bg-zinc-900 transition-all text-left rounded-sm cursor-pointer min-h-[180px] overflow-hidden"
            >
              {/* Visual corner highlight */}
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div>
                <div className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:border-zinc-700 transition-colors">
                  <Layers className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-50 transition-colors mb-2">
                  use a test repo
                </h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">
                  Explore codelore's visualization and insight capabilities using pre-curated open-source projects.
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-[9px] text-zinc-600 font-semibold group-hover:text-zinc-400 transition-colors">
                  // instant setup
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>

            {/* Card 2: Custom Repo */}
            <button
              onClick={() => onSelectOption("custom")}
              className="group relative flex flex-col justify-between p-6 bg-zinc-900/20 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 active:bg-zinc-900 transition-all text-left rounded-sm cursor-pointer min-h-[180px] overflow-hidden"
            >
              {/* Visual corner highlight */}
              <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div>
                <div className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:border-zinc-700 transition-colors">
                  <GitBranch className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-50 transition-colors mb-2">
                  analyze your repo
                </h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">
                  Analyze your own repository by providing a public GitHub link or authenticating private access.
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-[9px] text-zinc-600 font-semibold group-hover:text-zinc-400 transition-colors">
                  // clone & analyze
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          </div>

          <div className="mt-8 text-xs text-zinc-700 leading-relaxed">
            {`// code is analyzed in memory and deleted immediately after analysis completes.`}
          </div>
        </div>
      </div>
    </div>
  );
}
