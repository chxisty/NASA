import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FirePulse – AI-Powered Wildfire Intelligence & Environmental Monitoring",
  description: "NASA-data-powered environmental monitoring platform combining MODIS and VIIRS satellite active fire observations with ML anomaly detection.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="bg-[#0B1220] text-slate-100 min-h-screen antialiased selection:bg-orange-500/30 selection:text-orange-200">
        {children}
      </body>
    </html>
  );
}
