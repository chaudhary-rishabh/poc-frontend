import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/context/SessionContext";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Discovery to POC",
  description: "Chat-driven discovery, doc generation, and POC preview",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full flex flex-col overflow-hidden" suppressHydrationWarning>
        <SessionProvider>
          <div className="flex h-full">
            <Sidebar />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
