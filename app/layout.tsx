import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "pakli.com - Аварии и прекъсвания в България",
  description: "Информация за прекъсвания на комунални услуги в България",
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css"
          integrity="sha384-KiZ1vNUaGyB4HgYZgq6oH/jfsvV0o8BpEvgnx74nLUg1X9cn+U2vS43WwI/dUCPV"
        />
      </head>
      <body className={inter.className}>
        {children}

        <Script
          src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js"
          integrity="sha384-cJpbHTbfOVBHOzrE4gMSSa+cp3NQUXGjA8opVLvT7gCm1jLgyd++6jSTOOpNlB1V"
          strategy="lazyOnload"
        />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 3000,
            closeButton: true,
            className: "bg-white text-black shadow-lg",
            style: {
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
