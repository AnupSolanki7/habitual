"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Laugh, Smile, Meh, Frown, Angry, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { MOOD_OPTIONS } from "@/constants";
import { upsertJournalEntry } from "@/actions/journal";
import type { IJournalEntry, MoodType } from "@/types";

const MOOD_ICONS: Record<string, LucideIcon> = {
  great:    Laugh,
  good:     Smile,
  okay:     Meh,
  bad:      Frown,
  terrible: Angry,
};

interface JournalFormProps {
  userId: string;
  date: string;
  existingEntry?: IJournalEntry | null;
}

export function JournalForm({ userId, date, existingEntry }: JournalFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [mood, setMood] = useState<MoodType | undefined>(existingEntry?.mood);
  const [note, setNote] = useState(existingEntry?.note ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    setIsSubmitting(true);
    try {
      const result = await upsertJournalEntry(userId, date, { mood, note });
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        toast({ title: "Journal saved", description: "Your entry has been saved." });
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Journal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">How are you feeling?</p>
          <div className="flex gap-2">
            {MOOD_OPTIONS.map((option) => {
              const MoodIcon = MOOD_ICONS[option.value] ?? Meh;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setMood(mood === option.value ? undefined : (option.value as MoodType))
                  }
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl p-2.5 text-xs transition-colors",
                    mood === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  )}
                  title={option.label}
                >
                  <MoodIcon className="h-5 w-5" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Notes</p>
          <Textarea
            placeholder="What happened today? Reflections, wins, struggles..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
        <Button onClick={handleSave} disabled={isSubmitting} size="sm">
          {isSubmitting ? "Saving..." : "Save Entry"}
        </Button>
      </CardContent>
    </Card>
  );
}
