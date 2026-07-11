import { Rivets } from "./Rivets";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "aside";
  ariaLabelledby?: string;
}

// Riveted metal panel wrapper used across the app.
export function Panel({
  children,
  className = "",
  as: Tag = "section",
  ariaLabelledby,
}: PanelProps) {
  return (
    <Tag
      className={`ns-panel p-5 sm:p-6 ${className}`}
      aria-labelledby={ariaLabelledby}
    >
      <Rivets />
      {children}
    </Tag>
  );
}
