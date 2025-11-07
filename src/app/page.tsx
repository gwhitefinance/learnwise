

'use client';

import NewReleasePromo from '@/sections/NewReleasePromo';
import Faqs from '@/sections/Faqs';
import Footer from '@/sections/Footer';
import Navbar from '@/sections/Navbar';
import HowItWorks from '@/sections/HowItWorks';
import { ArrowRight, Star, BrainCircuit, Rocket, GraduationCap, School, RefreshCw, Upload, Search, Wand2, Loader2, BookOpen, List, Lightbulb, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { generateCrunchTimeStudyGuide, generateFlashcardsFromNote } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';


type CrunchTimeOutput = {
  title: string;
  keyConcepts: { term: string; definition: string; }[];
  summary: string;
  practiceQuiz: { question: string; options: string[]; answer: string; }[];
  studyPlan: { step: string; description: string; }[];
};

type Flashcard = {
    front: string;
    back: string;
};

const StudyGuideDisplay = ({ guide, onReset }: { guide: CrunchTimeOutput, onReset: () => void }) => {
    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    // Flashcard state
    const [showFlashcards, setShowFlashcards] = useState(false);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [isFlashcardLoading, setIsFlashcardLoading] = useState(false);
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);


    const handleGenerateFlashcards = async () => {
        setIsFlashcardLoading(true);
        try {
            const noteContent = guide.keyConcepts.map(c => `${c.term}: ${c.definition}`).join('\n');
            const result = await generateFlashcardsFromNote({
                noteContent: noteContent,
                learnerType: 'Reading/Writing'
            });
            if (result.flashcards.length > 0) {
                setFlashcards(result.flashcards);
                setShowFlashcards(true);
            } else {
                toast({ variant: 'destructive', title: 'Could not generate flashcards.' });
            }
        } catch (error) {
            console.error("Flashcard generation failed:", error);
            toast({ variant: 'destructive', title: 'Flashcard Generation Failed' });
        } finally {
            setIsFlashcardLoading(false);
        }
    };


    return (
        <motion.div
            key="study-guide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full h-auto max-w-2xl mx-auto mt-8"
        >
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Accordion type="multiple" defaultValue={['summary', 'key-concepts']} className="w-full space-y-4">
                        <AccordionItem value="summary" className="border rounded-lg bg-muted/20">
                            <AccordionTrigger className="p-4 font-semibold text-lg flex items-center gap-2">Summary</AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 text-muted-foreground border-t pt-4">{guide.summary}</AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="key-concepts" className="border rounded-lg bg-muted/20">
                            <AccordionTrigger className="p-4 font-semibold text-lg flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/>Key Concepts</AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 space-y-4 border-t pt-4">
                                {isFlashcardLoading ? (
                                     <div className="flex justify-center items-center h-48">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : showFlashcards ? (
                                    <div className="space-y-4">
                                        <div className="text-center text-sm text-muted-foreground">
                                            Card {currentFlashcardIndex + 1} of {flashcards.length}
                                        </div>
                                        <div
                                            className="relative w-full h-48 cursor-pointer"
                                            onClick={() => setIsFlipped(!isFlipped)}
                                        >
                                            <AnimatePresence>
                                                <motion.div
                                                    key={isFlipped ? 'back' : 'front'}
                                                    initial={{ rotateY: isFlipped ? 180 : 0 }}
                                                    animate={{ rotateY: 0 }}
                                                    exit={{ rotateY: isFlipped ? 0 : -180 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="absolute w-full h-full p-6 flex items-center justify-center text-center rounded-lg border bg-card text-card-foreground shadow-sm"
                                                    style={{ backfaceVisibility: 'hidden' }}
                                                >
                                                    <p className="text-xl font-semibold">
                                                        {isFlipped ? flashcards[currentFlashcardIndex].back : flashcards[currentFlashcardIndex].front}
                                                    </p>
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                        <div className="flex justify-center items-center gap-4">
                                            <Button variant="outline" size="icon" onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(prev => Math.max(0, prev - 1))}} disabled={currentFlashcardIndex === 0}>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button onClick={() => setIsFlipped(!isFlipped)}>
                                                <RefreshCw className="mr-2 h-4 w-4"/> Flip Card
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(prev => Math.min(flashcards.length - 1, prev + 1))}} disabled={currentFlashcardIndex === flashcards.length - 1}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Button variant="link" size="sm" onClick={() => setShowFlashcards(false)}>Back to list</Button>
                                    </div>
                                ) : (
                                    <>
                                        {guide.keyConcepts.map(concept => (
                                            <div key={concept.term}>
                                                <p className="font-semibold">{concept.term}</p>
                                                <p className="text-sm text-muted-foreground">{concept.definition}</p>
                                            </div>
                                        ))}
                                        <div className="pt-4 border-t">
                                            <Button onClick={handleGenerateFlashcards} disabled={isFlashcardLoading}>
                                                <Copy className="h-4 w-4 mr-2"/>
                                                {isFlashcardLoading ? 'Generating...' : 'See Flashcards'}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="study-plan" className="border rounded-lg bg-muted/20">
                            <AccordionTrigger className="p-4 font-semibold text-lg flex items-center gap-2"><List className="h-5 w-5 text-primary"/>Action Plan</AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 space-y-4 border-t pt-4">
                                {guide.studyPlan.map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">{i + 1}</div>
                                        <div>
                                            <p className="font-semibold">{step.step}</p>
                                            <p className="text-sm text-muted-foreground">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="practice-quiz" className="border rounded-lg bg-muted/20">
                            <AccordionTrigger className="p-4 font-semibold text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary"/>Practice Quiz</AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 space-y-6 border-t pt-4">
                                {guide.practiceQuiz.map((q, qIndex) => {
                                    const isCorrect = quizAnswers[qIndex] === q.answer;
                                    return (
                                    <div key={qIndex} className="space-y-3">
                                        <p className="font-semibold">{qIndex + 1}. {q.question}</p>
                                        <RadioGroup value={quizAnswers[qIndex]} onValueChange={(val) => setQuizAnswers(prev => ({...prev, [qIndex]: val}))} disabled={submitted}>
                                            {q.options.map((opt, oIndex) => (
                                                <Label key={oIndex} className={cn("flex items-center gap-3 p-3 border rounded-md cursor-pointer", submitted && (opt === q.answer ? 'border-green-500 bg-green-500/10' : (quizAnswers[qIndex] === opt ? 'border-red-500 bg-red-500/10' : '')) )}>
                                                    <RadioGroupItem value={opt} />
                                                    {opt}
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                        {submitted && !isCorrect && <p className="text-sm text-red-500">Correct answer: {q.answer}</p>}
                                    </div>
                                )})}
                                <Button onClick={() => setSubmitted(true)} disabled={submitted}>Check Answers</Button>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <Button variant="ghost" onClick={onReset} className="w-full text-muted-foreground">
                        <RefreshCw className="w-4 h-4 mr-2"/> Start Over
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};


const StudyGuideGenerator = () => {
    const { theme } = useTheme();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [studyGuide, setStudyGuide] = useState<CrunchTimeOutput | null>(null);

    const [loadingStep, setLoadingStep] = useState(0);
    const loadingSteps = [
        "Did you know? You can upload your class notes and get a summarized study guide just like this one.",
        "Pro-Tip: Use our AI Chat to ask specific questions about any topic, 24/7.",
        "Did you know? We can turn your study material into interactive flashcards and practice quizzes.",
        "Fun Fact: You can even upload a picture of your homework for step-by-step help!",
        "Coming up: We're building a personalized learning roadmap just for this topic.",
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingStep(prev => (prev + 1) % loadingSteps.length);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading, loadingSteps.length]);

    const handleGenerate = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        setIsLoading(true);
        setStudyGuide(null);
        setLoadingStep(0);

        try {
            const result = await generateCrunchTimeStudyGuide({
                inputType: 'text',
                content: input,
                learnerType: 'Reading/Writing', // default for landing page
            });
            setStudyGuide(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl mx-auto flex flex-col items-center text-center p-8"
            >
                 <div className="relative mb-4">
                    <AIBuddy className="w-16 h-16" isStatic={false} />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={loadingStep}
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.2 } }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[280px]"
                        >
                            <div className="speech-bubble-typing">
                                <p className="text-sm">{loadingSteps[loadingStep]}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
                <h3 className="text-xl font-semibold mt-10">Generating your study guide...</h3>
                 <Progress value={(loadingStep + 1) * 20} className="w-64 mt-4 h-2" />
            </motion.div>
        );
    }
    
    if (studyGuide) {
        return <StudyGuideDisplay guide={studyGuide} onReset={() => { setStudyGuide(null); setInput(''); }} />;
    }

    return (
        <motion.div 
            key="search-bar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl mx-auto"
        >
            <form onSubmit={handleGenerate} className="relative mt-8">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Type any subject to instantly generate a study guide (e.g., 'Cellular Respiration')"
                    className={cn(
                        "w-full h-16 pl-16 pr-20 rounded-full text-lg shadow-lg",
                        theme === 'dark' ? 'bg-black/20 border-white/10 placeholder:text-white/50' : 'bg-white border-gray-200 placeholder:text-black/50'
                    )}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Button type="submit" size="icon" className="h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600">
                        <ArrowRight className="h-6 w-6" />
                    </Button>
                </div>
            </form>
        </motion.div>
    );
};


const Hero = () => {
  const { theme } = useTheme();

  return (
  <section className="relative py-20 lg:py-24 text-center overflow-hidden">
        <div className="spotlight spotlight-left"></div>
        <div className="spotlight spotlight-right"></div>
    <div className="container mx-auto px-4 relative z-10">
      
      <h1 className={cn("text-5xl md:text-7xl font-bold tracking-tighter", theme === 'dark' ? 'text-white' : 'text-black')}>
        Reach your learning <br /> <span className="text-blue-400">goals effortlessly</span>
      </h1>
      <p className={cn("max-w-xl mx-auto mt-6 text-lg", theme === 'dark' ? 'text-white/70' : 'text-black/70')}>
        Tutor Taz turns your class notes, docs, and study materials into your personal AI tutor. Generate quizzes, flashcards, and get 24/7 help.
      </p>

      
      <StudyGuideGenerator />
      
    </div>
  </section>
);
}

const AudienceCTA = () => {
    const { theme } = useTheme();
    return (
        <section className="pb-24">
            <div className="container">
                <div className="h-6"></div>
                 <div className={cn("max-w-4xl mx-auto p-8 rounded-3xl", theme === 'dark' ? 'bg-black/20 border border-white/10 backdrop-blur-sm' : 'bg-white/50 border border-gray-200 shadow-lg')}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className={cn("flex items-center gap-2 font-semibold text-lg", theme === 'dark' ? 'text-white' : 'text-black')}>
                                <Rocket className="w-5 h-5" />
                                <span className="relative">For Students</span>
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
    )
}

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
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Or a loading skeleton
    }

    return (
        <main className={cn("bg-background", theme === 'dark' ? 'dark-grid' : 'bg-white')}>
            <Navbar />
            <Hero />
            <AudienceCTA />
            <HowItWorks theme={theme || 'light'} />
            <PersonalizedTutor theme={theme || 'light'} />
            <DailyPractice theme={theme || 'light'} />
            <Features theme={theme || 'light'} />
            <Pricing plans={plans} theme={theme || 'light'} />
            <Faqs theme={theme || 'light'} />
            <NewReleasePromo theme={theme || 'light'}/>
            <Footer />
        </main>
    );
}
