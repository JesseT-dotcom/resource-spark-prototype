import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resource Spark — AI-generated dramatic play resource packs",
  description:
    "Pick a theme and get a full card list, EYLF outcomes, and instructions ready for Canva in seconds.",
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
