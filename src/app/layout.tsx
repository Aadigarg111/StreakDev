import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/app/service-worker-register";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-rounded",
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  applicationName: "Devlingo",
  title: "StreakDev",
  description: "A gamified coding-practice platform for streaks, XP, and live battles.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Devlingo",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#58CC02" },
    { media: "(prefers-color-scheme: dark)", color: "#1CB0F6" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="antialiased">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
