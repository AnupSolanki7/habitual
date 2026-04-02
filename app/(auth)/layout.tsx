import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 p-10 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-white/5" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl relative z-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Zap className="h-5 w-5 text-white" />
          </div>
          Habi2ual
        </Link>

        {/* Quote */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <blockquote className="space-y-4">
            <p className="text-3xl font-bold leading-snug">
              &ldquo;We are what we
              <br />
              repeatedly do.
              <br />
              Excellence, then,
              <br />
              is not an act
              <br />
              but a habit.&rdquo;
            </p>
            <footer className="text-violet-200 font-medium">— Aristotle</footer>
          </blockquote>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 relative z-10">
          {[
            { value: "10K+", label: "Active users" },
            { value: "500K+", label: "Habits tracked" },
            { value: "98%", label: "Satisfaction" },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl bg-white/10 p-4 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-violet-200 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-8 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text">Habi2ual</span>
        </Link>

        <div className="w-full max-w-sm animate-slide-up">
          {children}
        </div>
      </div>
    </div>
  );
}
