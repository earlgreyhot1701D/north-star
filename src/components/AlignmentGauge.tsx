"use client";

interface AlignmentGaugeProps {
  score: number;
  label: string;
  size?: number;
}

// Circular Alignment Score gauge. Conic gradient fills to the score; a dark
// core keeps it a ring. Uses role=img with a descriptive label for screen
// readers instead of relying on the visual arc.
export function AlignmentGauge({ score, label, size = 190 }: AlignmentGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div
      className="grid place-items-center rounded-full"
      role="img"
      aria-label={`Decision Alignment Score ${clamped} out of 100. ${label}.`}
      style={{
        width: size,
        height: size,
        border: "8px solid #0d0d0b",
        boxShadow: "inset 0 0 0 1px var(--brass-dim), 0 8px 20px #000",
        background: `radial-gradient(circle, #151512 0 53%, transparent 54%), conic-gradient(var(--signal) 0 ${clamped}%, #3d3a31 ${clamped}% 100%)`,
      }}
    >
      <div className="text-center">
        <strong className="block text-5xl leading-none text-signal">
          {clamped}
        </strong>
        <span className="mt-1 block text-[11px] uppercase tracking-wide text-paper-dim">
          {label}
        </span>
      </div>
    </div>
  );
}
