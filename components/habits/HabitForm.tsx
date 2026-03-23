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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  HABIT_CATEGORIES,
  HABIT_COLORS,
  TARGET_TYPES,
  FREQUENCY_TYPES,
  DAYS_OF_WEEK,
} from "@/constants";
import { createHabit, updateHabit } from "@/actions/habits";
import type { IHabit } from "@/types";

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
});

type HabitFormValues = z.infer<typeof habitSchema>;

interface HabitFormProps {
  userId: string;
  habit?: IHabit;
}

export function HabitForm({ userId, habit }: HabitFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      title: habit?.title ?? "",
      description: habit?.description ?? "",
      category: habit?.category ?? "Other",
      color: habit?.color ?? "#6366f1",
      icon: habit?.icon ?? "target",
      targetType: habit?.targetType ?? "boolean",
      targetValue: habit?.targetValue ?? 1,
      frequencyType: habit?.frequencyType ?? "daily",
      frequencyDays: habit?.frequencyDays ?? [],
      reminderTime: habit?.reminderTime ?? "",
    },
  });

  const frequencyType = form.watch("frequencyType");
  const targetType = form.watch("targetType");
  const selectedColor = form.watch("color");
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Morning Run" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HABIT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {HABIT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={cn(
                            "h-7 w-7 rounded-full transition-transform hover:scale-110",
                            selectedColor === color &&
                              "ring-2 ring-offset-2 ring-primary scale-110"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                      <FormLabel>
                        Target {targetType === "duration" ? "(min)" : "(count)"}
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="frequencyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                    <FormLabel>Days</FormLabel>
                    <div className="flex gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleDay(day.value)}
                          className={cn(
                            "h-9 w-9 rounded-full text-xs font-medium transition-colors",
                            selectedDays.includes(day.value)
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
                  <FormLabel>Reminder Time (optional)</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormDescription>
                    Sets your preferred time for in-app reminders.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Saving..." : habit ? "Update Habit" : "Create Habit"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
