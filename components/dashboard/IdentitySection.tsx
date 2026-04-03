import type { HabitWithStats } from "@/types";

const CATEGORY_TO_IDENTITY: Record<string, string> = {
  Health: "Healthy",
  Fitness: "Active",
  Learning: "Curious",
  Work: "Productive",
  Mindfulness: "Present",
  Social: "Connected",
  Finance: "Intentional",
  Other: "Consistent",
};

interface IdentitySectionProps {
  habits: HabitWithStats[];
}

export function IdentitySection({ habits }: IdentitySectionProps) {
  // Derive unique identity labels from today's habit categories
  const seen = new Set<string>();
  const identities = habits
    .map((h) => CATEGORY_TO_IDENTITY[h.category])
    .filter((label): label is string => Boolean(label) && !seen.has(label) && seen.add(label) !== undefined)
    .slice(0, 4);

  // Fallback if no habits yet
  const displayIdentities =
    identities.length > 0
      ? identities
      : ["Consistent", "Intentional", "Focused"];

  return (
    <div className="glass-panel px-5 py-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
        You are becoming
      </p>
      <div className="flex flex-wrap gap-2">
        {displayIdentities.map((identity) => (
          <span
            key={identity}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-950/50 dark:to-indigo-950/50 border border-violet-200/60 dark:border-violet-800/40 px-3.5 py-1.5 text-sm font-semibold text-violet-700 dark:text-violet-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
            {identity}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
        Each habit completed today is a vote for your future self.
      </p>
    </div>
  );
}
