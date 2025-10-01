
"use client"

import CallToAction from '@/sections/CallToAction';
import Faqs from '@/sections/Faqs';
import Footer from '@/sections/Footer';
import Navbar from '@/sections/Navbar';
import Integrations from '@/sections/Integrations';
import { ArrowRight, BrainCircuit, CheckCircle, FileText, GitMerge, Lightbulb, MessageSquare, UploadCloud, Wand2, Star } from "lucide-react";
import Link from "next/link";
import { motion } from 'framer-motion';
import AIBuddy from '@/components/ai-buddy';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const Hero = () => (
    <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 light-background">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground">
                        Your Personal AI Study Partner
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
                 <div className="relative flex items-center justify-center -mt-12 md:mt-0">
                    <Image
                        src="https://nextjs-saas-landing-page-five.vercel.app/notebook.png"
                        alt="3D Notebook"
                        width={500}
                        height={500}
                        className="object-contain"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <AIBuddy className="w-64 h-64" />
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const HowItWorks = () => (
    <section className="py-24">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                    How It Works
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                   In three simple steps, transform any material into a personalized learning experience.
                </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="border rounded-2xl p-8 bg-card">
                    <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mb-4">
                        <UploadCloud size={32} />
                    </div>
                    <h3 className="text-2xl font-bold">1. Upload Anything</h3>
                    <p className="text-muted-foreground mt-2">Upload lecture notes, a photo of a worksheet, or link to a URL. LearnWise can handle any material.</p>
                </div>
                <div className="border rounded-2xl p-8 bg-card">
                     <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mb-4">
                        <Wand2 size={32} />
                    </div>
                    <h3 className="text-2xl font-bold">2. Generate Tools</h3>
                    <p className="text-muted-foreground mt-2">Instantly create study roadmaps, practice quizzes, flashcards, or a full course outline from your content.</p>
                </div>
                <div className="border rounded-2xl p-8 bg-card">
                     <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mb-4">
                        <Star size={32} />
                    </div>
                    <h3 className="text-2xl font-bold">3. Master Your Subject</h3>
                    <p className="text-muted-foreground mt-2">Use the AI Tutor to ask questions and follow your personalized plan to ace your exams and goals.</p>
                </div>
            </div>
        </div>
    </section>
);


const FeatureShowcase = () => {
    const features = [
        {
            title: "AI-Powered Tutoring",
            description: "Stuck on a problem? Upload a photo of your homework and get a step-by-step walkthrough from your AI tutor. It explains core concepts, provides practice questions, and tailors advice to your learning style.",
            benefits: ["Conceptual Explanations", "Step-by-Step Problem Solving", "Personalized Study Advice"],
            image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=2148&auto=format&fit=crop"
        },
        {
            title: "Dynamic Study Roadmaps",
            description: "Don't just study—strategize. Generate a personalized roadmap for any course, complete with high-level goals and dated milestones. The AI analyzes your course materials to build a logical, actionable plan.",
            benefits: ["Set High-Level Goals", "Sequential Milestones", "Automatic Date Planning"],
            image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2340&auto=format&fit=crop"
        },
        {
            title: "Instant Practice Materials",
            description: "Turn any set of notes or a course chapter into a valuable study session. Instantly generate multiple-choice quizzes or a deck of flashcards to reinforce key concepts and test your knowledge on demand.",
            benefits: ["Generate from Notes or Courses", "Multiple Choice Quizzes", "Digital Flashcards"],
            image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop"
        }
    ];

    return (
        <section className="py-24 light-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                        A Smarter Way to Study
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                       Explore the tools that will help you learn faster and more effectively than ever before.
                    </p>
                </div>
                <div className="space-y-24">
                    {features.map((feature, index) => (
                        <div key={feature.title} className="grid md:grid-cols-2 gap-12 items-center">
                            <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                                <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-muted-foreground text-lg mb-6">{feature.description}</p>
                                <ul className="space-y-3">
                                    {feature.benefits.map(benefit => (
                                        <li key={benefit} className="flex items-center gap-3">
                                            <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
                                            <span className="text-foreground">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                                <Image 
                                    src={feature.image}
                                    alt={feature.title}
                                    width={600}
                                    height={400}
                                    className="rounded-2xl object-cover aspect-[3/2] shadow-lg"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


export default function Home() {
    return (
        <main className="light-background">
            <Navbar />
            <Hero />
            <HowItWorks />
            <FeatureShowcase />
            <Integrations />
            <Faqs />
            <CallToAction />
            <Footer />
        </main>
    );
}
