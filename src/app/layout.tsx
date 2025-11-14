'use client';

import type { Metadata } from "next"
import { Poppins, Luckiest_Guy } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import * as React from "react";

const poppins = Poppins({ 
  subsets: ["latin"],
  variable: "--font-display",
  weight: ['400', '500', '600', '700']
})

const luckiestGuy = Luckiest_Guy({
  subsets: ["latin"],
  variable: "--font-bubble",
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-display antialiased relative bg-[#0a1128]", poppins.variable, luckiestGuy.variable)}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
          >
            <main className="relative z-10">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
