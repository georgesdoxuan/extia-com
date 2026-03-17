import type { Metadata } from "next";
import { Caveat_Brush, Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const logoScript = Caveat_Brush({
  subsets: ["latin"],
  variable: "--font-logo-script",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Extia'Com",
  description:
    "Génère des contenus (idées clés, article SEO, carousel LinkedIn) à partir de vidéos YouTube Extia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${montserrat.variable} ${logoScript.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
