'use client';

import type { Metadata } from "next"
import { Poppins, Luckiest_Guy } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import * as React from "react";
import { motion } from "framer-motion";


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

const Snowflake = ({ style }: { style: React.CSSProperties }) => (
    <motion.div
        className="absolute rounded-full bg-white"
        style={style}
        initial={{ opacity: 0 }}
        animate={{
            y: '110vh',
            opacity: [0, 1, 1, 0],
        }}
        transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
            delay: Math.random() * 5,
        }}
    />
);

const WinterWonderland = () => {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    const snowflakes = Array.from({ length: 100 }).map((_, i) => {
        const size = Math.random() * 3 + 1;
        const style = {
            left: `${Math.random() * 100}vw`,
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${Math.random() * 5}s`,
        };
        return <Snowflake key={i} style={style} />;
    });

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-indigo-900" />
            <motion.div
                className="absolute inset-0 opacity-40"
                style={{
                    backgroundImage: 'radial-gradient(ellipse at 70% 30%, hsla(180, 80%, 80%, 0.3), transparent 50%), radial-gradient(ellipse at 30% 20%, hsla(280, 80%, 80%, 0.3), transparent 50%)'
                }}
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.02, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    repeatType: 'mirror'
                }}
            />
            {snowflakes}
        </div>
    );
};


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
            <WinterWonderland />
            <main className="relative z-10">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
