"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Plus, Users, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/habits", icon: Target, label: "Habits" },
  { href: "/social", icon: Users, label: "Social" },
  { href: "/notifications", icon: Bell, label: "Alerts" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href) && !pathname.includes("/new");
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 md:hidden px-4 w-full max-w-sm">
      <nav className="bottom-nav-bar flex items-center justify-around px-2 py-2 shadow-2xl shadow-black/30">
        <NavItem
          href="/dashboard"
          icon={Home}
          label="Home"
          active={pathname === "/dashboard"}
        />
        <NavItem
          href="/habits"
          icon={Target}
          label="Habits"
          active={pathname.startsWith("/habits") && !pathname.includes("/new")}
        />

        {/* Central add button */}
        <Link
          href="/habits/new"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/40 transition-transform active:scale-95"
          aria-label="Add habit"
        >
          <Plus className="h-5 w-5 text-white" strokeWidth={2.5} />
        </Link>

        <NavItem
          href="/social"
          icon={Users}
          label="Social"
          active={pathname.startsWith("/social")}
        />
        <NavItem
          href="/notifications"
          icon={Bell}
          label="Alerts"
          active={pathname.startsWith("/notifications")}
        />
      </nav>
    </div>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-colors",
        active ? "text-white" : "text-white/40 hover:text-white/70"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 transition-all",
          active && "drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
        )}
      />
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </Link>
  );
}
