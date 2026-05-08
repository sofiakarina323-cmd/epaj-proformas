import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import LayoutClient from "@/components/LayoutClient";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "EPAJ - Sistema de Proformas",
  description: "Sistema de gestión de proformas EPAJ Ingeniería Acústica & Sonido",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`h-full ${jakarta.variable}`} suppressHydrationWarning>
      <body className="h-full">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
