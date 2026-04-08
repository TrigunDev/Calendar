import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className={cn(
        "fixed top-3 right-3 sm:top-4 sm:right-4 z-50 p-2 sm:p-2.5 rounded-full glass glass-highlight",
        "hover:ring-1 hover:ring-primary/40 transition-all duration-300",
        "group cursor-pointer"
      )}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        <Sun className="w-4 h-4 text-foreground transition-transform group-hover:rotate-45 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-foreground transition-transform group-hover:-rotate-12 duration-300" />
      )}
    </button>
  );
}
