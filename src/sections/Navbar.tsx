
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link";
import { BrainCircuit, X, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <Link href={href} className="text-sm font-medium text-white/70 hover:text-white transition-colors">
      {children}
    </Link>
  )
}

export default function Navbar({ onThemeToggle, theme }: { onThemeToggle?: () => void; theme?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const navLinksData = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Leaderboard", href: "/leaderboard" },
  ]

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
            <span className="font-bold text-xl text-white">Tutorin</span>
            <Logo className="h-7 w-7 text-white" />
          </Link>
          
          <div className="hidden md:flex items-center justify-center flex-1">
            <nav className="flex items-center gap-8">
              {navLinksData.map((link) => (
                <AnimatedNavLink key={link.href} href={link.href}>
                  {link.label}
                </AnimatedNavLink>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-2">
             {onThemeToggle && (
                 <Button variant="ghost" size="icon" onClick={onThemeToggle} className="text-white hover:bg-white/10 hover:text-white">
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            )}
            <Link href="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Login</Button>
            </Link>
              <Link href="/signup">
                <Button className="bg-white text-black hover:bg-gray-200">Sign Up Free</Button>
            </Link>
          </div>


          <div className="md:hidden flex items-center gap-2">
               {onThemeToggle && (
                 <Button variant="ghost" size="icon" onClick={onThemeToggle} className="text-white hover:bg-white/10 hover:text-white">
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            )}
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-white hover:bg-white/10 hover:text-white">
                  {isOpen ? <X /> : <Menu />}
              </Button>
          </div>
        </div>
      </div>
      {isOpen && (
          <div className="md:hidden bg-background/95 border-t border-white/10">
              <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                  {navLinksData.map((link) => (
                    <AnimatedNavLink key={link.href} href={link.href}>
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
