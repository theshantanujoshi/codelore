import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Landing from "./components/Landing";
import RepoImport from "./components/RepoImport";
import DemoSelect from "./components/DemoSelect";
import GetStartedSelect from "./components/GetStartedSelect";
import CliInstall from "./components/CliInstall";
import Processing from "./components/Processing";
import Dashboard from "./components/Dashboard";
import { RepoData } from "./services/api";

export type View = "landing" | "get-started" | "import" | "demo" | "cli-install" | "processing" | "dashboard";

const viewToHash: Record<View, string> = {
  "landing": "#/",
  "get-started": "#/start",
  "import": "#/import",
  "demo": "#/demo",
  "cli-install": "#/cli-install",
  "processing": "#/processing",
  "dashboard": "#/dashboard"
};

const hashToView: Record<string, View> = {
  "": "landing",
  "#/": "landing",
  "#/start": "get-started",
  "#/import": "import",
  "#/demo": "demo",
  "#/cli-install": "cli-install",
  "#/processing": "processing",
  "#/dashboard": "dashboard"
};

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  // Set view from hash on mount and on popstate/hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash || "#/";
      const newView = hashToView[currentHash] || "landing";
      setView(newView);
    };

    window.addEventListener("hashchange", handleHashChange);
    // Initial sync
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Listen to side mouse buttons specifically to make absolutely sure they perform history navigation
  useEffect(() => {
    const handleMouseSideButtons = (e: MouseEvent) => {
      if (e.button === 3) {
        e.preventDefault();
        window.history.back();
      } else if (e.button === 4) {
        e.preventDefault();
        window.history.forward();
      }
    };
    window.addEventListener("mousedown", handleMouseSideButtons);
    return () => {
      window.removeEventListener("mousedown", handleMouseSideButtons);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const navigateTo = (newView: View) => {
    window.location.hash = viewToHash[newView];
  };

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
            <Landing onGetStarted={() => navigateTo("get-started")} />
          </motion.div>
        )}
        {view === "get-started" && (
          <motion.div
            key="get-started"
            initial="initial"
            animate="enter"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="size-full"
          >
            <GetStartedSelect
              onSelectOption={(option) => {
                if (option === "demo") {
                  navigateTo("demo");
                } else if (option === "custom") {
                  navigateTo("import");
                } else if (option === "cli") {
                  navigateTo("cli-install");
                }
              }}
              onBack={() => navigateTo("landing")}
            />
          </motion.div>
        )}
        {view === "demo" && (
          <motion.div
            key="demo"
            initial="initial"
            animate="enter"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="size-full"
          >
            <DemoSelect
              onSelect={(url) => {
                setRepoUrl(url);
                navigateTo("processing");
              }}
              onBack={() => navigateTo("get-started")}
            />
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
                navigateTo("processing");
              }}
              onBack={() => navigateTo("get-started")}
            />
          </motion.div>
        )}
        {view === "cli-install" && (
          <motion.div
            key="cli-install"
            initial="initial"
            animate="enter"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="size-full"
          >
            <CliInstall onBack={() => navigateTo("get-started")} />
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
                navigateTo("dashboard");
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
              onBack={() => navigateTo("get-started")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
