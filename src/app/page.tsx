
'use client';

import NewReleasePromo from '@/sections/NewReleasePromo';
import Faqs from '@/sections/Faqs';
import Footer from '@/sections/Footer';
import Navbar from '@/sections/Navbar';
import HowItWorks from '@/sections/HowItWorks';
import { ArrowRight, Star, BrainCircuit, Rocket, GraduationCap, School } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

const TypingBubble = ({ theme }: { theme: string }) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [text, setText] = useState('');
    const words = ["quizzes", "flashcards", "study plans", "tests"];
    const baseText = "Turn class notes into ";

    useEffect(() => {
        if (isDeleting) {
            if (subIndex === 0) {
                setIsDeleting(false);
                setIndex((prev) => (prev + 1) % words.length);
            } else {
                const timer = setTimeout(() => {
                    setText(words[index].substring(0, subIndex - 1));
                    setSubIndex(subIndex - 1);
                }, 100);
                return () => clearTimeout(timer);
            }
        } else {
            if (subIndex === words[index].length) {
                const holdTimer = setTimeout(() => {
                    setIsDeleting(true);
                }, 2000);
                return () => clearTimeout(holdTimer);
            } else {
                const timer = setTimeout(() => {
                    setText(words[index].substring(0, subIndex + 1));
                    setSubIndex(subIndex + 1);
                }, 150);
                return () => clearTimeout(timer);
            }
        }
    }, [subIndex, isDeleting, index]);

    return (
        <div className={cn("speech-bubble-typing", theme === 'light' && "shadow-lg")}>
            <p>
                {baseText}
                <span className="font-semibold text-blue-500">{text}</span>
                <span className="typing-cursor"></span>
            </p>
        </div>
    );
};


const Hero = ({ theme }: { theme: string }) => (
  <section className="relative py-20 lg:py-28 text-center overflow-hidden">
     {theme === 'light' && (
      <>
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-green-200/50 rounded-full blur-3xl -z-10" />
        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-200/50 rounded-full blur-3xl -z-10" />
      </>
    )}
    <div className="container mx-auto px-4 relative z-10">
      {/* Floating Icons */}
      <motion.div
        className="absolute top-[15%] left-[10%]"
        animate={{ y: [-10, 10], x: [-5, 5], rotate: [-8, 8] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <Image
          src="https://png.pngtree.com/png-vector/20240619/ourmid/pngtree-documents-folder-3d-icon-png-image_12797525.png"
          alt="3D folder icon"
          width={96}
          height={96}
          data-ai-hint="folder documents"
        />
      </motion.div>
      <motion.div
        className="absolute top-[20%] right-[12%]"
        animate={{ y: [15, -15], x: [5, -5], rotate: [5, -5] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <Image
          src="https://cdn3d.iconscout.com/3d/premium/thumb/online-test-time-3d-icon-png-download-3337507.png"
          alt="Lightbulb idea"
          width={80}
          height={80}
          data-ai-hint="quiz checklist"
        />
      </motion.div>
      <motion.div
        className="absolute bottom-[20%] left-[15%]"
        animate={{ y: [-5, 5], x: [-8, 8], rotate: [10, -10] }}
        transition={{
          duration: 9,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <Image
          src="https://cdn3d.iconscout.com/3d/premium/thumb/notes-3d-icon-png-download-5728147.png"
          alt="3D Notes Icon"
          width={112}
          height={112}
          data-ai-hint="notes organization"
        />
      </motion.div>
      <motion.div
        className="absolute bottom-[15%] right-[15%]"
        animate={{ y: [10, -10], x: [8, -8], rotate: [-3, 3] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <Image
          src="https://png.pngtree.com/png-clipart/20250130/original/pngtree-calendar-3d-icon-isolated-on-a-transparent-background-symbolizing-schedules-and-png-image_20358144.png"
          alt="Calendar icon"
          width={96}
          height={96}
          data-ai-hint="calendar schedule"
        />
      </motion.div>
      
      <div className="flex justify-center mb-8">
        <div className={cn("inline-flex items-center gap-2 rounded-full px-4 py-1", theme === 'dark' ? "bg-white/10 text-white/90" : "bg-gray-100 text-black")}>
            <span className="font-medium">Backed by</span>
            <Image src="https://brandeps.com/logo-download/C/College-Board-logo-01.png" alt="College Board Logo" width={110} height={24} className={cn(theme === 'dark' ? 'filter invert' : '')}/>
        </div>
      </div>

      <h1 className={cn("text-5xl md:text-7xl font-bold tracking-tighter", theme === 'dark' ? 'text-white' : 'text-black')}>
        Reach your learning <br /> <span className="text-blue-400">goals effortlessly</span>
      </h1>

      <div className="relative mt-8 mb-8 h-[250px]">
          <div className="absolute inset-0 flex justify-center items-center">
              <div style={{ width: '400px', height: '250px' }} className="relative">
                  <AIBuddy />
                  <div className="absolute top-1/2 -translate-y-full left-[calc(100%_-_140px)]">
                      <TypingBubble theme={theme} />
                  </div>
              </div>
          </div>
      </div>
      
      <div className={cn("max-w-4xl mx-auto p-8 rounded-3xl", theme === 'dark' ? 'bg-black/20 border border-white/10 backdrop-blur-sm' : 'bg-white/50 border border-gray-200 shadow-lg')}>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
            <div className="flex flex-col items-center gap-4">
                <div className={cn("flex items-center gap-2 font-semibold text-lg", theme === 'dark' ? 'text-white' : 'text-black')}>
                    <Rocket className="w-5 h-5" />
                    For Students
                </div>
                <Link href="/signup">
                    <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 py-6 text-base">
                        Try for Free
                    </Button>
                </Link>
            </div>
            <div className="flex flex-col items-center gap-4">
                <div className={cn("flex items-center gap-2 font-semibold text-lg", theme === 'dark' ? 'text-white' : 'text-black')}>
                    <GraduationCap className="w-5 h-5" />
                    For Educators
                </div>
                <Link href="/teacher-dashboard">
                    <Button size="lg" className="bg-[#4a2e5d] hover:bg-[#5f3a78] text-white rounded-full px-8 py-6 text-base">
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
                    <Button size="lg" className="bg-[#1abc9c] hover:bg-[#20d4b1] text-white rounded-full px-8 py-6 text-base">
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
