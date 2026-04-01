"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  Flame,
  Type,
  Trophy,
  Loader2,
  Globe,
  Users,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { getInitials, cn } from "@/lib/utils";
import { createPost } from "@/actions/posts";
import { getShareableData } from "@/actions/streaks";
import { ACHIEVEMENT_DEFS } from "@/lib/achievements";
import type {
  IPost,
  PostType,
  PostVisibility,
  ShareableData,
  HabitStreakInfo,
  Achievement,
} from "@/types";

interface PostComposerProps {
  currentUserId: string;
  currentUserName: string;
  currentUserImage?: string;
  onPostCreated: (post: IPost) => void;
  placeholder?: string;
}

const POST_TYPES: {
  value: PostType;
  label: string;
  icon: React.ElementType;
  color: string;
  activeBg: string;
  activeText: string;
}[] = [
  {
    value: "text",
    label: "Thought",
    icon: Type,
    color: "text-blue-500",
    activeBg:
      "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/40",
    activeText: "text-blue-600 dark:text-blue-400",
  },
  {
    value: "streak",
    label: "Streak",
    icon: Flame,
    color: "text-orange-500",
    activeBg:
      "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800/40",
    activeText: "text-orange-600 dark:text-orange-400",
  },
  {
    value: "achievement",
    label: "Achievement",
    icon: Trophy,
    color: "text-yellow-500",
    activeBg:
      "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800/40",
    activeText: "text-yellow-600 dark:text-yellow-500",
  },
];

const VISIBILITY_OPTIONS: {
  value: PostVisibility;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "followers", label: "Followers", icon: Users },
  { value: "public", label: "Public", icon: Globe },
];

const CATEGORY_EMOJI: Record<string, string> = {
  Fitness: "🏃",
  Health: "🏥",
  Learning: "📚",
  Work: "💼",
  Mindfulness: "🧘",
  Productivity: "⚡",
  Mental: "🧠",
  Social: "👥",
  Finance: "💰",
  Other: "⭐",
};

function categoryEmoji(cat: string): string {
  return (
    CATEGORY_EMOJI[cat] ??
    CATEGORY_EMOJI[Object.keys(CATEGORY_EMOJI).find((k) => cat.includes(k)) ?? ""] ??
    "⭐"
  );
}

