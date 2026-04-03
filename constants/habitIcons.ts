import {
  Heart,
  Dumbbell,
  BookOpen,
  Briefcase,
  Brain,
  Users,
  Coins,
  Star,
  Leaf,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps habit/template category names to their canonical Lucide icon.
 * Used across HabitCard, TodayHabits, TemplateSelector, TinyHabitCard.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Core habit categories
  Health: Heart,
  Fitness: Dumbbell,
  Learning: BookOpen,
  Work: Briefcase,
  Mindfulness: Brain,
  Social: Users,
  Finance: Coins,
  Other: Star,
  // Template-specific category names
  Productivity: Briefcase,
  "Mental Wellness": Brain,
  Lifestyle: Leaf,
};

/** Returns the icon for a category, falling back to Star. */
export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? Star;
}
