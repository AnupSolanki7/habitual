"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse a 24-hour "HH:MM" string into 12-hour parts */
function parseTime(value: string): { hour: number; minute: number; ampm: "AM" | "PM" } {
  if (!value) return { hour: 8, minute: 0, ampm: "AM" };
  const [h, m] = value.split(":").map(Number);
  const ampm: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { hour, minute: m ?? 0, ampm };
}

/** Convert 12-hour parts back to a 24-hour "HH:MM" string */
function toValue(hour: number, minute: number, ampm: "AM" | "PM"): string {
  let h = hour;
  if (ampm === "AM" && hour === 12) h = 0;
  else if (ampm === "PM" && hour !== 12) h = hour + 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Format a 24-hour "HH:MM" value for display (e.g. "8:30 AM") */
function displayValue(value: string): string {
  if (!value) return "";
  const { hour, minute, ampm } = parseTime(value);
  return `${hour}:${String(minute).padStart(2, "0")} ${ampm}`;
}

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface ReminderTimePickerProps {
  value: string; // "HH:MM" (24-hour) or ""
  onChange: (value: string) => void;
}

export function ReminderTimePicker({ value, onChange }: ReminderTimePickerProps) {
  const initial = parseTime(value || "08:00");
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [ampm, setAmpm] = useState<"AM" | "PM">(initial.ampm);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync local picker state when the external value changes
  useEffect(() => {
    if (value) {
      const p = parseTime(value);
      setHour(p.hour);
      setMinute(p.minute);
      setAmpm(p.ampm);
    }
  }, [value]);

  // Close picker on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function confirm() {
    onChange(toValue(hour, minute, ampm));
    setOpen(false);
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setOpen(false);
  }

  const hasValue = !!value;
  const pendingLabel = `${hour}:${String(minute).padStart(2, "0")} ${ampm}`;

  return (
    <div ref={wrapperRef} className="relative">

      {/* ── Trigger button ────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full h-12 flex items-center gap-3 rounded-2xl border px-4 text-left transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
          hasValue
            ? "bg-blue-50 dark:bg-blue-950/20 border-blue-300/60 dark:border-blue-700/40"
            : "bg-background border-border/70 hover:border-border/90",
          open && "ring-2 ring-blue-500/20 border-blue-400/60"
        )}
      >
        <Clock
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            hasValue ? "text-blue-500" : "text-muted-foreground"
          )}
        />
        <span
          className={cn(
            "flex-1 text-sm",
            hasValue ? "font-semibold text-foreground" : "text-muted-foreground"
          )}
        >
          {hasValue ? displayValue(value) : "No reminder set"}
        </span>
        {hasValue && (
          <button
            type="button"
            onClick={clear}
            className="h-5 w-5 shrink-0 rounded-full bg-muted/70 flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Clear reminder time"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </button>

      {/* ── Picker panel ─────────────────────────────────────────── */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-3xl border border-white/60 dark:border-white/8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl p-4 animate-scale-in">

          {/* Hour + Minute grids side by side */}
          <div className="grid grid-cols-2 gap-3 mb-3">

            {/* ── Hours ──────────────────────────────────────────── */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 text-center">
                Hour
              </p>
              <div className="grid grid-cols-4 gap-1">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHour(h)}
                    className={cn(
                      "h-9 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95",
                      hour === h
                        ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-sm"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Minutes ────────────────────────────────────────── */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 text-center">
                Minute
              </p>
              <div className="grid grid-cols-4 gap-1">
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMinute(m)}
                    className={cn(
                      "h-9 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95",
                      minute === m
                        ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-sm"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    )}
                  >
                    {String(m).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── AM / PM toggle ────────────────────────────────────── */}
          <div className="flex gap-2 mb-3">
            {(["AM", "PM"] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setAmpm(period)}
                className={cn(
                  "flex-1 h-10 rounded-2xl text-sm font-bold transition-all duration-150 active:scale-[0.97]",
                  ampm === period
                    ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {period}
              </button>
            ))}
          </div>

          {/* ── Confirm CTA ───────────────────────────────────────── */}
          <button
            type="button"
            onClick={confirm}
            className="w-full h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-bold shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Set {pendingLabel}
          </button>
        </div>
      )}
    </div>
  );
}
