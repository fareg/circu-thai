import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "CircuThai",
  description:
    "Programmation d'exercices de drainage lymphatique avec guidage audio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={display.variable}>
      <body className="app-shell">{children}</body>
    </html>
  );
}
