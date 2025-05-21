import React from "react";
import "@/app/globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from '@vercel/analytics/next';
import { Geist, Geist_Mono } from "next/font/google";
import { AppSidebar } from "@/components/app-sidebar";
import { ChatProvider } from "@/components/chat-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RouterChat",
  description: "RouterChat is a web-based AI chatbot interface. It utilizes Next.js for the frontend and backend and connects to OpenRouter to allow users to interact with various free AI language models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SidebarProvider>
          <ChatProvider>
            <AppSidebar />
            <main className="w-full h-[100dvh]">
              <div className="relative flex flex-col h-full">
                <SidebarTrigger className="absolute top-4 left-4 z-10 hover:cursor-pointer"/>
                {children}
              </div>
            </main>
            <Toaster />
          </ChatProvider>
        </SidebarProvider>
        <Analytics />
      </body>
    </html>
  );
}
