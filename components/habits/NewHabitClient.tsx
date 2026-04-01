"use client";

import { useState } from "react";
import { ArrowLeft, Sparkles, PenLine, ArrowRight, Check } from "lucide-react";
import { HabitForm } from "@/components/habits/HabitForm";
import { TemplateSelector } from "@/components/habits/TemplateSelector";
import { cn } from "@/lib/utils";
import type { IHabitTemplate } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "mode-select" | "template-select" | "form";
type Mode = "template" | "manual" | null;

// ─── Header config per step ───────────────────────────────────────────────────

const HEADER: Record<
  Step,
  { title: string; subtitle: string; gradient: string }
> = {
  "mode-select": {
    title: "New Habit",
    subtitle: "How would you like to start?",
    gradient: "from-blue-500 via-violet-600 to-purple-600",
  },
  "template-select": {
    title: "Choose a Template",
    subtitle: "Pick one to pre-fill your habit — fully editable.",
    gradient: "from-violet-500 via-purple-600 to-pink-500",
  },
  form: {
    title: "Configure Habit",
    subtitle: "Customize every detail before saving.",
    gradient: "from-blue-500 via-blue-600 to-indigo-700",
  },
};

// ─── NewHabitClient ───────────────────────────────────────────────────────────

interface NewHabitClientProps {
  userId: string;
}

export function NewHabitClient({ userId }: NewHabitClientProps) {
  const [step, setStep] = useState<Step>("mode-select");
  const [mode, setMode] = useState<Mode>(null);
  // Template highlighted in the template-select step (not yet confirmed)
  const [pendingTemplate, setPendingTemplate] = useState<IHabitTemplate | null>(null);
  // Template that has been confirmed and will pre-fill the form
  const [formTemplate, setFormTemplate] = useState<IHabitTemplate | null>(null);

  // ── Navigation ─────────────────────────────────────────────────────────────

  function selectMode(m: "template" | "manual") {
    setMode(m);
    if (m === "template") {
      setStep("template-select");
    } else {
      setFormTemplate(null);
      setPendingTemplate(null);
      setStep("form");
    }
  }

  function confirmTemplate() {
    if (!pendingTemplate) return;
    setFormTemplate(pendingTemplate);
    setStep("form");
  }

  function goBack() {
    if (step === "form" && mode === "template") {
      setStep("template-select");
    } else if (step === "form" && mode === "manual") {
      setMode(null);
      setStep("mode-select");
    } else if (step === "template-select") {
      setMode(null);
      setPendingTemplate(null);
      setStep("mode-select");
    }
  }

  // ── Step progress dots ─────────────────────────────────────────────────────

  const stepSequence: Step[] =
    mode === "template"
      ? ["mode-select", "template-select", "form"]
      : mode === "manual"
      ? ["mode-select", "form"]
      : ["mode-select"];

  const currentIdx = stepSequence.indexOf(step);
  const header = HEADER[step];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Gradient header ─────────────────────────────────────── */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-lg transition-all duration-500",
          header.gradient
        )}
      >
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-6 left-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex items-center gap-3">
          {/* Back button (all steps except first) */}
          {step !== "mode-select" && (
            <button
              type="button"
              onClick={goBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 transition-all backdrop-blur-sm"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4 text-white" />
            </button>
          )}

          {/* Icon (mode-select only) */}
          {step === "mode-select" && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          )}

          <div>
            <h1 className="text-xl font-bold leading-tight">{header.title}</h1>
            <p className="text-white/75 text-sm mt-0.5">{header.subtitle}</p>
          </div>
        </div>

        {/* Progress dots */}
        {stepSequence.length > 1 && (
          <div className="relative z-10 flex items-center gap-1.5 mt-4">
            {stepSequence.map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-400",
                  i === currentIdx
                    ? "w-7 bg-white"
                    : i < currentIdx
                    ? "w-3 bg-white/60"
                    : "w-3 bg-white/25"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Step content ────────────────────────────────────────── */}

      {step === "mode-select" && (
        <ModeSelectStep onSelect={selectMode} />
      )}

      {step === "template-select" && (
        <TemplateSelectStep
          pending={pendingTemplate}
          onPick={setPendingTemplate}
          onConfirm={confirmTemplate}
        />
      )}

      {step === "form" && (
        <HabitForm
          key={formTemplate?.id ?? "manual"}
          userId={userId}
          template={formTemplate ?? undefined}
          onCancel={goBack}
        />
      )}
    </div>
  );
}

