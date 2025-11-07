
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link";
import { BrainCircuit, X, Menu, Sun, Moon, ChevronDown, FileText, Lightbulb, ImageIcon, FileSignature, Phone, Video, Copy, MessageSquare, Mic, Podcast, Calendar, BookOpen, GraduationCap, Gamepad2, PenSquare, GitMerge, Upload, Rocket, Users } from "lucide-react";
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
      title: "Courses",
      description: "Learn any subject with a personalized, AI-generated course.",
      icon: <GraduationCap className="h-5 w-5" />,
      href: "/dashboard/courses",
    },
    {
      title: "Practice Quizzes",
      description: "Generate quizzes on any topic, from any material.",
      icon: <Lightbulb className="h-5 w-5" />,
      href: "/dashboard/practice-quiz",
    },
    {
      title: "SAT & College Prep",
      description: "Ace the SAT and manage your college applications.",
      icon: <Rocket className="h-5 w-5" />,
      href: "/dashboard/sat-prep",
    },
    {
      title: "AI Chat & Tutor",
      description: "Get 24/7 help from your personal AI study partner.",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      title: "AI-Powered Calls",
      description: "Start a live voice call with your AI tutor for interactive help.",
      icon: <Phone className="h-5 w-5" />,
      href: "/dashboard/courses",
    },
    {
      title: "Video Explainers",
      description: "Generate short, animated videos to visualize complex topics.",
      icon: <Video className="h-5 w-5" />,
      href: "/dashboard/courses",
    },
    {
      title: "Podcast Studio",
      description: "Turn your study materials into on-the-go audio lessons.",
      icon: <Podcast className="h-5 w-5" />,
      href: "/dashboard/podcasts",
    },
    {
      title: "Learning Squads",
      description: "Collaborate with friends, share resources, and study together.",
      icon: <Users className="h-5 w-5" />,
      href: "/dashboard/learning-squad",
    },
    {
      title: "Games & Gamification",
      description: "Turn study materials into fun, interactive games.",
      icon: <Gamepad2 className="h-5 w-5" />,
      href: "/dashboard/games",
    },
    {
      title: "Notes & Whiteboard",
      description: "Take smart notes, record lectures, and brainstorm visually.",
      icon: <PenSquare className="h-5 w-5" />,
      href: "/dashboard/notes/new",
    },
    {
      title: "Roadmaps & Calendar",
      description: "Let AI build you a personalized study plan and schedule.",
      icon: <GitMerge className="h-5 w-5" />,
      href: "/dashboard/roadmaps",
    },
    {
      title: "Upload Anything",
      description: "Analyze images, docs, or URLs to get instant help.",
      icon: <Upload className="h-5 w-5" />,
      href: "/dashboard/upload",
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
                      <DropdownMenuContent className="w-[550px] p-4 grid grid-cols-2 gap-4">
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
                <Button className={cn(
                    "transition-colors",
                    isScrolled || theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-blue-500 text-white hover:bg-blue-600'
                )}>
                  Sign Up Free
                </Button>
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
