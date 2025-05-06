import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mermaid Diagramer",
  description: "Create beautiful diagrams with Mermaid",
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
