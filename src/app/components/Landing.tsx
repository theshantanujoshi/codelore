import { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight, Terminal } from "lucide-react";

interface LandingProps {
  onGetStarted: () => void;
}

const features = [
  { prefix: "01", title: "architecture map", description: "visualize module structure, layer separation, and component boundaries as a static dependency graph." },
  { prefix: "02", title: "execution flow", description: "step through a request from entry point to data layer and back. understand exactly how data moves." },
  { prefix: "03", title: "file explorer", description: "see what every file imports and exports, what calls it, and what it depends on — without reading source." },
  { prefix: "04", title: "dependency audit", description: "surface vulnerabilities, bundle sizes, license types, and outdated packages from package.json." },
  { prefix: "05", title: "onboarding guide", description: "ai-generated setup instructions tailored to this specific repo. not a generic readme." },
  { prefix: "06", title: "ask anything", description: "chat with the codebase. ask where auth lives, how to add a feature, or what a file does." },
];



export default function Landing({ onGetStarted }: LandingProps) {
  const [hoveredRepo, setHoveredRepo] = useState<string | null>(null);

  return (
    <div
      className="min-h-full bg-zinc-950 text-zinc-300 overflow-y-auto"
      style={{ fontFamily: "'JetBrains Mono', monospace", scrollBehavior: "smooth" }}
    >
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 h-12 flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => document.querySelector(".overflow-y-auto")?.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 text-zinc-100 text-sm hover:text-white transition-colors"
        >
          <Terminal className="w-4 h-4 text-zinc-500" />
          <span style={{ fontWeight: 500 }}>codelore</span>
          <span className="text-zinc-700">~</span>
          <span className="text-zinc-600 text-xs">cl.ai</span>
        </motion.button>
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            features
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            how it works
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="text-xs px-3 py-1.5 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
            style={{ fontWeight: 500 }}
          >
            get started →
          </motion.button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
        <div className="mb-3 text-xs text-zinc-600">
          <span className="text-zinc-500">$</span> codelore analyze github.com/your-org/your-repo
        </div>

        <h1
          className="text-4xl md:text-5xl text-zinc-100 mb-6 leading-tight"
          style={{ fontWeight: 700 }}
        >
          understand any codebase
          <br />
          in minutes, not days.
        </h1>

        <p className="text-zinc-500 max-w-lg mb-10 leading-relaxed text-sm">
          paste a github url. get an architecture map, execution trace, dependency
          audit, and ai-generated onboarding guide — instantly.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 text-zinc-900 text-sm hover:bg-white transition-colors cursor-pointer"
            style={{ fontWeight: 600 }}
          >
            get started
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 pt-8 border-t border-zinc-800 flex flex-wrap gap-10">
          {[
            { v: "10k+", l: "repos analyzed" },
            { v: "~2min", l: "analysis time" },
            { v: "98%", l: "architecture accuracy" },
            { v: "GPT-4o", l: "powered by" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-lg text-zinc-100" style={{ fontWeight: 700 }}>{s.v}</div>
              <div className="text-xs text-zinc-600 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </section>



      {/* Features */}
      <section id="features" className="px-6 pb-20 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto pt-16">
          <div className="text-xs text-zinc-700 uppercase tracking-widest mb-2">
            # features
          </div>
          <h2 className="text-2xl text-zinc-100 mb-10" style={{ fontWeight: 700 }}>
            six views. one codebase understood.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-zinc-800">
            {features.map((f) => (
              <div
                key={f.prefix}
                className="p-5 border-r border-b border-zinc-800 bg-zinc-950 hover:bg-zinc-900 transition-colors"
              >
                <div className="text-xs text-zinc-700 mb-3" style={{ fontWeight: 500 }}>
                  {f.prefix}
                </div>
                <h3 className="text-sm text-zinc-200 mb-2" style={{ fontWeight: 600 }}>
                  {f.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 pb-20 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto pt-16">
          <div className="text-xs text-zinc-700 uppercase tracking-widest mb-2">
            # how it works
          </div>
          <h2 className="text-2xl text-zinc-100 mb-8" style={{ fontWeight: 700 }}>
            three steps.
          </h2>
          <div className="space-y-px border border-zinc-800">
            {[
              { step: "01", title: "paste a github url", desc: "public repos work instantly. private repos connect via github oauth. we clone a read-only snapshot — your code is never stored." },
              { step: "02", title: "ai indexes the codebase", desc: "we parse every file, build a dependency graph, trace execution paths, and run the codebase through our analysis pipeline. 30–120 seconds." },
              { step: "03", title: "explore the dashboard", desc: "navigate architecture diagrams, chat with the ai, read the onboarding guide, and audit dependencies — all in one terminal-style interface." },
            ].map((s) => (
              <div key={s.step} className="flex gap-6 p-6 bg-zinc-950 border-b border-zinc-800 hover:bg-zinc-900 transition-colors">
                <div className="text-xs text-zinc-700 flex-shrink-0 w-6">{s.step}</div>
                <div>
                  <h3 className="text-sm text-zinc-200 mb-1" style={{ fontWeight: 600 }}>{s.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="px-6 pb-24 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto pt-16 text-center">
          <div className="text-xs text-zinc-700 mb-6">
            <span className="text-zinc-500">$</span> codelore analyze --help
          </div>
          <h2 className="text-2xl text-zinc-100 mb-3" style={{ fontWeight: 700 }}>
            ready to understand your codebase?
          </h2>
          <p className="text-zinc-500 mb-8 text-sm">
            no sign-up required. paste a url, get results.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 text-zinc-900 text-sm hover:bg-white transition-colors cursor-pointer"
            style={{ fontWeight: 600 }}
          >
            get started
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-8 mt-10 text-xs text-zinc-700">
            <span>// we never store your code</span>
            <span>// results in under 2 minutes</span>
            <span>// free for public repos</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-zinc-700">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>codelore ai</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://theshantanujoshi.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors"
            >
              shantanu joshi
            </a>
            <span>·</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
