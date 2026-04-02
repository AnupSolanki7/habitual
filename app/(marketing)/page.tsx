import Link from "next/link";
import {
  Zap, CheckCircle2, BarChart3, Bell, ArrowRight,
  Flame, Target, Calendar, Sparkles, TrendingUp, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Target,
    title: "Smart Habit Tracking",
    description: "Track yes/no, count, and duration habits with flexible daily, weekly, or custom schedules.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Flame,
    title: "Streak Motivation",
    description: "Build momentum with streak tracking. See your current and longest streaks at a glance.",
    color: "from-orange-500 to-rose-500",
  },
  {
    icon: BarChart3,
    title: "Insightful Analytics",
    description: "Visualize your progress with completion rates, weekly summaries, and habit breakdowns.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Bell,
    title: "In-App Reminders",
    description: "Get daily reminder notifications inside the app. Never forget a habit again.",
    color: "from-amber-500 to-yellow-500",
  },
  {
    icon: Calendar,
    title: "Calendar Heatmap",
    description: "See your completion history in a beautiful monthly heatmap calendar.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: TrendingUp,
    title: "Mood & Journal",
    description: "Log your mood and daily reflections alongside your habit tracking.",
    color: "from-pink-500 to-rose-500",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b glass sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-sm">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text">Habi2ual</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 border-0 shadow-sm"
              asChild
            >
              <Link href="/register">Get started free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-indigo-50/50 dark:from-violet-950/20 dark:via-background dark:to-indigo-950/10 pointer-events-none" />
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-violet-400/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

        <div className="container relative py-24 text-center">
          <Badge
            variant="secondary"
            className="mb-6 px-4 py-1.5 rounded-full text-sm border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Free to start — no credit card needed
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Build habits that
            <br />
            <span className="gradient-text">actually stick</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Habi2ual helps you create, track, and analyze your daily habits with
            smart reminders, streak tracking, and beautiful analytics — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 border-0 shadow-lg shadow-violet-500/25 px-8"
              asChild
            >
              <Link href="/register">
                Start for free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              Loved by habit builders everywhere
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Everything you need</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Powerful tools to help you build consistency and track what matters most.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="rounded-2xl border bg-card p-6 hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-br ${color} p-3 mb-4 shadow-sm`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-base mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Simple pricing</h2>
          <p className="text-muted-foreground text-lg">Start free. Upgrade when you&apos;re ready.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border bg-card p-7">
            <h3 className="text-xl font-bold mb-1">Free</h3>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground mb-7">
              {["Up to 3 active habits", "Streak tracking", "Basic analytics", "In-app reminders", "Mood & journal"].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/register">Get started free</Link>
            </Button>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-violet-500 bg-card p-7 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 px-4 py-0.5 shadow-sm">
                <Sparkles className="mr-1.5 h-3 w-3" />
                Most Popular
              </Badge>
            </div>
            <h3 className="text-xl font-bold mb-1">Pro</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold">$5</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <p className="text-xs text-muted-foreground mb-5">Billing coming soon</p>
            <ul className="space-y-3 text-sm text-muted-foreground mb-7">
              {[
                "Unlimited habits",
                "Advanced analytics",
                "Priority support",
                "Everything in Free",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-violet-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 border-0"
              disabled
            >
              Coming soon
            </Button>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="container pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 p-10 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to build better habits?</h2>
          <p className="text-violet-100 mb-7 max-w-md mx-auto">
            Join thousands of people who use Habi2ual to track their progress every day.
          </p>
          <Button size="lg" variant="secondary" className="px-8 shadow-lg" asChild>
            <Link href="/register">
              Start for free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-600">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-foreground">Habi2ual</span>
          </div>
          <p>© {new Date().getFullYear()} Habi2ual. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
