"use client";

import { Rivets } from "./Rivets";

interface HeroPanelProps {
  profileActive: boolean;
  onPrimary: () => void;
}

export function HeroPanel({ profileActive, onPrimary }: HeroPanelProps) {
  return (
    <section
      className="ns-panel ns-hero relative overflow-hidden rounded-2xl"
      aria-labelledby="hero-heading"
      style={{ minHeight: 360 }}
    >
      <Rivets />

      <div className="absolute right-3.5 top-3.5 z-[3] border border-line bg-black/70 px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide">
        <span className="text-paper">Navigator</span>
        <br />
        <span className="text-signal">
          {profileActive ? "Profile Active" : "Set Up Profile"}
        </span>
      </div>

      <div className="relative z-[2] w-[min(560px,80%)] px-6 py-16 sm:px-10">
        <h2
          id="hero-heading"
          className="m-0 text-4xl font-black leading-[0.95] sm:text-6xl"
        >
          Make better decisions with{" "}
          <span className="text-signal">structured AI reasoning.</span>
        </h2>
        <p className="mb-7 mt-6 max-w-[480px] text-lg leading-relaxed text-paper/90">
          Evaluate opportunities against what matters most to you. See the fit,
          the tradeoffs, and the next move with confidence.
        </p>
        <button type="button" className="ns-btn" onClick={onPrimary}>
          {profileActive ? "＋ New Decision" : "Get Started"}
        </button>
      </div>
    </section>
  );
}
