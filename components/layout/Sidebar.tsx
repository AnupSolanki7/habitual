"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Home,
  CheckSquare,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Zap,
  X,
  Users,
  Compass,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",     label: "Home",          icon: Home },
  { href: "/habits",        label: "Habits",        icon: CheckSquare },
  { href: "/social",        label: "Social",        icon: Users },
  { href: "/explore",       label: "Explore",       icon: Compass },
  { href: "/analytics",     label: "Analytics",     icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings",      label: "Settings",      icon: Settings },
];

interface SidebarProps {
  unreadCount?: number;
  onClose?: () => void;
}

export function Sidebar({ unreadCount = 0, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as { name?: string; email?: string; image?: string; id?: string } | undefined;

  return (
    <div className="flex h-full flex-col bg-background border-r">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-5 border-b shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 font-bold text-lg"
          onClick={onClose}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-sm">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">Habi2ual</span>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
              {label === "Notifications" && unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-auto h-5 px-1.5 text-xs"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-3 shrink-0">
        <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-accent transition-colors">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user?.image ?? ""} />
            <AvatarFallback className="text-xs bg-gradient-to-br from-violet-500 to-indigo-500 text-white font-semibold">
              {getInitials(user?.name ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate leading-tight">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
