/*
 * OS-Folder-Icons
 * Copyright (C) 2025 Amin Shariati
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono, Recursive } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/shared/Providers";
import GoogleAnalytics from "@/components/shared/GoogleAnalytics";
import { ActivationBanner } from "@/components/ui/ActivationBanner";
import { getSettings } from "@/lib/db";
import Clarity from "@/components/shared/Clarity";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Faster text rendering
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const recursive = Recursive({
  subsets: ["latin"],
  variable: "--font-recursive",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HDPick - Custom Folder Icons & Photo Frames",
  description: "Generate custom folder icons, browse premium bundles, or create photo frames for your desktop. Personalize your digital workspace with HDPick.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical origins for faster resource loading */}
        <link rel="preconnect" href="https://apis.google.com" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for analytics (loaded lazily but good to prefetch) */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${recursive.variable} antialiased min-h-screen bg-gray-50 dark:bg-gray-900`}
      >
        <Providers>
          <GoogleAnalytics id={settings.tracking?.googleAnalyticsCode} />
          <Clarity projectId={settings.tracking?.clarityCode} />
          <Navbar />
          <ActivationBanner />
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

