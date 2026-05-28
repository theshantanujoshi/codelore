import { useState } from "react";
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react";
import { mockDependencies, Dependency } from "../../data/mockData";
import { RepoData } from "../../services/api";

type SortKey = "name" | "size" | "type" | "vulnerabilities";
type FilterType = "all" | "production" | "development";

function parseSize(size?: string): number {
  if (!size) return 0;
  const m = size.match(/^([\d.]+)\s*(KB|MB)/);
  if (!m) return 0;
  return parseFloat(m[1]) * (m[2] === "MB" ? 1024 : 1);
}

interface DependencyPanelProps {
  repoData: RepoData | null;
}

export default function DependencyPanel({ repoData }: DependencyPanelProps) {
  const dependencies = repoData?.dependencies || mockDependencies;
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = dependencies
    .filter((d) => {
      const desc = d.description || "";
      const ms = d.name.toLowerCase().includes(search.toLowerCase()) || desc.toLowerCase().includes(search.toLowerCase());
      const mt = filterType === "all" || d.type === filterType;
      return ms && mt;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "size") cmp = parseSize(a.size) - parseSize(b.size);
      else if (sortKey === "type") cmp = a.type.localeCompare(b.type);
      else if (sortKey === "vulnerabilities") cmp = a.vulnerabilities - b.vulnerabilities;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const prodCount = dependencies.filter((d) => d.type === "production").length;
  const devCount = dependencies.filter((d) => d.type === "development").length;
  const vulnCount = dependencies.filter((d) => d.vulnerabilities && d.vulnerabilities > 0).length;
  const totalSize = dependencies.filter((d) => d.type === "production").reduce((a, d) => a + parseSize(d.size || "0 KB"), 0);

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronUp className="w-3 h-3 text-zinc-800" />;

  return (
    <div className="flex-1 overflow-y-auto" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="max-w-3xl mx-auto px-8 py-8">

        {/* Stats */}
        <div className="text-xs text-zinc-700 uppercase tracking-widest mb-3"># summary</div>
        <div className="grid grid-cols-4 gap-px border border-zinc-800 mb-8">
          {[
            { l: "production",    v: prodCount },
            { l: "development",   v: devCount },
            { l: "vulnerabilities", v: vulnCount },
            { l: "total prod size", v: `${(totalSize / 1024).toFixed(1)} MB` },
          ].map((s) => (
            <div key={s.l} className="p-4 bg-zinc-950 border-r border-zinc-800 last:border-r-0">
              <div className="text-xs text-zinc-700 mb-2">{s.l}</div>
              <div className={`text-lg ${s.l === "vulnerabilities" && Number(s.v) > 0 ? "text-zinc-300" : "text-zinc-500"}`} style={{ fontWeight: 700 }}>
                {s.v}
              </div>
            </div>
          ))}
        </div>

        {/* Size chart */}
        <div className="border border-zinc-800 p-5 mb-8">
          <div className="text-xs text-zinc-700 mb-4"># largest production packages</div>
          <div className="space-y-2.5">
            {dependencies
              .filter((d) => d.type === "production")
              .sort((a, b) => parseSize(b.size) - parseSize(a.size))
              .slice(0, 5)
              .map((dep) => {
                const sizeVal = parseSize(dep.size || "0 KB");
                const pct = Math.min(100, (sizeVal / (totalSize || 4200)) * 100);
                return (
                  <div key={dep.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-zinc-500">{dep.name}</span>
                      <span className="text-xs text-zinc-600">{dep.size || "unknown"}</span>
                    </div>
                    <div className="h-px bg-zinc-800">
                      <div className="h-full bg-zinc-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="filter packages..."
            className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          <div className="flex border border-zinc-800">
            {(["all", "production", "development"] as FilterType[]).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 text-xs transition-colors border-r border-zinc-800 last:border-r-0 ${
                  filterType === t ? "bg-zinc-800 text-zinc-200" : "text-zinc-600 hover:text-zinc-400"
                }`}
                style={{ fontWeight: filterType === t ? 500 : 400 }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="border border-zinc-800">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 bg-zinc-900/40">
            {[
              { key: "name" as SortKey, label: "package", flex: true },
              { key: "type" as SortKey, label: "type", w: "w-20" },
              { key: "size" as SortKey, label: "size", w: "w-20 text-right" },
              { key: "vulnerabilities" as SortKey, label: "security", w: "w-24 text-right" },
            ].map((col) => (
              <button
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={`flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-300 transition-colors ${col.flex ? "flex-1" : col.w}`}
                style={{ fontWeight: 500 }}
              >
                {col.label} <SortIcon col={col.key} />
              </button>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((dep) => {
            const isExpanded = expanded === dep.name;
            return (
              <div key={dep.name} className="border-b border-zinc-800 last:border-b-0">
                <button
                  onClick={() => setExpanded(isExpanded ? null : dep.name)}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-zinc-900/50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="text-xs text-zinc-300 truncate" style={{ fontWeight: 500 }}>{dep.name}</span>
                    <span className="text-xs text-zinc-700">{dep.version}</span>
                  </div>
                  <div className="w-20">
                    <span className="text-xs text-zinc-600">{dep.type === "production" ? "prod" : "dev"}</span>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-xs text-zinc-600">{dep.size || "unknown"}</span>
                  </div>
                  <div className="w-24 text-right">
                    {(dep.vulnerabilities ?? 0) > 0 ? (
                      <span className="text-xs text-zinc-400">{dep.vulnerabilities} vuln</span>
                    ) : (
                      <span className="text-xs text-zinc-800">clean</span>
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-zinc-800 bg-zinc-900/20 ml-0">
                    <p className="text-xs text-zinc-600 leading-relaxed mb-3">{dep.description || "No description available."}</p>
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-xs text-zinc-700">license: </span>
                        <span className="text-xs text-zinc-500">{dep.license || "unknown"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-700">weekly downloads: </span>
                        <span className="text-xs text-zinc-500">{dep.weekly_downloads || "unknown"}</span>
                      </div>
                      <a
                        href={`https://www.npmjs.com/package/${dep.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto flex items-center gap-1 text-xs text-zinc-700 hover:text-zinc-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                        npm
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-zinc-700">no packages match filter</div>
          )}
        </div>
      </div>
    </div>
  );
}
