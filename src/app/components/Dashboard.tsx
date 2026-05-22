import { useState } from "react";
import { Search, Moon, Sun, Bell, Terminal } from "lucide-react";
import Sidebar, { DashboardView } from "./Sidebar";
import Overview from "./views/Overview";
import ArchitectureView from "./views/ArchitectureView";
import FileExplorer from "./views/FileExplorer";
import ExecutionFlow from "./views/ExecutionFlow";
import DependencyPanel from "./views/DependencyPanel";
import OnboardingGuide from "./views/OnboardingGuide";
import AIChat from "./views/AIChat";
import Settings from "./views/Settings";
import { RepoData } from "../services/api";
import { mockRepo } from "../data/mockData";

interface DashboardProps {
  repoUrl: string;
  repoData: RepoData | null;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onBack: () => void;
}

const getMeta = (activeView: DashboardView, repoData: RepoData | null) => {
  const mockRepo = repoData || { fullName: "unknown/unknown", score: 0, files: 0 };
  const metas: Record<DashboardView, { title: string; sub: string }> = {
    overview:     { title: "overview",        sub: `${mockRepo.fullName} · health ${mockRepo.score}/100` },
    architecture: { title: "architecture",    sub: "module dependency graph" },
    files:        { title: "file explorer",   sub: `${mockRepo.files} files · browse and understand` },
    execution:    { title: "execution flow",  sub: "request lifecycle trace" },
    dependencies: { title: "dependencies",    sub: "audit packages" },
    onboarding:   { title: "onboarding",      sub: "ai-generated setup guide" },
    chat:         { title: "ask ai",          sub: "chat with your codebase" },
    settings:     { title: "settings",        sub: "configure preferences and API keys" },
  };
  return metas[activeView];
};

export default function Dashboard({ repoUrl, repoData, darkMode, toggleDarkMode, onBack }: DashboardProps) {
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const meta = getMeta(activeView, repoData);

  return (
    <div
      className="h-full flex flex-col bg-zinc-950 text-zinc-300"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Topbar */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 h-11 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <Terminal className="w-3.5 h-3.5" />
          <span>codelore</span>
          <span className="text-zinc-800">/</span>
          <span className="text-zinc-500">{repoData?.fullName || mockRepo.fullName}</span>
          <span className="text-zinc-800">/</span>
          <span className="text-zinc-400">{meta.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-700" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search codebase..."
              className="w-48 pl-7 pr-3 py-1 bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <button
            onClick={() => setActiveView("chat")}
            className={`text-xs px-2.5 py-1 border transition-colors ${
              activeView === "chat"
                ? "border-zinc-500 text-zinc-200"
                : "border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
            }`}
            style={{ fontWeight: activeView === "chat" ? 500 : 400 }}
          >
            ask ai ✦
          </button>

          <button
            onClick={toggleDarkMode}
            className="text-zinc-700 hover:text-zinc-400 transition-colors"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Layout */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} onBack={onBack} repoData={repoData} />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* View header */}
          {activeView !== "chat" && (
            <div className="flex-shrink-0 flex items-center gap-3 px-6 py-3 border-b border-zinc-800">
              <span className="text-xs text-zinc-400" style={{ fontWeight: 500 }}>{meta.title}</span>
              <span className="text-zinc-800">·</span>
              <span className="text-xs text-zinc-700">{meta.sub}</span>
            </div>
          )}

          {activeView === "overview"      && <Overview repoData={repoData} onNavigate={(v) => setActiveView(v as DashboardView)} />}
          {activeView === "architecture"  && <ArchitectureView repoData={repoData} />}
          {activeView === "files"         && <FileExplorer repoData={repoData} />}
          {activeView === "execution"     && <ExecutionFlow repoData={repoData} />}
          {activeView === "dependencies"  && <DependencyPanel repoData={repoData} />}
          {activeView === "onboarding"    && <OnboardingGuide repoData={repoData} />}
          {activeView === "chat"          && <AIChat repoData={repoData} />}
          {activeView === "settings"      && <Settings repoData={repoData} />}
        </main>
      </div>
    </div>
  );
}
