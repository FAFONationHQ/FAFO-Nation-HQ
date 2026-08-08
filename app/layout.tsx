import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { APPLICATION_CONFIG } from "@/lib/config/application";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APPLICATION_CONFIG.canonicalOrigin),
  applicationName: APPLICATION_CONFIG.name,
  title: {
    default: APPLICATION_CONFIG.name,
    template: `%s | ${APPLICATION_CONFIG.name}`,
  },
  description:
    "FAFO Nation is a community built around accountability, resilience, loyalty, and action.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