export function PostComposer({
  currentUserId,
  currentUserName,
  currentUserImage,
  onPostCreated,
  placeholder,
}: PostComposerProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [content, setContent] = useState("");
  const [type, setType] = useState<PostType>("text");
  const [visibility, setVisibility] = useState<PostVisibility>("followers");
  const [isFocused, setIsFocused] = useState(false);

  // Validated-sharing state
  const [shareableData, setShareableData] = useState<ShareableData | null>(null);
  const [loadingShareable, setLoadingShareable] = useState(false);
  const [shareableError, setShareableError] = useState<string | null>(null);
  const [selectedStreak, setSelectedStreak] = useState<HabitStreakInfo | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const hasFetchedRef = useRef(false);

  const selectedVis =
    VISIBILITY_OPTIONS.find((v) => v.value === visibility) ??
    VISIBILITY_OPTIONS[0];
  const charCount = content.length;
  const isOverLimit = charCount > 1000;

  // Fetch shareable data lazily the first time a validated type is selected
  useEffect(() => {
    if (
      (type === "streak" || type === "achievement") &&
      !hasFetchedRef.current &&
      !loadingShareable
    ) {
      hasFetchedRef.current = true;
      setLoadingShareable(true);
      setShareableError(null);
      getShareableData(currentUserId).then((result) => {
        setLoadingShareable(false);
        if (result.error) {
          setShareableError(result.error);
        } else {
          setShareableData(result.data ?? null);
        }
      });
    }
  }, [type, loadingShareable, currentUserId]);

  // Auto-fill content when selection changes
  function selectStreak(habit: HabitStreakInfo) {
    setSelectedStreak(habit);
    setSelectedAchievement(null);
    setContent(
      `🔥 ${habit.currentStreak}-day ${habit.title} streak! Keeping the momentum going.`
    );
  }

  function selectAchievement(a: Achievement) {
    setSelectedAchievement(a);
    setSelectedStreak(null);
    setContent(`${a.emoji} ${a.title}! ${a.description}.`);
  }

  function handleTypeChange(next: PostType) {
    setType(next);
    setIsFocused(true);
    if (next === "text") {
      setSelectedStreak(null);
      setSelectedAchievement(null);
      setContent("");
    }
  }

  function handleSubmit() {
    if (!content.trim() || isOverLimit) return;

    if (type === "streak" && !selectedStreak) {
      toast({
        variant: "destructive",
        title: "Select a streak",
        description: "Choose one of your habits to share its streak.",
      });
      return;
    }
    if (type === "achievement" && !selectedAchievement) {
      toast({
        variant: "destructive",
        title: "Select an achievement",
        description: "Choose an achievement you've unlocked.",
      });
      return;
    }

    startTransition(async () => {
      const result = await createPost(currentUserId, {
        type,
        content: content.trim(),
        habitId: selectedStreak?.habitId,
        streakCount: type === "streak" ? selectedStreak?.currentStreak : undefined,
        visibility,
        metadata:
          type === "achievement" && selectedAchievement
            ? { achievementId: selectedAchievement.id }
            : undefined,
      });

      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
        return;
      }
      if (result.data) {
        onPostCreated({
          ...result.data,
          author: { id: currentUserId, name: currentUserName, image: currentUserImage },
        });
        setContent("");
        setType("text");
        setSelectedStreak(null);
        setSelectedAchievement(null);
        setIsFocused(false);
        toast({ title: "Posted!", description: "Your update is live." });
      }
    });
  }

  const composerPlaceholder =
    placeholder ??
    (type === "streak"
      ? "Add a note to your streak post…"
      : type === "achievement"
      ? "Celebrate your milestone…"
      : "What's on your mind?");

  return (
    <div
      className={cn(
        "rounded-2xl bg-card border transition-all duration-200",
        isFocused
          ? "border-blue-300/70 dark:border-blue-700/50 shadow-[0_0_0_3px_rgba(59,130,246,0.07),0_4px_16px_-4px_rgba(59,130,246,0.12)]"
          : "border-border/60 shadow-sm"
      )}
    >
      {/* ── Top row ──────────────────────────────────────────────── */}
      <div className="flex gap-3 p-4 pb-3">
        <Avatar className="h-9 w-9 shrink-0 ring-2 ring-border/50">
          <AvatarImage src={currentUserImage ?? ""} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-500 text-white text-xs font-semibold">
            {getInitials(currentUserName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <textarea
            rows={isFocused ? 3 : 2}
            placeholder={composerPlaceholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* ── Type selector ─────────────────────────────────────────── */}
      {isFocused && (
        <div className="px-4 pb-3 animate-fade-in">
          <div className="flex items-center gap-1.5">
            {POST_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleTypeChange(t.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all border whitespace-nowrap",
                  type === t.value
                    ? cn(t.activeBg, t.activeText)
                    : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <t.icon className={cn("h-3.5 w-3.5", type === t.value ? t.activeText : "")} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Streak selector panel ─────────────────────────────────── */}
      {isFocused && type === "streak" && (
        <div className="px-4 pb-3 animate-fade-in">
          <div className="rounded-2xl border border-orange-200/70 dark:border-orange-900/40 bg-orange-50/60 dark:bg-orange-950/10 p-3">
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2.5 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5" />
              Pick a habit to share
            </p>

            {loadingShareable && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading your streaks…
              </div>
            )}

            {shareableError && (
              <div className="flex items-center gap-2 text-xs text-destructive py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {shareableError}
              </div>
            )}

            {!loadingShareable && !shareableError && shareableData?.streaks.length === 0 && (
              <div className="text-xs text-muted-foreground py-2 text-center space-y-1">
                <Flame className="h-6 w-6 text-orange-300 mx-auto" />
                <p className="font-medium">No streaks to share yet</p>
                <p className="text-[11px]">Build a 3-day streak on any habit first.</p>
              </div>
            )}

            {!loadingShareable && shareableData && shareableData.streaks.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {shareableData.streaks.map((habit) => (
                  <button
                    key={habit.habitId}
                    type="button"
                    onClick={() => selectStreak(habit)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150 active:scale-[0.98]",
                      selectedStreak?.habitId === habit.habitId
                        ? "border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 shadow-sm shadow-orange-200/60 dark:shadow-orange-900/30"
                        : "border-border/60 bg-card hover:border-orange-300 hover:bg-orange-50/30 dark:hover:bg-orange-950/10"
                    )}
                  >
                    {/* Colour dot + emoji */}
                    <div
                      className="h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-base shadow-sm"
                      style={{ backgroundColor: habit.color + "25" }}
                    >
                      {categoryEmoji(habit.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">
                        {habit.title}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {habit.category}
                      </p>
                    </div>

                    {/* Streak badge */}
                    <div
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shrink-0",
                        selectedStreak?.habitId === habit.habitId
                          ? "bg-orange-500 text-white"
                          : "bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400"
                      )}
                    >
                      🔥 {habit.currentStreak}d
                    </div>

                    {/* Checkmark */}
                    {selectedStreak?.habitId === habit.habitId && (
                      <CheckCircle2 className="absolute top-2 right-2 h-3.5 w-3.5 text-orange-500 animate-scale-in" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Achievement selector panel ────────────────────────────── */}
      {isFocused && type === "achievement" && (
        <div className="px-4 pb-3 animate-fade-in">
          <div className="rounded-2xl border border-yellow-200/70 dark:border-yellow-900/40 bg-yellow-50/50 dark:bg-yellow-950/10 p-3">
            <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-2.5 flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5" />
              Your unlocked achievements
            </p>

            {loadingShareable && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading your achievements…
              </div>
            )}

            {shareableError && (
              <div className="flex items-center gap-2 text-xs text-destructive py-2">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {shareableError}
              </div>
            )}

            {!loadingShareable && !shareableError && shareableData?.achievements.length === 0 && (
              <div className="text-xs text-muted-foreground py-2 text-center space-y-1">
                <Sparkles className="h-6 w-6 text-yellow-300 mx-auto" />
                <p className="font-medium">No achievements yet</p>
                <p className="text-[11px]">Complete habits to unlock your first achievement.</p>
              </div>
            )}

            {!loadingShareable && shareableData && shareableData.achievements.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {shareableData.achievements.map((ach) => {
                  const def = ACHIEVEMENT_DEFS.find((d) => d.id === ach.id);
                  const isSelected = selectedAchievement?.id === ach.id;
                  return (
                    <button
                      key={ach.id}
                      type="button"
                      onClick={() => selectAchievement(ach)}
                      className={cn(
                        "relative flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-center transition-all duration-150 active:scale-[0.97] overflow-hidden",
                        isSelected
                          ? "border-transparent shadow-md scale-[1.02]"
                          : "border-border/60 bg-card hover:border-yellow-300 hover:shadow-sm"
                      )}
                      style={
                        isSelected && def
                          ? {
                              background: `linear-gradient(135deg, ${def.gradientFrom}18, ${def.gradientTo}18)`,
                              borderColor: def.gradientFrom + "80",
                            }
                          : {}
                      }
                    >
                      {/* Gradient bg strip for selected */}
                      {isSelected && def && (
                        <div
                          className="absolute inset-x-0 top-0 h-0.5"
                          style={{
                            background: `linear-gradient(90deg, ${def.gradientFrom}, ${def.gradientTo})`,
                          }}
                        />
                      )}

                      <span className="text-2xl leading-none">{ach.emoji}</span>
                      <p className="text-xs font-bold leading-tight">{ach.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                        {ach.description}
                      </p>

                      {isSelected && (
                        <CheckCircle2 className="absolute top-2 right-2 h-3.5 w-3.5 text-yellow-500 animate-scale-in" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Actions bar ───────────────────────────────────────────── */}
      {isFocused && (
        <div className="flex items-center justify-between px-4 pb-3 pt-1 gap-2 border-t border-border/30 animate-fade-in">
          {/* Visibility dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 rounded-full text-xs text-muted-foreground px-2.5 hover:bg-secondary"
              >
                <selectedVis.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{selectedVis.label}</span>
                <ChevronDown className="h-2.5 w-2.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl min-w-32">
              {VISIBILITY_OPTIONS.map((v) => (
                <DropdownMenuItem
                  key={v.value}
                  onClick={() => setVisibility(v.value)}
                  className={cn(
                    "gap-2 text-xs cursor-pointer rounded-lg",
                    visibility === v.value && "bg-secondary"
                  )}
                >
                  <v.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  {v.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2 ml-auto">
            <span
              className={cn(
                "text-xs tabular-nums",
                isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"
              )}
            >
              {charCount}/1000
            </span>

            <Button
              size="sm"
              className="h-7 px-4 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 hover:opacity-90 text-white text-xs font-semibold border-0 shadow-sm"
              disabled={
                !content.trim() ||
                isOverLimit ||
                isPending ||
                (type === "streak" && !selectedStreak) ||
                (type === "achievement" && !selectedAchievement)
              }
              onClick={handleSubmit}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
