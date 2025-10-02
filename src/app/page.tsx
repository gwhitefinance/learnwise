
'use client';

import NewReleasePromo from '@/sections/NewReleasePromo';
import Faqs from '@/sections/Faqs';
import Footer from '@/sections/Footer';
import Navbar from '@/sections/Navbar';
import HowItWorks from '@/sections/HowItWorks';
import { ArrowRight, Star, BrainCircuit } from 'lucide-react';
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

const TypingBubble = () => {
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
    }, [subIndex, isDeleting, index, words]);

    return (
        <div className="speech-bubble-typing">
            <p>
                {baseText}
                <span className="font-semibold text-blue-500">{text}</span>
                <span className="typing-cursor"></span>
            </p>
        </div>
    );
};


const Hero = () => (
  <section className="relative py-20 lg:py-28 text-white text-center overflow-hidden">
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
        className="absolute bottom-[25%] left-[20%]"
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
        className="absolute bottom-[15%] right-[25%]"
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

      <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
        Reach your learning <br /> <span className="text-blue-400">goals effortlessly</span>
      </h1>

      <div className="relative mt-8 mb-8 h-[250px]">
          <div className="absolute inset-0 flex justify-center items-center">
              <div style={{ width: '400px', height: '250px' }} className="relative">
                  <AIBuddy />
                  <div className="absolute top-1/2 -translate-y-1/2 left-[calc(100%_-_20px)]">
                      <TypingBubble />
                  </div>
              </div>
          </div>
      </div>

      

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
        <div className="bg-black/80 rounded-2xl">
            <Link href="/signup">
            <Button
                size="lg"
                className="w-full sm:w-auto bg-blue-500 text-white hover:bg-blue-600 rounded-2xl text-lg h-14 border-b-4 border-black/30 transform active:translate-y-px"
            >
                Start Now
            </Button>
            </Link>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <div className="bg-gray-400 rounded-2xl">
                <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-white border-white/20 text-black hover:text-black hover:bg-gray-100 rounded-2xl text-lg h-14 border-b-4 border-black/20 transform active:translate-y-px"
                >
                    More Info
                </Button>
            </div>
          </DialogTrigger>
           <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    <div className="flex flex-col items-center text-center">
                        <BrainCircuit className="h-12 w-12 text-blue-400 mb-4" />
                        <h2 className="text-3xl font-bold mb-4">What's LearnWise?</h2>
                    </div>
                </DialogTitle>
                <DialogDescription className="sr-only">
                    LearnWise is an AI-powered tutor that helps you study smarter by turning your notes into quizzes, flashcards, and personalized study plans.
                </DialogDescription>
            </DialogHeader>
            <p className="text-muted-foreground mb-8 text-base text-center">
                We built LearnWise to make studying effortless and truly effective. It is an AI powered tutor that learns how you learn, helping you focus on the topics you need most. Whether it is quizzes, flashcards, or personalized study plans, LearnWise helps you study smarter, not harder.
            </p>
            <div className="flex flex-col items-center">
                 <Link href="/signup">
                    <Button
                        size="lg"
                        className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-full text-lg h-14"
                    >
                        Start for Free
                    </Button>
                </Link>
            </div>
          </DialogContent>
        </Dialog>
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
            "Unlimited Notes & Whiteboards",
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
  return (
    <main className="bg-background text-white dark-grid dark">
      <Navbar />
      <Hero />
      <HowItWorks />
      <PersonalizedTutor />
      <Features />
      <Pricing plans={plans} />
      <Faqs />
      <NewReleasePromo />
      <Footer />
    </main>
  );
}
