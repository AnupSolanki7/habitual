import type { DailyQuote } from "@/constants/quotes";

interface DailyQuoteBannerProps {
  quote: DailyQuote;
}

const CATEGORY_LABEL: Record<DailyQuote["category"], string> = {
  consistency: "Consistency",
  discipline: "Discipline",
  identity: "Identity",
  focus: "Focus",
  resilience: "Resilience",
  "showing-up": "Showing Up",
};

export function DailyQuoteBanner({ quote }: DailyQuoteBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 text-white quote-banner-card">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-6 left-6 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute right-16 bottom-4 h-20 w-20 rounded-full bg-white/8 blur-2xl" />

      <div className="relative z-10">
        {/* Category pill */}
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/90">
            {CATEGORY_LABEL[quote.category]}
          </span>
        </div>

        {/* Large decorative quote mark */}
        <div className="absolute right-4 top-3 select-none text-7xl font-serif leading-none text-white/15 pointer-events-none">
          &ldquo;
        </div>

        {/* Quote text */}
        <blockquote className="text-[15px] font-semibold leading-relaxed text-white/95 pr-8">
          {quote.text}
        </blockquote>

        {/* Author */}
        {quote.author && (
          <p className="mt-3 text-xs font-medium text-white/65">
            — {quote.author}
          </p>
        )}
      </div>
    </div>
  );
}
