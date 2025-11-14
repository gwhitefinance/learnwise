
'use client';

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
            {snowflakes}
            
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-white/5" style={{clipPath: 'polygon(0 100%, 100% 100%, 100% 20%, 50% 0, 0 20%)'}}></div>

            <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full">
                {/* Christmas Tree */}
                <g transform="translate(100, 320) scale(1.2)">
                    {/* Trunk */}
                    <path d="M 45 130 L 55 130 L 60 145 L 40 145 Z" fill="#8B4513" />

                    {/* Tree Body */}
                    <g fill="#228B22" stroke="#166534" strokeWidth="2.5" strokeLinejoin="round">
                        {/* Bottom Layer */}
                        <path d="M 0 130 C 10 120, 90 120, 100 130 L 50 140 Z" transform="translate(0, -10)" />
                        {/* Mid-Bottom Layer */}
                        <path d="M 10 105 C 20 95, 80 95, 90 105 L 50 120 Z" transform="translate(0, -10)" />
                        {/* Mid-Top Layer */}
                        <path d="M 25 80 C 30 70, 70 70, 75 80 L 50 95 Z" transform="translate(0, -10)" />
                        {/* Top Layer */}
                        <path d="M 35 60 C 40 50, 60 50, 65 60 L 50 75 Z" transform="translate(0, -10)" />
                    </g>
                    
                    {/* Garlands */}
                    <g stroke="#C12828" strokeWidth="3" fill="none">
                        <path d="M 30 85 Q 50 90, 70 85" />
                        <path d="M 15 105 Q 50 115, 85 105" />
                        <path d="M 5 125 Q 50 135, 95 125" />
                    </g>
                    
                    {/* Ornaments */}
                    <g>
                        {/* Red Ornaments */}
                        <circle cx="50" cy="58" r="5" fill="#E53E3E" /><circle cx="50" cy="56" r="1" fill="#4A5568"/>
                        <circle cx="28" cy="103" r="5" fill="#E53E3E" /><circle cx="28" cy="101" r="1" fill="#4A5568"/>
                        <circle cx="72" cy="103" r="5" fill="#E53E3E" /><circle cx="72" cy="101" r="1" fill="#4A5568"/>
                        <circle cx="50" cy="108" r="6" fill="#E53E3E" /><circle cx="50" cy="106" r="1" fill="#4A5568"/>
                        <circle cx="18" cy="123" r="6" fill="#E53E3E" /><circle cx="18" cy="121" r="1" fill="#4A5568"/>
                        <circle cx="82" cy="123" r="6" fill="#E53E3E" /><circle cx="82" cy="121" r="1" fill="#4A5568"/>
                        {/* Yellow Ornaments */}
                        <circle cx="35" cy="83" r="5" fill="#FBBF24" /><circle cx="35" cy="81" r="1" fill="#4A5568"/>
                        <circle cx="65" cy="83" r="5" fill="#FBBF24" /><circle cx="65" cy="81" r="1" fill="#4A5568"/>
                        <circle cx="50" cy="88" r="4" fill="#FBBF24" /><circle cx="50" cy="86" r="1" fill="#4A5568"/>
                        <circle cx="10" cy="105" r="5" fill="#FBBF24" /><circle cx="10" cy="103" r="1" fill="#4A5568"/>
                        <circle cx="90" cy="105" r="5" fill="#FBBF24" /><circle cx="90" cy="103" r="1" fill="#4A5568"/>
                        <circle cx="35" cy="128" r="4" fill="#FBBF24" /><circle cx="35" cy="126" r="1" fill="#4A5568"/>
                        <circle cx="65" cy="128" r="4" fill="#FBBF24" /><circle cx="65" cy="126" r="1" fill="#4A5568"/>
                    </g>

                    {/* Star */}
                    <g transform="translate(50, 25) scale(1.5)">
                        <polygon points="0,-10 2.94,-4.05 9.51,-3.09 4.76,1.55 5.88,8.09 0,5 -5.88,8.09 -4.76,1.55 -9.51,-3.09 -2.94,-4.05" fill="#FBBF24" stroke="#F59E0B" strokeWidth="0.5"/>
                    </g>
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

                {/* Stockings */}
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

                {/* Snowman */}
                <g transform="translate(600, 420) scale(0.8)">
                  <circle cx="50" cy="50" r="30" fill="white" />
                  <circle cx="50" cy="0" r="20" fill="white" />
                  <rect x="48" y="0" width="4" height="20" fill="#D2691E" transform="rotate(45 50 0)"/>
                  <circle cx="45" cy="-5" r="2" fill="black" />
                  <circle cx="55" cy="-5" r="2" fill="black" />
                  <circle cx="50" cy="35" r="2.5" fill="black" />
                  <circle cx="50" cy="50" r="2.5" fill="black" />
                  <circle cx="50" cy="65" r="2.5" fill="black" />
                </g>
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
      <body className={cn("font-display antialiased bg-[#0a1128]", poppins.variable, luckiestGuy.variable)}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            <WinterWonderland />
            <main className="relative z-10">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
