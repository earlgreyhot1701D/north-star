"use client";

import { Rivets } from "./Rivets";

interface HeroPanelProps {
  profileActive: boolean;
  onPrimary: () => void;
}

export function HeroPanel({ profileActive, onPrimary }: HeroPanelProps) {
  return (
    <section
      className="ns-panel relative overflow-hidden rounded-2xl"
      aria-labelledby="hero-heading"
      style={{
        minHeight: 360,
        background:
          "linear-gradient(90deg, rgba(12,12,10,0.94) 0%, rgba(12,12,10,0.7) 46%, rgba(11,95,134,0.18) 100%), radial-gradient(circle at 82% 30%, rgba(34,168,224,0.28), transparent 42%), radial-gradient(circle at 88% 68%, rgba(167,138,88,0.22), transparent 40%), linear-gradient(135deg, #14140f, #0c0c0a)",
      }}
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
