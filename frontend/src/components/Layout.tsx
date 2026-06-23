import { type ReactNode, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#1F1F1F] text-slate-900 dark:text-[#CCCCCC] relative overflow-hidden transition-colors duration-300">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/20 dark:bg-indigo-950/10 blur-[120px] transition-colors duration-300" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/20 dark:bg-blue-950/10 blur-[120px] transition-colors duration-300" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-20 w-full border-b border-slate-200/50 dark:border-[#2B2B2B] bg-white/70 dark:bg-[#181818]/70 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-[#0078D4] dark:to-[#026EC1] text-white flex items-center justify-center font-bold text-lg shadow-md">
            N
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-[#FFFFFF] tracking-tight leading-none text-base">Emissor NFSe</h1>
            <p className="text-[10px] text-slate-500 dark:text-[#9D9D9D] font-medium">TOTVS SIGAEIC Integration</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 transition-colors duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-[#CCCCCC]">API Conectada</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200/50 dark:border-[#2B2B2B] bg-white/50 dark:bg-[#1F1F1F]/50 text-slate-700 dark:text-[#CCCCCC] hover:bg-slate-100 dark:hover:bg-[#2B2B2B] hover:text-indigo-600 dark:hover:text-[#0078D4] transition-all duration-200 shadow-sm cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-73px)]">
        {children}
      </main>
    </div>
  );
}
