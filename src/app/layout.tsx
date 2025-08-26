import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProviderComponent } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Nexus - AI-Powered Productivity Platform",
  description: "Transform chaos into clarity with intelligent scheduling, collaborative chat, and goal-oriented AI assistants.",
  keywords: ["Nexus", "Productivity", "AI", "Scheduling", "Goals", "Team Collaboration"],
  authors: [{ name: "Nexus Team" }],
  openGraph: {
    title: "Nexus - AI-Powered Productivity Platform",
    description: "Transform chaos into clarity with intelligent scheduling, collaborative chat, and goal-oriented AI assistants.",
    url: "https://nexus-platform.com",
    siteName: "Nexus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexus - AI-Powered Productivity Platform",
    description: "Transform chaos into clarity with intelligent scheduling, collaborative chat, and goal-oriented AI assistants.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans antialiased bg-background text-foreground"
      >
        <SessionProviderComponent>
          {children}
          <Toaster />
        </SessionProviderComponent>
      </body>
    </html>
  );
}
