import { useState } from "react";
import { ArrowLeft, Terminal, ChevronRight, AlertCircle } from "lucide-react";

interface RepoImportProps {
  onAnalyze: (url: string) => void;
  onBack: () => void;
}

export default function RepoImport({ onAnalyze, onBack }: RepoImportProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"url" | "connect">("url");

  const validateAndSubmit = () => {
    const trimmed = url.trim();
    if (!trimmed) { setError("URL required."); return; }
    if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+/.test(trimmed)) {
      setError("Invalid GitHub URL. Expected: https://github.com/owner/repo");
      return;
    }
    setError(null);
    onAnalyze(trimmed);
  };

  return (
    <div
      className="min-h-full bg-zinc-950 text-zinc-300 flex flex-col"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-3 flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-zinc-600 hover:text-zinc-300 transition-colors"
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
        <span className="text-zinc-500 text-xs">analyze</span>
      </div>

      <div className="flex-1 flex items-start justify-center pt-16 px-6 pb-16">
        <div className="w-full max-w-lg">
          {/* Prompt line */}
          <div className="text-xs text-zinc-700 mb-6">
            <span className="text-zinc-500">$</span> codelore analyze [repo-url]
          </div>

          <h1 className="text-xl text-zinc-100 mb-1" style={{ fontWeight: 700 }}>
            analyze a repository
          </h1>
          <p className="text-xs text-zinc-600 mb-8">
            paste a public github url or connect your account for private repos.
          </p>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800 mb-6">
            {(["url", "connect"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-zinc-300 text-zinc-200"
                    : "border-transparent text-zinc-600 hover:text-zinc-400"
                }`}
                style={{ fontWeight: activeTab === tab ? 500 : 400 }}
              >
                {tab === "url" ? "public url" : "private repo"}
              </button>
            ))}
          </div>

          {activeTab === "url" ? (
            <div className="space-y-4 mb-8">
              <div>
                <div className="text-xs text-zinc-600 mb-2">github repository url</div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(null); }}
                    onKeyDown={(e) => e.key === "Enter" && validateAndSubmit()}
                    placeholder="https://github.com/owner/repo"
                    className="flex-1 px-3 py-2.5 bg-zinc-900 border border-zinc-700 text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-500 text-xs transition-colors"
                  />
                  <button
                    onClick={validateAndSubmit}
                    className="px-4 py-2.5 bg-zinc-100 text-zinc-900 text-xs hover:bg-white transition-colors flex-shrink-0"
                    style={{ fontWeight: 600 }}
                  >
                    run →
                  </button>
                </div>
                {error && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-zinc-700">
                <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-500 transition-colors">
                  <input type="checkbox" className="border-zinc-700 bg-zinc-900 rounded-none" defaultChecked />
                  <span>include readme</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-500 transition-colors">
                  <input type="checkbox" className="border-zinc-700 bg-zinc-900 rounded-none" defaultChecked />
                  <span>analyze tests</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-500 transition-colors">
                  <input type="checkbox" className="border-zinc-700 bg-zinc-900 rounded-none" />
                  <span>deep dep scan</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="p-6 border border-zinc-800 bg-zinc-900 text-center mb-8">
              <div className="text-sm text-zinc-400 mb-1" style={{ fontWeight: 500 }}>connect github</div>
              <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
                Read-only access to private repositories. Your code is never stored.
              </p>
              <button className="px-4 py-2 border border-zinc-600 text-zinc-300 text-xs hover:bg-zinc-800 transition-colors" style={{ fontWeight: 500 }}>
                authenticate with github →
              </button>
            </div>
          )}



          {/* Privacy note */}
          <div className="mt-6 text-xs text-zinc-700 leading-relaxed">
            {`// read-only clone · deleted after 24h · code never leaves analysis env`}
          </div>
        </div>
      </div>
    </div>
  );
}
