import { useEffect, useState } from "react";
import { Icon } from "./brand";

export type ThemeMode = "day" | "night" | "auto";

const STORAGE_KEY = "rfm-theme";

function readMode(): ThemeMode {
  if (typeof window === "undefined") return "auto";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "day" || saved === "night" ? saved : "auto";
}

function applyMode(mode: ThemeMode) {
  document.documentElement.dataset["theme"] = mode;
  document.documentElement.style.colorScheme = mode === "day" ? "light" : mode === "night" ? "dark" : "light dark";
}

export function ThemeControl({ compact = false }: { compact?: boolean | undefined }) {
  const [mode, setMode] = useState<ThemeMode>("auto");

  useEffect(() => {
    const saved = readMode();
    setMode(saved);
    applyMode(saved);
  }, []);

  const choose = (next: ThemeMode) => {
    setMode(next);
    applyMode(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <fieldset>
      {!compact && <legend className="sr-only">Display mode</legend>}
      <div className="inline-grid grid-cols-3 rounded-full border border-line-strong bg-sunk p-1" aria-label="Display mode">
        {(["day", "night", "auto"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => choose(value)}
            className={`flex min-h-10 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-semibold ${
              mode === value ? "bg-paper text-ink" : "text-ink-muted"
            }`}
          >
            {value === "day" && <Icon name="icon-day" size={22} className="theme-icon" />}
            {value === "night" && <Icon name="icon-night" size={22} className="theme-icon" />}
            <span>{value === "day" ? "Day" : value === "night" ? "Night" : "Auto"}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}