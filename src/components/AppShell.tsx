import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Campaigns", href: "/" },
  { label: "Audiences", href: "/audiences" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r bg-card">
        <div className="px-6 py-5 border-b">
          <span className="text-sm font-semibold tracking-wide uppercase text-foreground">
            Campaign Manager
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "block px-3 py-2 text-sm rounded-sm",
                location.pathname === item.href
                  ? "bg-accent font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 border-b bg-card flex items-center justify-between px-6 shrink-0">
          <div className="md:hidden text-sm font-semibold tracking-wide uppercase text-foreground">
            Campaign Manager
          </div>
          <div className="hidden md:block" />
          <span className="text-sm text-muted-foreground">Operator</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
