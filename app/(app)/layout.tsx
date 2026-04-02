import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileFabNav } from "@/components/layout/MobileFabNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background app-bg">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 md:pl-64">
        <Header />
        <main className="flex-1 min-h-0 overflow-y-auto p-4 pb-28 md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      {/* Floating FAB nav — mobile only */}
      <MobileFabNav />
    </div>
  );
}
