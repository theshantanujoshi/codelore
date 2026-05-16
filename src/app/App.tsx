import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Landing from "./components/Landing";
import RepoImport from "./components/RepoImport";
import Processing from "./components/Processing";
import Dashboard from "./components/Dashboard";
import { RepoData } from "./services/api";

export type View = "landing" | "import" | "processing" | "dashboard";

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const variants = {
    initial: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div
      className="size-full bg-zinc-950"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <AnimatePresence mode="wait">
        {view === "landing" && (
          <motion.div
            key="landing"
            initial="initial"
            animate="enter"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="size-full"
          >
            <Landing onGetStarted={() => setView("import")} />
          </motion.div>
        )}
        {view === "import" && (
          <motion.div
            key="import"
            initial="initial"
            animate="enter"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="size-full"
          >
            <RepoImport
              onAnalyze={(url) => {
                setRepoUrl(url);
                setView("processing");
              }}
              onBack={() => setView("landing")}
            />
          </motion.div>
        )}
        {view === "processing" && (
          <motion.div
            key="processing"
            initial="initial"
            animate="enter"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="size-full"
          >
            <Processing
              repoUrl={repoUrl}
              onComplete={(data) => {
                setRepoData(data);
                setView("dashboard");
              }}
            />
          </motion.div>
        )}
        {view === "dashboard" && (
          <motion.div
            key="dashboard"
            initial="initial"
            animate="enter"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="size-full"
          >
            <Dashboard
              repoData={repoData}
              repoUrl={repoUrl}
              darkMode={darkMode}
              toggleDarkMode={() => setDarkMode(!darkMode)}
              onBack={() => setView("import")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
