import type { Metadata } from "next";
import "./globals.css";
import { Raleway } from "next/font/google";

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-raleway",
  weight: ["300", "400", "500", "600", "700"],
});

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
  return (
    <html lang="es" suppressHydrationWarning className={raleway.variable}>
      <body
        className={`min-h-screen bg-white antialiased ${raleway.className}`}
      >
        {children}
      </body>
    </html>
  );
}
