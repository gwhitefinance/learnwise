
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
                <g transform="translate(0, 250) scale(8)">
                  <path fill="#662113" d="M22.088 32.83c0 1.997-1.619 2.712-3.616 2.712s-3.616-.715-3.616-2.712l.904-8.136c0-1.996.715-1.808 2.712-1.808s2.712-.188 2.712 1.808z"/>
                  <path fill="#5c913b" d="M30.59 27.675c-6.294-5.392-8.843-13.112-12.118-13.112s-5.824 7.721-12.118 13.112c-2.645 2.266-1.385 3.577 2.241 3.314 3.232-.233 6.255-.966 9.877-.966s6.646.733 9.876.966c3.627.263 4.886-1.049 2.242-3.314"/>
                  <path fill="#3e721d" d="M28.546 25.538c-4.837-4.435-7.555-10.787-10.074-10.787-2.517 0-5.236 6.352-10.073 10.787-3.844 3.524 5.037 4.315 10.073 0 5.034 4.316 13.917 3.524 10.074 0"/>
                  <path fill="#5c913b" d="M28.546 21.945c-4.837-4.143-7.555-10.077-10.074-10.077-2.517 0-5.236 5.934-10.073 10.077-3.844 3.292 5.037 4.031 10.073 0 5.034 4.032 13.917 3.292 10.074 0"/>
                  <path fill="#3e721d" d="M26.336 19.003c-3.775-3.235-5.897-7.868-7.864-7.868-1.965 0-4.088 4.632-7.864 7.868-3 2.57 3.932 3.147 7.864 0 3.93 3.146 10.865 2.57 7.864 0"/>
                  <path fill="#5c913b" d="M26.336 16.311c-3.775-3.235-5.897-7.867-7.864-7.867-1.965 0-4.088 4.632-7.864 7.867-3 2.571 3.932 3.147 7.864 0 3.93 3.147 10.865 2.571 7.864 0"/>
                  <path fill="#3e721d" d="M24.818 13.92c-3.047-2.61-4.76-6.349-6.347-6.349-1.586 0-3.299 3.739-6.347 6.349-2.422 2.075 3.174 2.54 6.347 0 3.174 2.54 8.77 2.075 6.347 0"/>
                  <path fill="#5c913b" d="M24.818 11.894c-3.047-2.61-4.76-6.349-6.347-6.349-1.586 0-3.299 3.739-6.347 6.349-2.422 2.075 3.174 2.54 6.347 0 3.174 2.54 8.77 2.075 6.347 0"/>
                  <path fill="#3e721d" d="M23.301 8.911C20.983 6.925 19.68 4.08 18.472 4.08s-2.511 2.845-4.83 4.831c-1.843 1.579 2.415 1.933 4.83 0 2.414 1.933 6.673 1.579 4.829 0"/>
                  <path fill="#5c913b" d="M23.301 7.832C20.983 5.845 19.68 3 18.472 3s-2.511 2.845-4.83 4.832c-1.843 1.579 2.415 1.933 4.83 0 2.414 1.932 6.673 1.578 4.829 0"/><circle cx="16.5" cy="12.042" r="1.5" fill="#ffcc4d"/><circle cx="20" cy="25" r="2" fill="#ffcc4d"/><circle cx="22.5" cy="15.5" r="2.5" fill="#dd2e44"/><circle cx="10" cy="26" r="2" fill="#dd2e44"/><circle cx="14" cy="19" r="2" fill="#a6d388"/><circle cx="26" cy="23" r="2" fill="#a6d388"/><path fill="#ffac33" d="M19.379 1.679c.143.275.512.549.817.609l1.379.269c.305.06.377.29.159.512l-.983 1.004c-.217.222-.365.657-.326.965l.17 1.394c.038.309-.159.448-.438.31L18.9 6.117c-.279-.138-.738-.144-1.02-.013l-1.274.594c-.282.13-.476-.014-.43-.322l.205-1.39c.045-.307-.091-.745-.302-.973l-.959-1.027c-.212-.227-.135-.457.172-.508l1.385-.234c.307-.051.681-.316.832-.588L18.19.427c.151-.272.394-.269.537.006z"/>
                </g>

                {/* Gifts under the tree */}
                <g transform="translate(160, 455)">
                    <rect x="0" y="0" width="20" height="20" fill="#DC143C" />
                    <rect x="8" y="-2" width="4" height="24" fill="#FFD700" />
                    <rect x="-2" y="8" width="24" height="4" fill="#FFD700" />
                </g>
                <g transform="translate(190, 465)">
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
                <g transform="translate(600, 420) scale(3.0)">
                    <circle cx="18" cy="26" r="10" fill="#e1e8ed"/><path fill="#e1e8ed" d="M12 11a6 6 0 1 1 12 0 6 6 0 0 1-12 0"/><path fill="#414042" d="M23 6a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2z"/><path fill="#231f20" d="M25 7a1 1 0 0 1-1 1H12a1 1 0 0 1 0-2h12a1 1 0 0 1 1 1"/><path fill="#dd2e44" d="M22.5 15h-9a1.495 1.495 0 0 0-.5 2.908V25a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-7h6.5a1.5 1.5 0 1 0 0-3"/><path fill="#414042" d="M19 24a1 1 0 1 1-1.998.002A1 1 0 0 1 19 24m0 5a1 1 0 1 1-1.998.002A1 1 0 0 1 19 29"/><path fill="#f4900c" d="M19 12a1 1 0 1 1-1.998.002A1 1 0 0 1 19 12"/><path fill="#414042" d="M16 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0m6 0a1 1 0 1 1-2 0 1 1 0 1 1 2 0"/><path fill="#ffac33" d="m10.394 20.081-3.452-1.479-.547-2.866a1 1 0 0 0-1.965.375l.294 1.54-1.33-.57a.999.999 0 1 0-.788 1.838l.743.318-1.056 1.056a.999.999 0 1 0 1.414 1.414l1.621-1.621 4.278 1.833a.999.999 0 1 0 .788-1.838m22.922-3.03-1.465-.488.855-.855a.999.999 0 1 0-1.414-1.414l-.751.751-.572-2.287a.999.999 0 1 0-1.939.486l.862 3.45-3.6 3.6a.999.999 0 1 0 1.415 1.413l3.563-3.563 2.413.805a.999.999 0 1 0 .633-1.898"/>
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
