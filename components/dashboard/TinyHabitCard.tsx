import {
  BookOpen,
  Activity,
  Wind,
  Dumbbell,
  Droplets,
  CheckSquare,
  MessageCircle,
  Receipt,
  Target,
  type LucideIcon,
} from "lucide-react";
import type { HabitWithStats } from "@/types";

interface TinyHabit {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  text: string;
}

const GENERIC_TINY_HABITS: TinyHabit[] = [
  { icon: BookOpen,  iconColor: "text-blue-600 dark:text-blue-400",    iconBg: "bg-blue-100 dark:bg-blue-950/40",    text: "Read 1 page" },
  { icon: Activity,  iconColor: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-950/40", text: "Walk 5 minutes" },
  { icon: Wind,      iconColor: "text-cyan-600 dark:text-cyan-400",     iconBg: "bg-cyan-100 dark:bg-cyan-950/40",    text: "Breathe deeply for 2 minutes" },
];

const CATEGORY_TINY_HABITS: Record<string, TinyHabit> = {
  Fitness:      { icon: Dumbbell,       iconColor: "text-blue-600 dark:text-blue-400",    iconBg: "bg-blue-100 dark:bg-blue-950/40",    text: "Walk for 5 minutes" },
  Health:       { icon: Droplets,       iconColor: "text-cyan-600 dark:text-cyan-400",    iconBg: "bg-cyan-100 dark:bg-cyan-950/40",    text: "Drink a glass of water" },
  Learning:     { icon: BookOpen,       iconColor: "text-indigo-600 dark:text-indigo-400", iconBg: "bg-indigo-100 dark:bg-indigo-950/40", text: "Read one page" },
  Mindfulness:  { icon: Wind,           iconColor: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-100 dark:bg-violet-950/40", text: "Breathe deeply for 2 minutes" },
  Work:         { icon: CheckSquare,    iconColor: "text-slate-600 dark:text-slate-400",  iconBg: "bg-slate-100 dark:bg-slate-800/40",  text: "Do one small task" },
  Social:       { icon: MessageCircle,  iconColor: "text-pink-600 dark:text-pink-400",    iconBg: "bg-pink-100 dark:bg-pink-950/40",    text: "Send a kind message" },
  Finance:      { icon: Receipt,        iconColor: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-950/40", text: "Review one expense" },
  Other:        { icon: Target,         iconColor: "text-orange-600 dark:text-orange-400", iconBg: "bg-orange-100 dark:bg-orange-950/40", text: "Do something tiny toward your goal" },
};

interface TinyHabitCardProps {
  habits?: HabitWithStats[];
}

export function TinyHabitCard({ habits = [] }: TinyHabitCardProps) {
  const seen = new Set<string>();
  const derived = habits
    .map((h) => h.category)
    .filter((cat): cat is string => !seen.has(cat) && seen.add(cat) !== undefined)
    .slice(0, 3)
    .map((cat) => CATEGORY_TINY_HABITS[cat])
    .filter(Boolean) as TinyHabit[];

  const tinyHabits = derived.length >= 2 ? derived : GENERIC_TINY_HABITS;

  return (
    <section className="glass-panel p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold">Low energy today?</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Do the tiny version — it still counts.
        </p>
      </div>

      <div className="space-y-2">
        {tinyHabits.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-2xl bg-muted/40 border border-border/40 px-3 py-2.5"
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                <Icon className={`h-3.5 w-3.5 ${item.iconColor}`} />
              </div>
              <span className="text-xs font-medium text-foreground/80">
                {item.text}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground text-center leading-snug">
        Showing up matters more than being perfect.
      </p>
    </section>
  );
}
