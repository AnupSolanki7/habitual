"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  unreadCount?: number;
}

export function MobileNav({ open, onClose, unreadCount = 0 }: MobileNavProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute left-0 top-0 h-full w-72">
        <Sidebar unreadCount={unreadCount} onClose={onClose} />
      </div>
    </div>
  );
}
