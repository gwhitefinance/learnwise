

'use client'

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

const AnimatedNavLink = ({ href, children, isActive, theme }: { href: string; children: React.ReactNode; isActive?: boolean, theme: string }) => {
  return (
    <Link href={href} className={cn(
        "text-sm font-medium transition-colors px-4 py-2 rounded-full", 
        isActive ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-black') : (theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black')
      )}>
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

  const currentTheme = mounted ? theme : 'light';

  const navLinksData = [
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Leaderboard", href: "/leaderboard" },
  ]

  const navTextColor = currentTheme === 'dark' ? 'text-white' : 'text-black';
  const navIconHover = currentTheme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10';

  const renderThemeToggle = () => {
    if (!mounted) {
      return <div className="h-9 w-9" />; // Placeholder
    }
    return (
      <Button variant="ghost" size="icon" onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')} className={cn(navIconHover, 'rounded-full', currentTheme === 'dark' ? 'text-white hover:text-white' : 'text-black hover:text-black')}>
        {currentTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    );
  }

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-20 transition-all duration-300",
      isScrolled ? "pt-2" : "pt-4"
    )}>
      <div className="container mx-auto px-4">
        <div className={cn(
            "flex items-center justify-between h-20 transition-all duration-300 px-4",
             isScrolled ? (currentTheme === 'dark' ? "bg-black/50 border border-white/10 rounded-2xl backdrop-blur-md" : "bg-white/50 border border-gray-200/50 rounded-2xl backdrop-blur-md") : ""
        )}>
           <div className="flex items-center gap-2 w-1/4">
                <Link href="/" className="flex items-center gap-2">
                    <Logo className={cn("h-32 w-32 transition-transform duration-300", isScrolled ? "translate-y-4" : "translate-y-3.5")} />
                </Link>
            </div>
          
          <div className="hidden md:flex items-center justify-center w-1/2">
             <div className={cn("border p-1 rounded-full", currentTheme === 'dark' ? 'bg-black/30 border-white/10' : 'bg-gray-100/80 border-gray-200/80')}>
                <nav className="flex items-center gap-2">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className={cn("text-sm font-medium px-4 py-2 rounded-full", currentTheme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black')}>Features <ChevronDown className="h-4 w-4 ml-1" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80">
                        <div className="grid grid-cols-2 gap-4 p-4">
                        {features.map((feature) => (
                            <Link href={feature.href} key={feature.title}>
                                <div className="p-2 rounded-lg hover:bg-muted">
                                    <div className="flex items-center gap-2">
                                        <div className="text-primary">{feature.icon}</div>
                                        <p className="font-semibold text-sm">{feature.title}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        </div>
                    </DropdownMenuContent>
                    </DropdownMenu>
                    {navLinksData.map((link) => (
                        <AnimatedNavLink key={link.label} href={link.href} theme={currentTheme || 'light'}>
                        {link.label}
                        </AnimatedNavLink>
                    ))}
                </nav>
              </div>
          </div>

          <div className="hidden md:flex items-center justify-end gap-2 w-1/4">
            {renderThemeToggle()}
            <Link href="/login">
                <Button variant="ghost" className={cn(navTextColor, currentTheme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-100', "rounded-full border", currentTheme === 'dark' ? 'border-white/10' : 'border-gray-200')}>Login</Button>
            </Link>
            <Link href="/signup">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full pulse-glow-button">
                  Get started
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
          <div className={cn("md:hidden border-t", currentTheme === 'dark' ? 'bg-black/95 border-white/10' : 'bg-white/95 border-gray-200/50')}>
              <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                  {navLinksData.map((link) => (
                    <AnimatedNavLink key={link.label} href={link.href} theme={currentTheme || 'light'}>
                      {link.label}
                    </AnimatedNavLink>
                  ))}
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-200/50">
                       <Link href="/login">
                          <Button variant="ghost" className={cn("w-full hover:bg-muted", navTextColor)}>Login</Button>
                      </Link>
                       <Link href="/signup">
                          <Button className="w-full bg-primary text-white hover:bg-primary/90 pulse-glow-button">Get started</Button>
                      </Link>
                  </div>
              </div>
          </div>
      )}
    </header>
  )
}
