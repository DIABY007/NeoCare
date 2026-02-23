import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NeoCare - Plateforme Multi-Clinique",
  description: "Système de gestion de rendez-vous pour cliniques",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} bg-dark-950 text-white`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

