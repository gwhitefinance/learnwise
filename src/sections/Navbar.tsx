

"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link";
import { BrainCircuit, X, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { useTheme } from 'next-themes'

const AnimatedNavLink = ({ href, children, theme, isScrolled }: { href: string; children: React.ReactNode; theme: string; isScrolled: boolean }) => {
  return (
    <Link href={href} className={cn("text-sm font-medium transition-colors", isScrolled || theme === 'dark' ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black')}>
      {children}
    </Link>
  )
}

export default function Navbar({ theme = 'dark' }: { theme?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentTheme = resolvedTheme || theme;


  const navLinksData = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Leaderboard", href: "/leaderboard" },
  ]

  const navTextColor = isScrolled || currentTheme === 'dark' ? 'text-white' : 'text-black';
  const navIconHover = isScrolled || currentTheme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10';

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-20 transition-all duration-300",
      isScrolled ? "pt-2" : "pt-0"
    )}>
      <div className="container mx-auto px-4">
        <div className={cn(
            "flex items-center justify-between h-20 transition-all duration-300",
            isScrolled ? "bg-black/50 border border-white/10 rounded-2xl px-4 backdrop-blur-md" : "bg-transparent border-transparent px-0"
        )}>
          <Link href="/" className="flex items-center gap-2">
            <span className={cn("font-bold text-xl", navTextColor)}>Tutorin</span>
            <Logo className={cn("h-7 w-7", navTextColor)} />
          </Link>
          
          <div className="hidden md:flex items-center justify-center flex-1">
            <nav className="flex items-center gap-8">
              {navLinksData.map((link) => (
                <AnimatedNavLink key={link.href} href={link.href} theme={currentTheme} isScrolled={isScrolled}>
                  {link.label}
                </AnimatedNavLink>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')} className={cn(navTextColor, navIconHover, 'hover:'+navTextColor)}>
                {currentTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link href="/login">
                <Button variant="ghost" className={cn(navTextColor, navIconHover, 'hover:'+navTextColor)}>Login</Button>
            </Link>
              <Link href="/signup">
                <Button className="bg-white text-black hover:bg-gray-200">Sign Up Free</Button>
            </Link>
          </div>


          <div className="md:hidden flex items-center gap-2">
               <Button variant="ghost" size="icon" onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')} className={cn(navTextColor, navIconHover, 'hover:'+navTextColor)}>
                {currentTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className={cn(navTextColor, navIconHover, 'hover:'+navTextColor)}>
                  {isOpen ? <X /> : <Menu />}
              </Button>
          </div>
        </div>
      </div>
      {isOpen && (
          <div className="md:hidden bg-background/95 border-t border-white/10">
              <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                  {navLinksData.map((link) => (
                    <AnimatedNavLink key={link.href} href={link.href} theme={currentTheme} isScrolled={isScrolled}>
                      {link.label}
                    </AnimatedNavLink>
                  ))}
                  <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                       <Link href="/login">
                          <Button variant="ghost" className="w-full text-white hover:bg-white/10 hover:text-white">Login</Button>
                      </Link>
                       <Link href="/signup">
                          <Button className="w-full bg-white text-black hover:bg-gray-200">Sign Up Free</Button>
                      </Link>
                  </div>
              </div>
          </div>
      )}
    </header>
  )
}
