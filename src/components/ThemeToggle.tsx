import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "light") setLight(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    window.localStorage.setItem("theme", light ? "light" : "dark");
  }, [light]);

  return (
    <button
      type="button"
      onClick={() => setLight((v) => !v)}
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors duration-200 hover:border-accent/50 hover:text-foreground"
    >
      {light ? <Moon className="size-5" /> : <Sun className="size-5" />}
    </button>
  );
}
