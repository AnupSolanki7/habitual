"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HABIT_TEMPLATES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_CATEGORY_STYLES,
} from "@/constants/templates";
import type { IHabitTemplate } from "@/types";

interface TemplateSelectorProps {
  selected: IHabitTemplate | null;
  onSelect: (template: IHabitTemplate) => void;
}

const FREQUENCY_LABEL: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  custom: "Custom days",
};

const TARGET_LABEL: Record<string, (v: number) => string> = {
  boolean: () => "Yes / No",
  count: (v) => `${v}×`,
  duration: (v) => `${v} min`,
};

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered =
    activeCategory === "All"
      ? HABIT_TEMPLATES
      : HABIT_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-sm overflow-hidden">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Start with a template
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pick one to pre-fill the form — you can still edit everything.
            </p>
          </div>
          {selected && (
            <button
              type="button"
              onClick={() => onSelect(selected)} // deselect by clicking again (handled in parent)
              className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-3"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Category tabs ─────────────────────────────────────────── */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {TEMPLATE_CATEGORIES.map((cat) => {
            const style = cat === "All" ? null : TEMPLATE_CATEGORY_STYLES[cat];
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 border whitespace-nowrap",
                  isActive
                    ? "text-white border-transparent shadow-sm"
                    : "bg-muted/60 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                style={
                  isActive && style
                    ? {
                        background: `linear-gradient(135deg, ${style.from}, ${style.to})`,
                      }
                    : isActive
                    ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }
                    : {}
                }
              >
                {style && <span>{style.emoji}</span>}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Template grid ─────────────────────────────────────────── */}
      <div className="px-4 pb-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filtered.map((template) => {
            const style = TEMPLATE_CATEGORY_STYLES[template.category];
            const isSelected = selected?.id === template.id;

            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect(template)}
                className={cn(
                  "group relative flex flex-col items-start gap-2 rounded-2xl p-3.5 text-left transition-all duration-150 active:scale-[0.97] overflow-hidden",
                  isSelected
                    ? "shadow-md scale-[1.02]"
                    : "hover:scale-[1.01] hover:shadow-sm"
                )}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${style?.from ?? "#6366f1"}, ${style?.to ?? "#8b5cf6"})`
                    : `linear-gradient(135deg, ${style?.from ?? "#6366f1"}12, ${style?.to ?? "#8b5cf6"}18)`,
                  border: isSelected
                    ? `1.5px solid ${style?.from ?? "#6366f1"}60`
                    : `1.5px solid ${style?.from ?? "#6366f1"}20`,
                }}
              >
                {/* Emoji */}
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl text-xl shadow-sm transition-transform duration-150 group-hover:scale-110",
                    isSelected ? "bg-white/25" : "bg-white/70 dark:bg-white/10"
                  )}
                >
                  {template.emoji}
                </div>

                {/* Title */}
                <div className="space-y-0.5 flex-1">
                  <p
                    className={cn(
                      "text-xs font-bold leading-tight",
                      isSelected ? "text-white" : "text-foreground"
                    )}
                  >
                    {template.title}
                  </p>
                  <p
                    className={cn(
                      "text-[10px] font-medium",
                      isSelected ? "text-white/70" : "text-muted-foreground"
                    )}
                  >
                    {TARGET_LABEL[template.targetType]?.(template.targetValue)} ·{" "}
                    {FREQUENCY_LABEL[template.frequencyType]}
                  </p>
                </div>

                {/* Selected checkmark */}
                {isSelected && (
                  <CheckCircle2 className="absolute top-2.5 right-2.5 h-4 w-4 text-white drop-shadow animate-scale-in" />
                )}

                {/* Subtle arrow for unselected */}
                {!isSelected && (
                  <ChevronRight
                    className="absolute bottom-3 right-2.5 h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
