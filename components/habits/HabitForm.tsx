"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  HABIT_COLORS,
  TARGET_TYPES,
  FREQUENCY_TYPES,
  DAYS_OF_WEEK,
} from "@/constants";
import { createHabit, updateHabit } from "@/actions/habits";
import { ReminderTimePicker } from "@/components/habits/ReminderTimePicker";
import type { IHabit, IHabitTemplate } from "@/types";

const CATEGORIES = [
  { value: "Health", emoji: "🏥" },
  { value: "Fitness", emoji: "🏃" },
  { value: "Learning", emoji: "📚" },
  { value: "Work", emoji: "💼" },
  { value: "Mindfulness", emoji: "🧘" },
  { value: "Social", emoji: "👥" },
  { value: "Finance", emoji: "💰" },
  { value: "Other", emoji: "⭐" },
];

const habitSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  category: z.string().default("Other"),
  color: z.string().default("#6366f1"),
  icon: z.string().default("target"),
  targetType: z.enum(["boolean", "count", "duration"]).default("boolean"),
  targetValue: z.coerce.number().min(1).default(1),
  frequencyType: z.enum(["daily", "weekly", "custom"]).default("daily"),
  frequencyDays: z.array(z.number()).optional(),
  reminderTime: z.string().optional(),
  visibility: z.enum(["private", "public"]).default("private"),
});

type HabitFormValues = z.infer<typeof habitSchema>;

interface HabitFormProps {
  userId: string;
  habit?: IHabit;
  /** Pre-fills the form when user selects a template on the New Habit page */
  template?: IHabitTemplate;
  /** Override the Cancel button — used by the multi-step new-habit flow */
  onCancel?: () => void;
}

export function HabitForm({ userId, habit, template, onCancel }: HabitFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      title:         habit?.title         ?? template?.title         ?? "",
      description:   habit?.description   ?? template?.description   ?? "",
      category:      habit?.category      ?? template?.category      ?? "Other",
      color:         habit?.color         ?? template?.color         ?? "#6366f1",
      icon:          habit?.icon          ?? "target",
      targetType:    habit?.targetType    ?? template?.targetType    ?? "boolean",
      targetValue:   habit?.targetValue   ?? template?.targetValue   ?? 1,
      frequencyType: habit?.frequencyType ?? template?.frequencyType ?? "daily",
      frequencyDays: habit?.frequencyDays ?? template?.frequencyDays ?? [],
      reminderTime:  habit?.reminderTime  ?? "",
      visibility:    habit?.visibility    ?? "private",
    },
  });

  const frequencyType = form.watch("frequencyType");
  const targetType = form.watch("targetType");
  const selectedColor = form.watch("color");
  const selectedCategory = form.watch("category");
  const selectedDays = form.watch("frequencyDays") ?? [];

  const toggleDay = (day: number) => {
    const current = form.getValues("frequencyDays") ?? [];
    if (current.includes(day)) {
      form.setValue("frequencyDays", current.filter((d) => d !== day));
    } else {
      form.setValue("frequencyDays", [...current, day]);
    }
  };

  async function onSubmit(values: HabitFormValues) {
    setIsSubmitting(true);
    try {
      const result = habit
        ? await updateHabit(userId, habit.id, values)
        : await createHabit(userId, values);

      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
        return;
      }

      toast({
        title: habit ? "Habit updated" : "Habit created",
        description: habit
          ? "Your habit has been updated."
          : "Your new habit is ready to track.",
      });
      router.push("/habits");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* ── Basic Info ───────────────────────────────────────────────── */}
        <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-5 space-y-4">
          <SectionLabel>Basic Info</SectionLabel>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground">Habit name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Morning Run"
                    className="h-12 rounded-2xl border-border/70 bg-background shadow-sm focus-visible:ring-blue-500/20 focus-visible:border-blue-400"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground">Description <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What's the goal?"
                    className="resize-none rounded-2xl border-border/70 bg-background shadow-sm focus-visible:ring-blue-500/20 focus-visible:border-blue-400"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Visibility toggle */}
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 p-4">
                <div>
                  <FormLabel className="text-sm font-semibold cursor-pointer">Make habit public</FormLabel>
                  <FormDescription className="text-xs mt-0.5">
                    Appears on your profile and in Explore.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value === "public"}
                    onCheckedChange={(checked) =>
                      field.onChange(checked ? "public" : "private")
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* ── Category ─────────────────────────────────────────────────── */}
        <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-5 space-y-3">
          <SectionLabel>Category</SectionLabel>
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-4 gap-2.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => field.onChange(cat.value)}
                      className={cn(
                        "activity-btn flex flex-col items-center gap-1 py-3 px-2 transition-all",
                        field.value === cat.value && "active"
                      )}
                    >
                      <span className="text-xl leading-none">{cat.emoji}</span>
                      <span className="text-[10px] font-medium leading-tight text-center">
                        {cat.value}
                      </span>
                    </button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Color ────────────────────────────────────────────────────── */}
        <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-5 space-y-3">
          <SectionLabel>Color</SectionLabel>
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-wrap gap-3 pt-1">
                  {HABIT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "h-8 w-8 rounded-full transition-all hover:scale-110",
                        selectedColor === color &&
                          "ring-2 ring-offset-2 ring-offset-background scale-110"
                      )}
                      style={{
                        backgroundColor: color,
                        ringColor: color,
                      }}
                      onClick={() => field.onChange(color)}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Tracking ─────────────────────────────────────────────────── */}
        <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-5 space-y-4">
          <SectionLabel>Tracking</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="targetType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TARGET_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {targetType !== "boolean" && (
              <FormField
                control={form.control}
                name="targetValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Target {targetType === "duration" ? "(min)" : "(count)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        className="h-11 rounded-2xl border-border/70 bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* ── Schedule ─────────────────────────────────────────────────── */}
        <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-5 space-y-4">
          <SectionLabel>Schedule</SectionLabel>

          <FormField
            control={form.control}
            name="frequencyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FREQUENCY_TYPES.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {frequencyType === "custom" && (
            <FormField
              control={form.control}
              name="frequencyDays"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Days</FormLabel>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={cn(
                          "h-10 w-10 rounded-full text-xs font-semibold transition-all",
                          selectedDays.includes(day.value)
                            ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="reminderTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Reminder time{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <ReminderTimePicker
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Sets your preferred time for in-app reminders.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <div className="flex gap-3 pb-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-add-habit flex-1 py-3.5 text-sm font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Saving..."
              : habit
              ? "Update Habit"
              : "Create Habit"}
          </button>
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl px-5 h-auto border-border/70"
            onClick={() => (onCancel ? onCancel() : router.back())}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-bold text-foreground/80 uppercase tracking-wide">
      {children}
    </p>
  );
}
