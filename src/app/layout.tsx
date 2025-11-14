
'use client';

import type { Metadata } from "next"
import * as React from "react";
import { Poppins, Luckiest_Guy } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
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
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1128] to-[#141b33]" />
             <motion.div
                className="absolute inset-0 opacity-50"
                style={{
                    backgroundImage: 'radial-gradient(ellipse at 70% 30%, hsla(180, 80%, 80%, 0.3), transparent 50%), radial-gradient(ellipse at 30% 20%, hsla(280, 80%, 80%, 0.3), transparent 50%)'
                }}
                animate={{
                    opacity: [0.3, 0.6, 0.3],
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
            
            {/* Added Christmas elements */}
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-white/5" style={{clipPath: 'polygon(0 100%, 100% 100%, 100% 20%, 50% 0, 0 20%)'}}></div>

            <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full">
                {/* Christmas Tree */}
                <g transform="translate(100, 350) scale(1.2)">
                    <polygon points="50,0 20,50 80,50" fill="#228B22" />
                    <polygon points="50,20 30,70 70,70" fill="#32CD32" />
                    <polygon points="50,40 40,90 60,90" fill="#008000" />
                    <rect x="45" y="90" width="10" height="20" fill="#8B4513" />
                </g>

                {/* Gifts under the tree */}
                <g transform="translate(120, 450)">
                    <rect x="0" y="0" width="20" height="20" fill="#DC143C" />
                    <rect x="8" y="-2" width="4" height="24" fill="#FFD700" />
                    <rect x="-2" y="8" width="24" height="4" fill="#FFD700" />
                </g>
                <g transform="translate(150, 460)">
                    <rect x="0" y="0" width="15" height="15" fill="#1E90FF" />
                    <rect x="6" y="-2" width="3" height="19" fill="#C0C0C0" />
                    <rect x="-2" y="6" width="19" height="3" fill="#C0C0C0" />
                </g>

                {/* Stockings by a non-existent fireplace :) */}
                <g transform="translate(650, 300)">
                    <path d="M0,0 v20 a5,5 0 0,0 5,5 h10 a5,5 0 0,0 5,-5 v-5 a10,10 0 0,1 -20,0" fill="#DC143C"/>
                    <rect x="-2" y="0" width="24" height="5" fill="white" />
                </g>
                 <g transform="translate(680, 300)">
                    <path d="M0,0 v20 a5,5 0 0,0 5,5 h10 a5,5 0 0,0 5,-5 v-5 a10,10 0 0,1 -20,0" fill="#228B22"/>
                    <rect x="-2" y="0" width="24" height="5" fill="white" />
                </g>

                {/* Santa's Sleigh and Reindeer */}
                <motion.g 
                    initial={{ x: -200 }}
                    animate={{ x: 900 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay: 2 }}
                >
                    <g transform="translate(50, 100) scale(0.5)">
                        {/* Reindeer */}
                        <path d="M50 50 C 40 30, 60 20, 70 30 L 75 60 L 65 70 L 50 60" fill="#D2B48C"/>
                        <path d="M70 30 C 80 10, 60 10, 70 30" stroke="#8B4513" strokeWidth="3" fill="none" />
                        <path d="M65 35 C 75 15, 55 15, 65 35" stroke="#8B4513" strokeWidth="3" fill="none" />
                        <circle cx="65" cy="40" r="2" fill="black"/>
                        
                        {/* Sleigh */}
                        <path d="M80 50 C 70 80, 150 90, 180 60 L 180 80 L 80 80 Z" fill="#DC143C" stroke="gold" strokeWidth="2" />
                        <rect x="75" y="80" width="110" height="5" fill="#8B4513" />

                        {/* Santa */}
                        <g transform="translate(100, 45)">
                            <circle cx="10" cy="10" r="10" fill="#FFC0CB" />
                            <circle cx="10" cy="0" r="12" fill="red"/>
                            <circle cx="10" cy="-8" r="5" fill="white"/>
                            <rect x="0" y="20" width="20" height="20" fill="red" />
                        </g>
                    </g>
                </motion.g>
            </svg>
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
      <body className={cn("font-display antialiased", poppins.variable, luckiestGuy.variable)}>
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
