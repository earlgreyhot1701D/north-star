export type View = "dashboard" | "profile" | "decision" | "report";

export const NAV_ITEMS: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "profile", label: "My Profile", icon: "◉" },
  { id: "decision", label: "New Decision", icon: "✥" },
  { id: "report", label: "Report", icon: "▤" },
];
