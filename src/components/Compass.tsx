// CSS/SVG compass-rose mark. Replaces the reference file's embedded base64
// imagery with a lightweight, scalable, brass-and-signal treatment.
export function Compass({ size = 74 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="North Star compass"
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id="ns-compass-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1d6789" />
          <stop offset="60%" stopColor="#0b5f86" />
          <stop offset="100%" stopColor="#0b3b52" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#13130f" stroke="#a78a58" strokeWidth="3" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#6f6249" strokeWidth="1.5" />
      {/* Four-point compass star */}
      <polygon
        points="50,10 57,43 90,50 57,57 50,90 43,57 10,50 43,43"
        fill="url(#ns-compass-core)"
        stroke="#a78a58"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="6" fill="#22a8e0" />
      <circle cx="50" cy="50" r="6" fill="none" stroke="#cdefff" strokeWidth="1" />
    </svg>
  );
}
