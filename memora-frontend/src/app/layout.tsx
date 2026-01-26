import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "./Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memora",
  description: "Memora is a private, secure memory vault to store your photos, moments, and stories. Capture memories, relive moments, and keep them safe forever.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  keywords: [
    "Memora",
    "memory vault",
    "photo memories",
    "personal memories",
    "private gallery",
    "secure photo storage",
    "digital memories",
    "life moments",
  ],
  authors: [{ name: "Harsh Agrawal" }],
  creator: "Harsh Agrawal",
  applicationName: "Memora",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  );
}
