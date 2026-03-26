import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bar Cachón - Menú Digital",
  description:
    "Restaurante Bar Cachón - Carta digital con pintxos, hamburguesas y bebidas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
