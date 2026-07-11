import type { Metadata, Viewport } from "next";
import "./globals.css";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "North Star";

export const metadata: Metadata = {
  title: `${appName} — Decision Assistant`,
  description:
    "Evaluate an opportunity against your personal goals, priorities, strengths, constraints, time, and risk tolerance. Get a Decision Alignment Score for personal fit.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any" },
      { url: "/assets/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/assets/favicon-512.png",
  },
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
