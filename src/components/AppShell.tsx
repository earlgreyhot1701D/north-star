"use client";

import { Sidebar } from "./Sidebar";
import type { View } from "./views";

interface AppShellProps {
  active: View;
  onNavigate: (view: View) => void;
  profileActive: boolean;
  children: React.ReactNode;
}

// Two-column shell: desktop navigation rail + main content. Collapses to a
// stacked layout with a horizontal nav on small screens.
export function AppShell({
  active,
  onNavigate,
  profileActive,
  children,
}: AppShellProps) {
  return (
    <div className="relative z-[1] mx-auto my-3.5 grid w-[min(1500px,calc(100%-24px))] gap-3.5 lg:grid-cols-[235px_1fr]">
      <Sidebar
        active={active}
        onNavigate={onNavigate}
        profileActive={profileActive}
      />
      <div className="grid content-start gap-3.5">
        <header className="flex justify-end">
          <a
            href="https://earlgreyhot1701d.github.io/Clew-Labs/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-wide text-brass hover:text-signal transition-colors"
          >
            About ↗
          </a>
        </header>
        <main className="grid content-start gap-3.5">{children}</main>
      </div>
      <footer className="ns-footer col-span-full mt-6 rounded-xl border border-line/50 px-6 py-8 text-center">
        <p className="text-xs uppercase tracking-widest text-paper-dim">
          North Star · Decision Assistant · Powered by Amazon Bedrock
        </p>
      </footer>
    </div>
  );
}
