
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link";
import { BrainCircuit, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AnimatedNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <a href={href} className="text-sm font-medium text-white/70 hover:text-white transition-colors">
      {children}
    </a>
  )
}

export default function Navbar() {
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
    { label: "Pricing", href: "#pricing" },
  ]

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-20 transition-all duration-300",
      isScrolled ? "bg-background/80 border-b border-white/10 backdrop-blur-sm" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2">
            <BrainCircuit className="h-7 w-7 text-blue-400" />
            <span className="font-bold text-xl text-white">LearnWise</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinksData.map((link) => (
              <AnimatedNavLink key={link.href} href={link.href}>
                {link.label}
              </AnimatedNavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Login</Button>
            </Link>
             <Link href="/signup">
                <Button className="bg-white text-black hover:bg-gray-200">Sign Up Free</Button>
            </Link>
          </div>

          <div className="md:hidden">
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
