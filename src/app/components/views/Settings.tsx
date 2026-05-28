import { useState } from "react";
import { Eye, EyeOff, Check, Save, Trash2, Download, RefreshCw } from "lucide-react";
import { RepoData } from "../../services/api";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-9 h-5 border transition-colors ${enabled ? "border-zinc-500 bg-zinc-800" : "border-zinc-800 bg-zinc-950"}`}
    >
      <span
        className="absolute top-0.5 w-4 h-4 border border-zinc-600 bg-zinc-600 transition-transform"
        style={{ transform: enabled ? "translateX(17px)" : "translateX(1px)" }}
      />
    </button>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4 border-b border-zinc-800 last:border-b-0">
      <div>
        <div className="text-xs text-zinc-300" style={{ fontWeight: 500 }}>{label}</div>
        {desc && <p className="text-xs text-zinc-700 mt-0.5 leading-relaxed max-w-sm">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="text-xs text-zinc-700 uppercase tracking-widest mb-3"># {title}</div>
      <div className="border border-zinc-800">{children}</div>
    </div>
  );
}

interface SettingsProps {
  repoData: RepoData | null;
}

export default function Settings({ repoData }: SettingsProps) {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [includeTests, setIncludeTests] = useState(true);
  const [deepDeps, setDeepDeps] = useState(false);
  const [autoReanalyze, setAutoReanalyze] = useState(false);
  const [analysisNotifs, setAnalysisNotifs] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleExportJSON = () => {
    if (!repoData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(repoData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${repoData.name}-analysis.json`;
    a.click();
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="max-w-xl mx-auto px-8 py-8">

        <Section title="api configuration">
          <div className="px-4 py-4 border-b border-zinc-800">
            <div className="text-xs text-zinc-600 mb-1">gemini api key</div>
            <p className="text-xs text-zinc-800 mb-3">used for codebase analysis and Q&A. configured in server/.env for security.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full pl-3 pr-8 py-2 bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-zinc-400 transition-colors"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs border transition-all ${
                  saved ? "border-zinc-500 text-zinc-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                }`}
                style={{ fontWeight: 500 }}
              >
                {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                {saved ? "saved" : "save"}
              </button>
            </div>
          </div>
          <Row label="github oauth" desc="connect for private repo access. read-only permissions only.">
            <button className="text-xs px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors">
              connect →
            </button>
          </Row>
          <Row label="model" desc="ai model used for analysis.">
            <select className="text-xs px-2 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors">
              <option>nvidia/llama-3.1-nemotron-ultra-253b-v1</option>
              <option>nvidia/llama-3.1-nemotron-70b-instruct</option>
              <option>google/gemini-2.5-flash</option>
            </select>
          </Row>
        </Section>

        <Section title="analysis">
          <Row label="include test files" desc="analyze .spec.ts, .test.ts files in the dependency graph.">
            <Toggle enabled={includeTests} onChange={setIncludeTests} />
          </Row>
          <Row label="deep dependency scan" desc="recurse into node_modules. slower but finds transitive vulns.">
            <Toggle enabled={deepDeps} onChange={setDeepDeps} />
          </Row>
          <Row label="auto re-analyze" desc="re-run when new commits land on main.">
            <Toggle enabled={autoReanalyze} onChange={setAutoReanalyze} />
          </Row>
          <Row label="re-analyze now" desc="force a fresh analysis of the current snapshot.">
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors">
              <RefreshCw className="w-3 h-3" />
              run
            </button>
          </Row>
        </Section>

        <Section title="appearance">
          <Row label="theme" desc="interface color scheme.">
            <div className="flex border border-zinc-700">
              {[
                { v: true, label: "dark" },
                { v: false, label: "light" },
              ].map(({ v, label }) => (
                <button
                  key={label}
                  onClick={() => setDarkMode(v)}
                  className={`px-3 py-1.5 text-xs border-r border-zinc-700 last:border-r-0 transition-colors ${
                    darkMode === v ? "bg-zinc-800 text-zinc-200" : "text-zinc-600 hover:text-zinc-400"
                  }`}
                  style={{ fontWeight: darkMode === v ? 500 : 400 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </Row>
        </Section>

        <Section title="notifications">
          <Row label="analysis complete" desc="notify when repository analysis finishes.">
            <Toggle enabled={analysisNotifs} onChange={setAnalysisNotifs} />
          </Row>
          <Row label="security alerts" desc="notify when new vulnerabilities are detected.">
            <Toggle enabled={securityAlerts} onChange={setSecurityAlerts} />
          </Row>
        </Section>

        <Section title="data">
          <Row label="export analysis" desc="download the full report as JSON or PDF.">
            <div className="flex gap-2">
              <button 
                onClick={handleExportJSON}
                disabled={!repoData}
                className="flex items-center gap-1 text-xs px-3 py-1.5 border border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3 h-3" />
                JSON
              </button>
              <button disabled className="flex items-center gap-1 text-xs px-3 py-1.5 border border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Download className="w-3 h-3" />
                PDF
              </button>
            </div>
          </Row>
          <Row label="delete analysis" desc="permanently delete all cached data and embeddings for this repo.">
            <button className="flex items-center gap-1 text-xs px-3 py-1.5 border border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400 transition-colors">
              <Trash2 className="w-3 h-3" />
              delete
            </button>
          </Row>
        </Section>

        <div className="text-xs text-zinc-800 text-center">codelore cl.ai v1.0.0</div>
      </div>
    </div>
  );
}
