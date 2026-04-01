"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ExploreSearchProps {
  initialQuery: string;
}

export function ExploreSearch({ initialQuery }: ExploreSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      startTransition(() => {
        const params = new URLSearchParams();
        if (value.trim()) params.set("q", value.trim());
        router.replace(`${pathname}${params.toString() ? `?${params}` : ""}`);
      });
    },
    [router, pathname]
  );

  return (
    <div className="relative">
      {isPending ? (
        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
      ) : (
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      )}
      <Input
        className="pl-9 pr-9 rounded-xl h-11 bg-card shadow-sm border-border/60"
        placeholder="Search by name or @username…"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        autoFocus
      />
      {query && (
        <button
          onClick={() => handleChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