// ─── Step 1: Mode Select ──────────────────────────────────────────────────────

function ModeSelectStep({
  onSelect,
}: {
  onSelect: (mode: "template" | "manual") => void;
}) {
  return (
    <div className="space-y-3 animate-slide-up">

      {/* Template card */}
      <button
        type="button"
        onClick={() => onSelect("template")}
        className="w-full text-left group"
      >
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 active:scale-[0.98]">
          {/* Color glow */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl transition-colors group-hover:bg-violet-500/18" />
          <div className="pointer-events-none absolute -bottom-6 -left-4 h-24 w-24 rounded-full bg-blue-500/8 blur-2xl transition-colors group-hover:bg-blue-500/14" />

          <div className="relative flex items-start gap-4">
            {/* Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-500/30 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <p className="font-bold text-base leading-tight mb-1">
                Use a Template
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Browse 18 ready-made habits across Fitness, Health, Mindfulness,
                and more. Quick to set up and fully customizable.
              </p>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5 transition-all group-hover:text-primary group-hover:translate-x-0.5" />
          </div>

          {/* Category preview chips */}
          <div className="relative mt-4 flex gap-1.5 flex-wrap">
            {[
              { label: "💪 Fitness", color: "bg-blue-100/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" },
              { label: "🧘 Mindfulness", color: "bg-pink-100/70 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400" },
              { label: "📚 Learning", color: "bg-amber-100/70 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
              { label: "✨ Lifestyle", color: "bg-teal-100/70 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400" },
            ].map(({ label, color }) => (
              <span
                key={label}
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                  color
                )}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </button>

      {/* Manual card */}
      <button
        type="button"
        onClick={() => onSelect("manual")}
        className="w-full text-left group"
      >
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 active:scale-[0.98]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/8 blur-2xl transition-colors group-hover:bg-blue-500/14" />

          <div className="relative flex items-start gap-4">
            {/* Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md shadow-blue-500/30 transition-transform group-hover:scale-105">
              <PenLine className="h-5 w-5 text-white" />
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <p className="font-bold text-base leading-tight mb-1">
                Create from Scratch
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Design your own habit with a custom name, schedule, target, and
                reminder. Complete control from the start.
              </p>
            </div>

            <ArrowRight className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5 transition-all group-hover:text-primary group-hover:translate-x-0.5" />
          </div>

          {/* Feature list */}
          <div className="relative mt-4 space-y-1">
            {["Set any name, category & color", "Choose frequency & target", "Add reminder time"].map(
              (feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                    <Check className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" strokeWidth={3} />
                  </div>
                  <span className="text-xs text-muted-foreground">{feat}</span>
                </div>
              )
            )}
          </div>
        </div>
      </button>
    </div>
  );
}

// ─── Step 2: Template Select ──────────────────────────────────────────────────

function TemplateSelectStep({
  pending,
  onPick,
  onConfirm,
}: {
  pending: IHabitTemplate | null;
  onPick: (t: IHabitTemplate) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-4 animate-slide-up">
      <TemplateSelector selected={pending} onSelect={onPick} />

      {/* Confirm CTA — slides in when a template is selected */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          pending
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-3 pointer-events-none"
        )}
      >
        <button
          type="button"
          onClick={onConfirm}
          disabled={!pending}
          className="btn-add-habit flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold text-white"
        >
          <Sparkles className="h-4 w-4" />
          Use &ldquo;{pending?.title}&rdquo;
        </button>
      </div>
    </div>
  );
}
