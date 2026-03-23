import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatHabitValue(
  value: number,
  targetType: string,
  targetValue: number
): string {
  if (targetType === "boolean") return value > 0 ? "Done" : "Pending";
  if (targetType === "duration") return `${value}/${targetValue} min`;
  return `${value}/${targetValue}`;
}
