import type { Metadata, Viewport } from "next";
import "./globals.css";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "North Star";

export const metadata: Metadata = {
  title: `${appName} — Decision Assistant`,
  description:
    "Evaluate an opportunity against your personal goals, priorities, strengths, constraints, time, and risk tolerance. Get a Decision Alignment Score for personal fit.",
};

export const viewport: Viewport = {
  themeColor: "#11110f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
