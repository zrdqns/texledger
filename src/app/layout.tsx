import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "TexLedger — Contabilidad textil",
  description: "Gestión contable y operativa textil",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} min-h-screen bg-fondo font-sans text-texto antialiased`}>
        {children}
      </body>
    </html>
  );
}
