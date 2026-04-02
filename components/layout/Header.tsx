"use client";

import Link from "next/link";
import { Moon, Sun, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b glass px-4 shrink-0">
      {/* Brand — mobile only; desktop sidebar already carries the logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 md:hidden"
        aria-label="Habi2ual home"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-sm">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-base gradient-text">Habi2ual</span>
      </Link>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground relative"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notification bell */}
        <NotificationBell />
      </div>
    </header>
  );
}
