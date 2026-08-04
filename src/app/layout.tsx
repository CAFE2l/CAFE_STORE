import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import GlobalErrorLogger from "@/components/ui/GlobalErrorLogger";
import "react-phone-number-input/style.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAFÉ STORE",
  description:
    "Sites, landing pages, web aplicacoes e apoios simbolicos da marca CAFÉ.",
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
};

const gaId = process.env.NEXT_PUBLIC_GA_ID ?? "G-D1MCWTVEL5";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="font-sans"
    >
      <body>
        {children}
        <GlobalErrorLogger />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}
        </Script>
      </body>
    </html>
  );
}
