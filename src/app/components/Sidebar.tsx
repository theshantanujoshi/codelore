import { Terminal } from "lucide-react";
import { mockRepo } from "../data/mockData";

export type DashboardView =
  | "overview"
  | "architecture"
  | "files"
  | "execution"
  | "dependencies"
  | "onboarding"
  | "chat"
  | "settings";

interface SidebarProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  onBack: () => void;
  repoData: RepoData | null;
}

const navItems: { id: DashboardView; label: string; key: string }[] = [
  { id: "overview",      label: "overview",        key: "o" },
  { id: "architecture",  label: "architecture",    key: "a" },
  { id: "files",         label: "file explorer",   key: "f" },
  { id: "execution",     label: "execution flow",  key: "e" },
  { id: "dependencies",  label: "dependencies",    key: "d" },
  { id: "onboarding",    label: "onboarding",      key: "g" },
  { id: "chat",          label: "ask ai  ✦",       key: "c" },
];

export default function Sidebar({ activeView, onViewChange, onBack, repoData }: SidebarProps) {
  const repo = repoData || mockRepo;
  return (
    <aside
      className="w-52 flex-shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Logo */}
      <div className="px-4 py-3.5 border-b border-zinc-800 flex items-center gap-2">
        <Terminal className="w-3.5 h-3.5 text-zinc-600" />
        <span className="text-xs text-zinc-400" style={{ fontWeight: 500 }}>codelore</span>
      </div>

      {/* Repo info */}
      <div className="px-3 py-3 border-b border-zinc-800">
        <button
          onClick={onBack}
          className="w-full text-left p-2.5 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-all group"
        >
          <div className="text-xs text-zinc-500 mb-1.5 truncate" style={{ fontWeight: 500 }}>
            {repo.fullName}
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-700">
            <span>{repo.branch || 'main'}</span>
            <span>·</span>
            <span>★ {(repo.stars / 1000).toFixed(1)}k</span>
          </div>
          <div className="text-xs text-zinc-800 mt-1 group-hover:text-zinc-600 transition-colors">
            switch →
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2 text-xs transition-colors ${
                isActive
                  ? "bg-zinc-900 text-zinc-100 border-l-2 border-zinc-400"
                  : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-l-2 border-transparent"
              }`}
              style={{ fontWeight: isActive ? 500 : 400 }}
            >
              <span>{isActive ? `› ${item.label}` : `  ${item.label}`}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings + health */}
      <div className="border-t border-zinc-800">
        <button
          onClick={() => onViewChange("settings")}
          className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors ${
            activeView === "settings"
              ? "bg-zinc-900 text-zinc-100 border-l-2 border-zinc-400"
              : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50 border-l-2 border-transparent"
          }`}
          style={{ fontWeight: activeView === "settings" ? 500 : 400 }}
        >
          <span>{activeView === "settings" ? "› settings" : "  settings"}</span>
        </button>

        <div className="px-4 py-3 border-t border-zinc-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-700">health</span>
            <span className="text-zinc-400" style={{ fontWeight: 600 }}>{repo.score}/100</span>
          </div>
          <div className="h-px bg-zinc-800">
            <div className="h-full bg-zinc-500" style={{ width: `${repo.score}%` }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
