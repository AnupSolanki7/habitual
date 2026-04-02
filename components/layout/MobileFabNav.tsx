"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Target,
  Plus,
  Users,
  Bell,
  Settings,
  X,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

// 6 items keeps the dock within 375px screens.
// Home, Habits, New, Social, Alerts, Settings — the core journeys.
const NAV_ITEMS = [
  { href: "/dashboard",     icon: Home,     label: "Home",     isAction: false },
  { href: "/habits",        icon: Target,   label: "Habits",   isAction: false },
  { href: "/habits/new",    icon: Plus,     label: "New Habit", isAction: true },
  { href: "/social",        icon: Users,    label: "Social",   isAction: false },
  { href: "/notifications", icon: Bell,     label: "Alerts",   isAction: false },
  { href: "/settings",      icon: Settings, label: "Settings", isAction: false },
] as const;

export function MobileFabNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // Capture outside pointer-down (handles both mouse and touch)
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Auto-close when the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/habits/new") return pathname === "/habits/new";
    return pathname.startsWith(href) && !pathname.includes("/new");
  };

  return (
    /*
      Outer wrapper:
      - Positioned bottom-left; flex-row so dock grows rightward.
      - pointer-events-none when collapsed so the dead space around the
        trigger never eats clicks on underlying page content.
      - The trigger itself overrides this with pointer-events-auto.
    */
    <div
      ref={containerRef}
      className={cn(
        "fixed bottom-6 left-4 z-50 md:hidden",
        "flex flex-row items-center gap-2",
        !open && "pointer-events-none"
      )}
    >
      {/* ── Orb trigger ── */}
      <button
        type="button"
        className="fab-trigger pointer-events-auto"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="fab-dock"
        aria-label={open ? "Close navigation" : "Open navigation"}
      >
        <span
          className={cn(
            "fab-trigger-icon",
            open && "fab-trigger-icon--open"
          )}
        >
          {open ? (
            <X className="h-6 w-6" strokeWidth={2} />
          ) : (
            <LayoutGrid className="h-5 w-5" strokeWidth={1.75} />
          )}
        </span>
      </button>

      {/*
        ── Horizontal dock ──
        max-width transitions from 0 → open value to create the
        slide-out effect. overflow-hidden clips items during animation.
        pointer-events disabled while closed so invisible area is inert.
      */}
      <div
        id="fab-dock"
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          "fab-dock pointer-events-auto",
          open ? "fab-dock--open" : "fab-dock--closed"
        )}
      >
        <div className="flex items-center gap-1 px-2 py-2">
          {NAV_ITEMS.map(({ href, icon: Icon, label, isAction }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "fab-dock-item",
                  active && "fab-dock-item--active",
                  isAction && !active && "fab-dock-item--action"
                )}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                // Prevent keyboard tab-stops while dock is hidden
                tabIndex={open ? 0 : -1}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
