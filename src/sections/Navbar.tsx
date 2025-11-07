
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link";
import { BrainCircuit, X, Menu, Sun, Moon, ChevronDown, FileText, Lightbulb, ImageIcon, FileSignature, Phone, Video, Copy, MessageSquare, Mic, Podcast, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const features = [
    {
      title: "Notes AI",
      description: "Create notes from your course material in seconds.",
      icon: <FileText className="h-5 w-5" />,
      href: "/dashboard/notes/new",
    },
    {
      title: "Quizzes AI",
      description: "Create and practice with quizzes from your course material.",
      icon: <Lightbulb className="h-5 w-5" />,
      href: "/dashboard/practice-quiz",
    },
    {
      title: "Image Analysis",
      description: "Ask questions about pictures and diagrams from your notes!",
      icon: <ImageIcon className="h-5 w-5" />,
      href: "/dashboard/upload",
    },
    {
      title: "Essay Coach",
      description: "Grade your essays and get personalized feedback and suggestions!",
      icon: <FileSignature className="h-5 w-5" />,
      href: "/dashboard/college-prep/essay-coach",
    },
    {
      title: "Call with Taz",
      description: "Call Taz to discuss your study material.",
      icon: <Phone className="h-5 w-5" />,
      href: "/dashboard/courses",
    },
    {
      title: "Explainer Video",
      description: "Generate an educational video using AI.",
      icon: <Video className="h-5 w-5" />,
      href: "/dashboard/courses",
    },
    {
      title: "Flashcards AI",
      description: "Make flashcards from your course material with a single click.",
      icon: <Copy className="h-5 w-5" />,
      href: "/dashboard/key-concepts",
    },
    {
      title: "AI Tutor",
      description: "Talk to your personal AI tutor and learn in real time!",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      title: "Record Live Lecture",
      description: "Take notes and ask questions in real-time, without touching your computer!",
      icon: <Mic className="h-5 w-5" />,
      href: "/dashboard/notes/new",
    },
     {
      title: "Audio Recap",
      description: "Generate a 6-45 minute podcast, lecture, or summary from your study materials",
      icon: <Podcast className="h-5 w-5" />,
      href: "/dashboard/podcasts/record",
    },
    {
      title: "Study Calendar",
      description: "Plan your study sessions using our AI, and achieve your academic goals.",
      icon: <Calendar className="h-5 w-5" />,
      href: "/dashboard/calendar",
    }
]

const AnimatedNavLink = ({ href, children, theme, isScrolled }: { href: string; children: React.ReactNode; theme: string; isScrolled: boolean }) => {
  return (
    <Link href={href} className={cn("text-sm font-medium transition-colors", isScrolled || theme === 'dark' ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black')}>
      {children}
    </Link>
  )
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentTheme = theme;

  const navLinksData = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Leaderboard", href: "/leaderboard" },
  ]

  const navTextColor = isScrolled || currentTheme === 'dark' ? 'text-white' : 'text-black';
  const navIconHover = isScrolled || currentTheme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10';

  const renderThemeToggle = () => {
    if (!mounted) {
      return <div className="h-9 w-9" />; // Placeholder
    }
    return (
      <Button variant="ghost" size="icon" onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')} className={cn(navTextColor, navIconHover, 'hover:'+navTextColor)}>
        {currentTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    );
  }

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
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className={cn("font-bold text-xl", navTextColor)}>Tutor Taz</span>
              <Logo className={cn("h-7 w-7", navTextColor)} />
            </Link>
            <div className="hidden md:flex items-center justify-center">
                <nav className="flex items-center gap-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={cn("flex items-center gap-1 text-sm font-medium transition-colors", isScrolled || theme === 'dark' ? 'text-white/70 hover:text-white' : 'text-black/70 hover:text-black')}>
                          Features <ChevronDown className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[500px] p-4 grid grid-cols-2 gap-4">
                        {features.map((feature) => (
                          <DropdownMenuItem key={feature.title} asChild>
                            <Link href={feature.href} className="flex items-start gap-3 p-2 rounded-lg">
                              <div className="text-blue-500 mt-1">{feature.icon}</div>
                              <div>
                                <p className="font-semibold">{feature.title}</p>
                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                  {navLinksData.map((link) => (
                    <AnimatedNavLink key={link.href} href={link.href} theme={currentTheme || 'light'} isScrolled={isScrolled}>
                      {link.label}
                    </AnimatedNavLink>
                  ))}
                </nav>
            </div>
          </div>
          

          <div className="hidden md:flex items-center gap-2">
             {renderThemeToggle()}
            <Link href="/login">
                <Button variant="ghost" className={cn(navTextColor, navIconHover, 'hover:'+navTextColor)}>Login</Button>
            </Link>
              <Link href="/signup">
                <Button className="bg-white text-black hover:bg-gray-200">Sign Up Free</Button>
            </Link>
          </div>


          <div className="md:hidden flex items-center gap-2">
               {renderThemeToggle()}
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
                    <AnimatedNavLink key={link.href} href={link.href} theme={currentTheme || 'light'} isScrolled={isScrolled}>
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
