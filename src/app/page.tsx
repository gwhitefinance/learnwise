
'use client';

import NewReleasePromo from '@/sections/NewReleasePromo';
import Faqs from '@/sections/Faqs';
import Footer from '@/sections/Footer';
import Navbar from '@/sections/Navbar';
import HowItWorks from '@/sections/HowItWorks';
import { ArrowRight, Star, BrainCircuit, Rocket, GraduationCap, School, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AIBuddy from '@/components/ai-buddy';
import PersonalizedTutor from '@/sections/PersonalizedTutor';
import Features from '@/sections/Features';
import { Pricing } from '@/sections/Pricing';
import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import DailyPractice from '@/sections/DailyPractice';

const InteractiveDemo = ({ theme }: { theme: string }) => {
    const [demoState, setDemoState] = useState<'notes' | 'flashcard'>('notes');

    const notesContent = `
**Cellular Respiration: Key Points**

- **Goal:** Convert glucose into ATP (energy).
- **Stages:**
  1. Glycolysis (in cytoplasm)
  2. Krebs Cycle (in mitochondria)
  3. Electron Transport Chain (in mitochondria)
- **Equation:** C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP
    `.trim();

    return (
        <div className={cn("relative w-full max-w-lg h-80 mx-auto rounded-2xl p-4", theme === 'dark' ? 'bg-black/20' : 'bg-white/50')}>
             <AnimatePresence mode="wait">
                {demoState === 'notes' ? (
                    <motion.div
                        key="notes"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full bg-card border rounded-lg p-6 flex flex-col items-center justify-center text-center"
                    >
                        <h4 className="font-semibold text-lg mb-2">Your Class Notes</h4>
                        <div className="text-left text-sm bg-muted p-4 rounded-md w-full flex-1">
                            <pre className="whitespace-pre-wrap font-sans">{notesContent}</pre>
                        </div>
                        <Button onClick={() => setDemoState('flashcard')} className="mt-4">
                            ✨ Generate Study Card
                        </Button>
                    </motion.div>
                ) : (
                     <motion.div
                        key="flashcard"
                        initial={{ opacity: 0, rotateY: -90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: 90 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full bg-card border rounded-lg p-6 flex flex-col items-center justify-center text-center"
                    >
                        <h4 className="font-semibold text-lg mb-4">What is the main goal of cellular respiration?</h4>
                        <p className="text-3xl font-bold text-primary">To convert glucose into ATP.</p>
                         <Button variant="ghost" onClick={() => setDemoState('notes')} className="mt-8 text-muted-foreground">
                           <RefreshCw className="w-4 h-4 mr-2"/> Reset Demo
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}


const Hero = ({ theme }: { theme: string }) => (
  <section className="relative py-20 lg:py-28 text-center overflow-hidden">
      <>
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-pink-500/20 rounded-full blur-3xl -z-10" />
        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-pink-500/20 rounded-full blur-3xl -z-10" />
      </>
    <div className="container mx-auto px-4 relative z-10">
      
      <h1 className={cn("text-5xl md:text-7xl font-bold tracking-tighter", theme === 'dark' ? 'text-white' : 'text-black')}>
        Reach your learning <br /> <span className="text-blue-400">goals effortlessly</span>
      </h1>
      <p className={cn("max-w-xl mx-auto mt-6 text-lg", theme === 'dark' ? 'text-white/70' : 'text-black/70')}>
        Tutorin turns your class notes, docs, and study materials into your personal AI tutor. Generate quizzes, flashcards, and get 24/7 help.
      </p>

      <div className="relative mt-8 mb-8 h-80">
          <InteractiveDemo theme={theme} />
      </div>
      
      <div className={cn("max-w-4xl mx-auto p-8 rounded-3xl", theme === 'dark' ? 'bg-black/20 border border-white/10 backdrop-blur-sm' : 'bg-white/50 border border-gray-200 shadow-lg')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col items-center gap-4">
                <div className={cn("flex items-center gap-2 font-semibold text-lg", theme === 'dark' ? 'text-white' : 'text-black')}>
                    <Rocket className="w-5 h-5" />
                    <span className="relative">
                        For Students
                    </span>
                </div>
                <Link href="/signup">
                    <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 py-6 text-base">
                        Try for Free
                    </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-1">No credit card required</p>
            </div>
            <div className="flex flex-col items-center gap-4">
                <div className={cn("flex items-center gap-2 font-semibold text-lg", theme === 'dark' ? 'text-white' : 'text-black')}>
                    <GraduationCap className="w-5 h-5" />
                    For Educators
                </div>
                <Link href="/teacher-dashboard">
                    <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base">
                        Get Started
                    </Button>
                </Link>
            </div>
            <div className="flex flex-col items-center gap-4">
                <div className={cn("flex items-center gap-2 font-semibold text-lg", theme === 'dark' ? 'text-white' : 'text-black')}>
                    <School className="w-5 h-5" />
                    For Institutions
                </div>
                <Link href="#">
                    <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-base">
                        Learn More
                    </Button>
                </Link>
            </div>
        </div>
      </div>
    </div>
  </section>
);

const plans = [
    {
        name: "Free",
        price: "0",
        yearlyPrice: "0",
        period: "month",
        features: [
            "AI Chat (10 messages/day)",
            "Practice Quizzes (3 per day)",
            "Study Roadmaps (1 active)",
            "Learning Lab (1 course)",
            "Notes & Whiteboard (10 notes)",
            "Image Analysis (5 uploads/day)",
            "Text & URL Summarizer (5 uses/day)",
        ],
        description: "Get started for free and explore the power of AI-driven learning.",
        buttonText: "Start for Free",
        href: "/signup",
        isPopular: false,
    },
    {
        name: "Pro",
        price: "9",
        yearlyPrice: "7",
        period: "month",
        features: [
            "Unlimited AI Chat",
            "Unlimited Practice Quizzes",
            "Unlimited Study Roadmaps",
            "Unlimited Learning Labs",
            "Unlimited Notes & Whiteboard",
            "Unlimited Image Analysis",
            "Unlimited Text & URL Summaries",
            "Priority Support",
        ],
        description: "Unlock your full potential with unlimited access to all features.",
        buttonText: "Go Pro",
        href: "/signup",
        isPopular: true,
    },
    {
        name: "Institution",
        price: "Contact us",
        yearlyPrice: "Contact us",
        period: "for custom pricing",
        features: [
            "Everything in Pro",
            "Campus-wide site licenses",
            "LMS Integration",
            "Dedicated onboarding & support",
        ],
        description: "Equip your entire institution with the best tools for modern learning.",
        buttonText: "Contact Sales",
        href: "/contact",
        isPopular: false,
    },
];


export default function Home() {
    const [theme, setTheme] = useState('dark');
    const toggleTheme = () => {
        setTheme(current => (current === 'dark' ? 'light' : 'dark'));
    }

  return (
    <main className={cn(
        "bg-background",
        theme === 'dark' ? 'dark-grid dark' : 'bg-white'
    )}>
      <Navbar onThemeToggle={toggleTheme} theme={theme} />
      <Hero theme={theme} />
      <HowItWorks theme={theme} />
      <PersonalizedTutor theme={theme} />
      <DailyPractice theme={theme} />
      <Features theme={theme} />
      <Pricing plans={plans} theme={theme} />
      <Faqs theme={theme} />
      <NewReleasePromo theme={theme}/>
      <Footer />
    </main>
  );
}
