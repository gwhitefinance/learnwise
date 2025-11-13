
import type React from "react"
import type { Metadata } from "next"
import { Poppins, Luckiest_Guy } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"

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

export const metadata: Metadata = {
  title: "Tutor Taz",
  description: "Advanced AI-powered study suite for personalized learning.",
}

const WinterWonderland = () => {
    return (
        <div className="absolute inset-0 -z-10 h-screen w-screen overflow-hidden">
            <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
              {/* Starry night background */}
              <rect width="800" height="600" fill="#0a1128"/>
              
              {/* Stars */}
              <circle cx="100" cy="50" r="1.5" fill="white" opacity="0.8"/>
              <circle cx="200" cy="80" r="1" fill="white" opacity="0.9"/>
              <circle cx="350" cy="40" r="1.2" fill="white" opacity="0.7"/>
              <circle cx="500" cy="70" r="1.3" fill="white" opacity="0.8"/>
              <circle cx="650" cy="50" r="1" fill="white" opacity="0.9"/>
              <circle cx="750" cy="90" r="1.4" fill="white" opacity="0.7"/>
              <circle cx="150" cy="120" r="1" fill="white" opacity="0.8"/>
              <circle cx="400" cy="100" r="1.1" fill="white" opacity="0.9"/>
              <circle cx="600" cy="120" r="1.2" fill="white" opacity="0.7"/>
              <circle cx="250" cy="30" r="1.3" fill="white" opacity="0.8"/>
              
              {/* Northern Lights */}
              <defs>
                <linearGradient id="aurora1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#00ff88',stopOpacity:0.6}} />
                  <stop offset="50%" style={{stopColor:'#00ccff',stopOpacity:0.4}} />
                  <stop offset="100%" style={{stopColor:'#0088ff',stopOpacity:0.1}} />
                </linearGradient>
                <linearGradient id="aurora2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#ff00ff',stopOpacity:0.5}} />
                  <stop offset="50%" style={{stopColor:'#00ffff',stopOpacity:0.3}} />
                  <stop offset="100%" style={{stopColor:'#0066ff',stopOpacity:0.1}} />
                </linearGradient>
              </defs>
              
              {/* Aurora waves */}
              <path d="M 0 80 Q 200 100, 400 80 T 800 90 L 800 200 L 0 200 Z" fill="url(#aurora1)" opacity="0.7">
                <animate attributeName="d" 
                         values="M 0 80 Q 200 100, 400 80 T 800 90 L 800 200 L 0 200 Z;
                                 M 0 90 Q 200 70, 400 90 T 800 80 L 800 200 L 0 200 Z;
                                 M 0 80 Q 200 100, 400 80 T 800 90 L 800 200 L 0 200 Z"
                         dur="8s" repeatCount="indefinite"/>
              </path>
              
              <path d="M 0 120 Q 250 140, 500 120 T 800 130 L 800 250 L 0 250 Z" fill="url(#aurora2)" opacity="0.6">
                <animate attributeName="d" 
                         values="M 0 120 Q 250 140, 500 120 T 800 130 L 800 250 L 0 250 Z;
                                 M 0 130 Q 250 110, 500 130 T 800 120 L 800 250 L 0 250 Z;
                                 M 0 120 Q 250 140, 500 120 T 800 130 L 800 250 L 0 250 Z"
                         dur="10s" repeatCount="indefinite"/>
              </path>
              
              {/* Snow on ground */}
              <ellipse cx="400" cy="580" rx="450" ry="40" fill="#ffffff" opacity="0.9"/>
              <rect x="0" y="560" width="800" height="40" fill="#f0f8ff"/>
              
              {/* Santa with sled in top left - BIGGER */}
              <g id="santa-sled" transform="translate(120, 80) scale(2.5)">
                {/* Sled */}
                <path d="M -30 15 L -25 20 L 25 20 L 30 15 L 25 10 L -25 10 Z" fill="#8B4513" stroke="#654321" strokeWidth="1"/>
                <path d="M -30 15 Q -35 20, -30 25 L 30 25 Q 35 20, 30 15" fill="#CD853F"/>
                <line x1="-30" y1="15" x2="-35" y2="30" stroke="#654321" strokeWidth="2"/>
                <line x1="30" y1="15" x2="35" y2="30" stroke="#654321" strokeWidth="2"/>
                
                {/* Gifts in sled */}
                <rect x="-15" y="12" width="10" height="8" fill="#DC143C"/>
                <rect x="-8" y="10" width="8" height="10" fill="#FFD700"/>
                <rect x="3" y="13" width="9" height="7" fill="#0000CD"/>
                
                {/* Santa */}
                <ellipse cx="0" cy="8" rx="8" ry="10" fill="#DC143C"/>
                <circle cx="0" cy="0" r="6" fill="#FFE4C4"/>
                <circle cx="-2" cy="-1" r="1" fill="#000"/>
                <circle cx="2" cy="-1" r="1" fill="#000"/>
                <circle cx="0" cy="2" r="1.5" fill="#FF6B6B"/>
                <path d="M -6 -3 Q 0 -8, 6 -3" fill="#DC143C"/>
                <circle cx="0" cy="-6" r="2" fill="#ffffff"/>
                <ellipse cx="0" cy="3" rx="5" ry="3" fill="#ffffff"/>
                <rect x="-1" y="8" width="2" height="4" fill="#000000"/>
                <ellipse cx="-5" cy="10" rx="3" ry="2" fill="#DC143C"/>
                <ellipse cx="5" cy="10" rx="3" ry="2" fill="#DC143C"/>
                
                {/* Reins */}
                <line x1="-25" y1="15" x2="-40" y2="10" stroke="#8B4513" strokeWidth="1.5"/>
                <line x1="-25" y1="15" x2="-45" y2="5" stroke="#8B4513" strokeWidth="1.5"/>
                
                {/* Reindeer */}
                <g transform="translate(-50, 5)">
                  <ellipse cx="0" cy="5" rx="6" ry="4" fill="#8B4513"/>
                  <circle cx="0" cy="0" r="4" fill="#A0522D"/>
                  <line x1="-3" y1="-2" x2="-5" y2="-6" stroke="#654321" strokeWidth="1.5"/>
                  <line x1="3" y1="-2" x2="5" y2="-6" stroke="#654321" strokeWidth="1.5"/>
                  <circle cx="-1" cy="0" r="0.8" fill="#000"/>
                  <circle cx="2" cy="1" r="1.2" fill="#FF0000"/>
                </g>
              </g>
              
              {/* Christmas Tree */}
              <g transform="translate(150, 400)">
                {/* Tree trunk */}
                <rect x="-15" y="80" width="30" height="40" fill="#6B4423"/>
                
                {/* Tree layers */}
                <path d="M 0 -80 L -60 0 L -40 0 L -80 60 L -50 60 L -90 120 L 90 120 L 50 60 L 80 60 L 40 0 L 60 0 Z" fill="#0B6623"/>
                <path d="M 0 -80 L -55 0 L -35 0 L -75 60 L -45 60 L -85 120 L 85 120 L 45 60 L 75 60 L 35 0 L 55 0 Z" fill="#228B22" opacity="0.8"/>
                
                {/* Star on top */}
                <path d="M 0 -90 L -3 -78 L -15 -78 L -6 -70 L -9 -58 L 0 -66 L 9 -58 L 6 -70 L 15 -78 L 3 -78 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
                
                {/* Ornaments */}
                <circle cx="-30" cy="20" r="4" fill="#FF0000"/>
                <circle cx="35" cy="30" r="4" fill="#0000FF"/>
                <circle cx="-45" cy="50" r="4" fill="#FFD700"/>
                <circle cx="20" cy="60" r="4" fill="#FF69B4"/>
                <circle cx="-20" cy="80" r="4" fill="#00CED1"/>
                <circle cx="40" cy="90" r="4" fill="#FF4500"/>
                <circle cx="-50" cy="95" r="4" fill="#9370DB"/>
                <circle cx="0" cy="40" r="4" fill="#FF1493"/>
              </g>
              
              {/* Gift boxes */}
              <g transform="translate(100, 500)">
                <rect x="0" y="0" width="40" height="35" fill="#DC143C"/>
                <rect x="17" y="0" width="6" height="35" fill="#FFD700"/>
                <rect x="0" y="15" width="40" height="6" fill="#FFD700"/>
                <path d="M 20 0 Q 15 -8, 20 -12 Q 25 -8, 20 0" fill="#FFD700"/>
              </g>
              
              <g transform="translate(150, 520)">
                <rect x="0" y="0" width="30" height="25" fill="#228B22"/>
                <rect x="13" y="0" width="4" height="25" fill="#FFD700"/>
                <rect x="0" y="11" width="30" height="4" fill="#FFD700"/>
                <path d="M 15 0 Q 11 -5, 15 -8 Q 19 -5, 15 0" fill="#FFD700"/>
              </g>

              {/* Candy canes */}
              <g transform="translate(700, 480)">
                <path d="M 0 0 Q -8 -5, -8 -15 Q -8 -25, 0 -30 Q 8 -25, 8 -15 Q 8 -5, 0 0" fill="#ffffff" stroke="#DC143C" strokeWidth="3"/>
                <line x1="0" y1="0" x2="0" y2="20" stroke="#ffffff" strokeWidth="6"/>
                <line x1="0" y1="0" x2="0" y2="20" stroke="#DC143C" strokeWidth="3" strokeDasharray="4,4"/>
              </g>
              
              {/* Holly decorations */}
              <g transform="translate(200, 350)">
                <ellipse cx="-5" cy="0" rx="8" ry="12" fill="#0B6623" transform="rotate(-30 -5 0)"/>
                <ellipse cx="5" cy="0" rx="8" ry="12" fill="#0B6623" transform="rotate(30 5 0)"/>
                <ellipse cx="0" cy="-8" rx="8" ry="12" fill="#0B6623"/>
                <circle cx="0" cy="0" r="3" fill="#DC143C"/>
                <circle cx="-4" cy="2" r="2.5" fill="#DC143C"/>
                <circle cx="4" cy="2" r="2.5" fill="#DC143C"/>
              </g>
              
              <g transform="translate(600, 370)">
                <ellipse cx="-5" cy="0" rx="8" ry="12" fill="#0B6623" transform="rotate(-30 -5 0)"/>
                <ellipse cx="5" cy="0" rx="8" ry="12" fill="#0B6623" transform="rotate(30 5 0)"/>
                <ellipse cx="0" cy="-8" rx="8" ry="12" fill="#0B6623"/>
                <circle cx="0" cy="0" r="3" fill="#DC143C"/>
                <circle cx="-4" cy="2" r="2.5" fill="#DC143C"/>
                <circle cx="4" cy="2" r="2.5" fill="#DC143C"/>
              </g>
              
              {/* Snowman */}
              <g transform="translate(550, 440) scale(1.5)">
                <circle cx="0" cy="20" r="18" fill="#ffffff"/>
                <circle cx="0" cy="-5" r="14" fill="#ffffff"/>
                <circle cx="0" cy="-22" r="10" fill="#ffffff"/>
                <circle cx="-3" cy="-24" r="1.5" fill="#000"/>
                <circle cx="3" cy="-24" r="1.5" fill="#000"/>
                <polygon points="0,-20 3,-18 -3,-18" fill="#FF6B00"/>
                <circle cx="0" cy="20" r="2" fill="#000"/>
                <circle cx="0" cy="10" r="2" fill="#000"/>
                <circle cx="0" cy="0" r="2" fill="#000"/>
                <path d="M -12 -22 L -20 -25 L -18 -20" stroke="#654321" strokeWidth="2" fill="none"/>
                <path d="M 12 -22 L 20 -25 L 18 -20" stroke="#654321" strokeWidth="2" fill="none"/>
                <path d="M -8 -32 L 8 -32 L 10 -28 L -10 -28 Z" fill="#000000"/>
                <rect x="-10" y="-32" width="20" height="3" fill="#DC143C"/>
              </g>
              
              {/* Bells */}
              <g transform="translate(700, 380)">
                <path d="M -6 0 Q -8 8, -5 12 L 5 12 Q 8 8, 6 0 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                <circle cx="0" cy="14" r="2" fill="#FFD700"/>
                <path d="M 8 0 Q 10 8, 7 12 L 17 12 Q 20 8, 18 0 Z" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                <circle cx="12" cy="14" r="2" fill="#FFD700"/>
                <path d="M 0 -5 Q 12 -8, 12 -5" stroke="#DC143C" strokeWidth="3" fill="none"/>
              </g>
              
              {/* Stars decorations */}
              <g transform="translate(700, 300)">
                <path d="M 0 -8 L -2 -2 L -8 -2 L -3 2 L -5 8 L 0 4 L 5 8 L 3 2 L 8 -2 L 2 -2 Z" fill="#FFD700" opacity="0.9"/>
              </g>
              
              <g transform="translate(130, 250)">
                <path d="M 0 -6 L -1.5 -1.5 L -6 -1.5 L -2 1.5 L -3.5 6 L 0 3 L 3.5 6 L 2 1.5 L 6 -1.5 L 1.5 -1.5 Z" fill="#FFD700" opacity="0.9"/>
              </g>
              
              {/* Stockings on ground */}
              <g transform="translate(180, 510)">
                <rect x="0" y="0" width="15" height="25" fill="#DC143C"/>
                <rect x="0" y="25" width="20" height="15" fill="#DC143C"/>
                <rect x="0" y="0" width="15" height="5" fill="#ffffff"/>
                <circle cx="7" cy="2" r="1.5" fill="#228B22"/>
              </g>
              
              <g transform="translate(560, 515)">
                <rect x="0" y="0" width="15" height="25" fill="#228B22"/>
                <rect x="0" y="25" width="20" height="15" fill="#228B22"/>
                <rect x="0" y="0" width="15" height="5" fill="#ffffff"/>
                <circle cx="7" cy="2" r="1.5" fill="#FFD700"/>
              </g>

                {/* Falling snowflakes */}
              <circle cx="150" cy="200" r="3" fill="white" opacity="0.8">
                <animate attributeName="cy" values="-10;610" dur="8s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="320" cy="150" r="2.5" fill="white" opacity="0.9">
                <animate attributeName="cy" values="-10;610" dur="10s" repeatCount="indefinite" begin="-2s"/>
                <animate attributeName="opacity" values="0.9;0.4;0.9" dur="4s" repeatCount="indefinite"/>
              </circle>
              <circle cx="580" cy="180" r="2" fill="white" opacity="0.7">
                <animate attributeName="cy" values="-10;610" dur="9s" repeatCount="indefinite" begin="-4s"/>
                <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="450" cy="220" r="3" fill="white" opacity="0.8">
                <animate attributeName="cy" values="-10;610" dur="11s" repeatCount="indefinite" begin="-1s"/>
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="4s" repeatCount="indefinite"/>
              </circle>
              <circle cx="680" cy="250" r="2.5" fill="white" opacity="0.9">
                <animate attributeName="cy" values="-10;610" dur="7s" repeatCount="indefinite" begin="-3s"/>
                <animate attributeName="opacity" values="0.9;0.4;0.9" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="90" cy="300" r="2" fill="white" opacity="0.7">
                <animate attributeName="cy" values="-10;610" dur="12s" repeatCount="indefinite" begin="-5s"/>
                <animate attributeName="opacity" values="0.7;0.3;0.7" dur="4s" repeatCount="indefinite"/>
              </circle>
              <circle cx="720" cy="160" r="2.8" fill="white" opacity="0.8">
                <animate attributeName="cy" values="-10;610" dur="9.5s" repeatCount="indefinite" begin="-7s"/>
                <animate attributeName="opacity" values="0.8;0.2;0.8" dur="3.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="220" cy="280" r="2.2" fill="white" opacity="0.9">
                <animate attributeName="cy" values="-10;610" dur="10.5s" repeatCount="indefinite" begin="-6s"/>
                <animate attributeName="opacity" values="0.9;0.4;0.9" dur="4s" repeatCount="indefinite"/>
              </circle>
            </svg>
        </div>
    )
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-display antialiased relative", poppins.variable, luckiestGuy.variable)}>
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
