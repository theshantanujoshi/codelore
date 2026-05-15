import { mockRepo as placeholderRepo, mockInsights } from "../../data/mockData";
import { RepoData } from "../../services/api";

interface OverviewProps {
  repoData: RepoData | null;
  onNavigate: (view: string) => void;
}

const getMetrics = (repoData: RepoData | null) => {
  if (!repoData) return [
    { label: "files",         value: "0",    sub: "calculating..." },
    { label: "lines of code", value: "0",    sub: "calculating..." },
    { label: "github stars",  value: "0",    sub: "---" },
    { label: "last commit",   value: "---",  sub: "---" },
  ];

  return [
    { label: "files",         value: repoData.files.toString(),    sub: "across source" },
    { label: "lines of code", value: (repoData.lines / 1000).toFixed(1) + "k",  sub: "total codebase" },
    { label: "github stars",  value: "---",  sub: "fetched from api" },
    { label: "last commit",   value: "---",  sub: `branch ${repoData.branch}` },
  ];
};

export default function Overview({ repoData, onNavigate }: OverviewProps) {
  const repo = repoData || placeholderRepo;
  const metrics = getMetrics(repoData);
  
  const langBreakdown = repoData ? Object.entries(repoData.languages).map(([name, count]) => ({
    name,
    percent: Math.round((count / repoData.lines) * 100)
  })).sort((a, b) => b.percent - a.percent).slice(0, 4) : [
    { name: "TypeScript", percent: 0 },
  ];
  const scoreCategories = [
    { label: "Architecture",     score: repo.score },
    { label: "Code Quality",     score: Math.max(0, repo.score - 5) },
    { label: "Security",         score: Math.max(0, repo.score - 10) },
    { label: "Performance",      score: Math.max(0, repo.score + 5) },
    { label: "Maintainability",  score: Math.max(0, repo.score - 2) },
  ];

  const severityPrefix: Record<string, string> = {
    success: "[ok]  ",
    warning: "[warn]",
    error:   "[err] ",
    info:    "[info]",
  };

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <div className="max-w-3xl mx-auto px-8 py-8 space-y-10">

        {/* Repo header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-zinc-600 mb-1">
              <span className="text-zinc-500">$</span> codelore info github.com/{repo.fullName}
            </div>
            <div className="text-sm text-zinc-200 mb-2" style={{ fontWeight: 600 }}>
              {repo.owner}/<span className="text-zinc-100">{repo.name}</span>
            </div>
            <p className="text-xs text-zinc-600 max-w-lg leading-relaxed mb-3">
              {repo.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-700">
              <span>{repo.primaryLanguage}</span>
              <span>·</span>
              <span>★ {(repo.stars / 1000).toFixed(1)}k</span>
              <span>·</span>
              <span>branch: {repo.branch}</span>
              <span>·</span>
              <span className="text-zinc-500">analyzed {repo.lastAnalyzed}</span>
            </div>
          </div>

          <div className="flex-shrink-0 text-right border border-zinc-800 px-5 py-4">
            <div className="text-3xl text-zinc-200 mb-0.5" style={{ fontWeight: 700 }}>
              {repo.score}
            </div>
            <div className="text-xs text-zinc-600">health score</div>
            <div className="text-xs text-zinc-800">/ 100</div>
          </div>
        </div>

        {/* Metrics */}
        <div>
          <div className="text-xs text-zinc-700 uppercase tracking-widest mb-3"># metrics</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-zinc-800">
            {metrics.map((m) => (
              <div key={m.label} className="p-4 bg-zinc-950 border-r border-zinc-800 last:border-r-0">
                <div className="text-xs text-zinc-700 mb-2">{m.label}</div>
                <div className="text-lg text-zinc-200" style={{ fontWeight: 700 }}>{m.value}</div>
                <div className="text-xs text-zinc-700 mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column: scores + languages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="text-xs text-zinc-700 uppercase tracking-widest mb-3"># score breakdown</div>
            <div className="space-y-2.5">
              {scoreCategories.map((c) => (
                <div key={c.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500">{c.label.toLowerCase()}</span>
                    <span className="text-xs text-zinc-400" style={{ fontWeight: 600 }}>{c.score}</span>
                  </div>
                  <div className="h-px bg-zinc-800">
                    <div className="h-full bg-zinc-500 transition-all duration-700" style={{ width: `${c.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-zinc-700 uppercase tracking-widest mb-3"># languages</div>
            <div className="space-y-2.5">
              {langBreakdown.map((l) => (
                <div key={l.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500">{l.name.toLowerCase()}</span>
                    <span className="text-xs text-zinc-400" style={{ fontWeight: 600 }}>{l.percent}%</span>
                  </div>
                  <div className="h-px bg-zinc-800">
                    <div className="h-full bg-zinc-600 transition-all duration-700" style={{ width: `${l.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div>
          <div className="text-xs text-zinc-700 uppercase tracking-widest mb-3">
            # ai insights · {mockInsights.length} findings
          </div>
          <div className="border border-zinc-800 divide-y divide-zinc-800">
            {mockInsights.map((insight) => (
              <div key={insight.id} className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-900 transition-colors">
                <span className={`text-xs flex-shrink-0 mt-0.5 ${
                  insight.severity === "success" ? "text-zinc-400" :
                  insight.severity === "warning" ? "text-zinc-400" :
                  insight.severity === "error"   ? "text-zinc-400" :
                  "text-zinc-600"
                }`}>
                  {severityPrefix[insight.severity]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-0.5">
                    <span className="text-xs text-zinc-300" style={{ fontWeight: 500 }}>
                      {insight.title}
                    </span>
                    <span className="text-xs text-zinc-700">{insight.category}</span>
                    <span className="text-xs text-zinc-700">{insight.effort}-effort</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">{insight.description}</p>
                  {insight.file && (
                    <span className="text-xs text-zinc-700 mt-0.5 block">{insight.file}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick nav */}
        <div>
          <div className="text-xs text-zinc-700 uppercase tracking-widest mb-3"># explore</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px border border-zinc-800">
            {[
              { label: "architecture",    view: "architecture",   desc: "module dependency graph" },
              { label: "file explorer",   view: "files",          desc: "browse 247 files" },
              { label: "execution flow",  view: "execution",      desc: "request lifecycle" },
              { label: "dependencies",    view: "dependencies",   desc: "package audit" },
              { label: "onboarding",      view: "onboarding",     desc: "setup guide" },
              { label: "ask ai",          view: "chat",           desc: "chat with codebase" },
            ].map((item) => (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className="flex items-center justify-between p-3.5 bg-zinc-950 border-r border-b border-zinc-800 hover:bg-zinc-900 transition-colors text-left group"
              >
                <div>
                  <div className="text-xs text-zinc-400" style={{ fontWeight: 500 }}>{item.label}</div>
                  <div className="text-xs text-zinc-700 mt-0.5">{item.desc}</div>
                </div>
                <span className="text-zinc-700 group-hover:text-zinc-500 transition-colors text-xs">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
