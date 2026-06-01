import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/components/auth/AuthProvider";
import { I18nProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DiplomatiQ - The Operating System for Model United Nations",
  description: "The premier SaaS platform for MUN programs. AI-powered assessments, delegate training, conference management, and gamified achievements for the next generation of diplomats.",
  keywords: ["MUN", "Model United Nations", "diplomacy", "delegate training", "conferences", "education", "SaaS", "assessments", "gamification"],
  authors: [{ name: "DiplomatiQ" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "DiplomatiQ - The Operating System for Model United Nations",
    description: "Train delegates, manage conferences, and build diplomatic excellence with AI-powered tools",
    siteName: "DiplomatiQ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <I18nProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
