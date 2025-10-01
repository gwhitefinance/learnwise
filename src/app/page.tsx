
"use client"

import CallToAction from '@/sections/CallToAction';
import Faqs from '@/sections/Faqs';
import Features from '@/sections/Features';
import Footer from '@/sections/Footer';
import Integrations from '@/sections/Integrations';
import LogoTicker from '@/sections/LogoTicker';
import Navbar from '@/sections/Navbar';
import { ArrowRight, BookOpen, BrainCircuit, Check, CheckCircle, FileText, Lightbulb, MessageSquare, UploadCloud, Wand2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import AIBuddy from '@/components/ai-buddy';

const Hero = () => (
    <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 light-background">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground">
                        Your Personal AI Tutor
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-lg mx-auto md:mx-0">
                        From lecture notes to final exams, LearnWise helps you upload, understand, and ace any subject.
                    </p>

                    <div className="flex justify-center md:justify-start gap-4 mt-8">
                        <Link href="/signup">
                            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-base">
                                Get Started Free
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
                 <div className="relative flex items-center justify-center">
                    <AIBuddy className="w-64 h-64" />
                    <Image 
                        src="https://nextjs-saas-landing-page-five.vercel.app/notebook.png"
                        alt="A 3D notebook icon"
                        width={200}
                        height={200}
                        className="absolute -left-12 -bottom-12 transform rotate-[-15deg] hidden md:block"
                    />
                </div>
            </div>
        </div>
    </section>
);

const HowItWorks = () => (
    <section className="py-24 bg-card border-y">
        <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 text-foreground">How it Works</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                        <span className="font-bold text-2xl">1</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Upload Anything</h3>
                    <p className="text-muted-foreground mt-2">PDFs, lecture notes, PowerPoints, or even just a photo of your textbook.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                       <span className="font-bold text-2xl">2</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Ask Anything</h3>
                    <p className="text-muted-foreground mt-2">Chat with your AI tutor to get summaries, explanations, and answers.</p>
                </div>
                <div className="flex flex-col items-center">
                     <div className="flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                        <span className="font-bold text-2xl">3</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Ace Anything</h3>
                    <p className="text-muted-foreground mt-2">Generate practice quizzes, flashcards, and study roadmaps to master your material.</p>
                </div>
            </div>
        </div>
    </section>
);


export default function Home() {
    return (
        <main className="light-background">
            <Navbar />
            <Hero />
            <HowItWorks />
            <Features />
            <Integrations />
            <Faqs />
            <CallToAction />
            <Footer />
        </main>
    );
}
