"use client";

import { Rivets } from "./Rivets";
import { Compass } from "./Compass";
import { NAV_ITEMS, type View } from "./views";

interface SidebarProps {
  active: View;
  onNavigate: (view: View) => void;
  profileActive: boolean;
}

export function Sidebar({ active, onNavigate, profileActive }: SidebarProps) {
  return (
    <aside
      className="ns-panel relative rounded-2xl py-4 lg:sticky lg:top-3.5 lg:self-start"
      aria-label="Primary navigation"
    >
      <Rivets />

      <div className="mx-4 mb-5 border border-brass-dim/60 px-3 py-4 text-center">
        <div className="mx-auto mb-2 flex justify-center">
          <Compass size={72} />
        </div>
        <h1 className="m-0 text-2xl font-black tracking-wider text-paper">
          North Star
        </h1>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-signal">
          Decision Assistant
        </p>
      </div>

      <nav
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1"
        aria-label="Sections"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 border-y border-y-black/40 px-4 py-4 text-left font-extrabold uppercase tracking-wide transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-signal/20 to-transparent text-signal shadow-[inset_3px_0_var(--signal)]"
                  : "text-paper hover:text-signal hover:bg-signal/10"
              }`}
            >
              <span className="w-6 text-center text-lg text-brass" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <p className="mx-4 mt-5 hidden border border-brass-dim/50 px-3 py-5 text-center text-sm uppercase leading-relaxed tracking-[0.12em] text-brass lg:block">
        Make better decisions.
        <br />
        Build your future.
      </p>

      <p className="mx-4 mt-4 hidden text-center text-[11px] uppercase tracking-widest text-paper-dim lg:block">
        {profileActive ? "Profile Active" : "No Profile Yet"}
      </p>
    </aside>
  );
}
