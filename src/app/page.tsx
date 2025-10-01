
"use client"

import CallToAction from '@/sections/CallToAction';
import Faqs from '@/sections/Faqs';
import Footer from '@/sections/Footer';
import Navbar from '@/sections/Navbar';
import { ArrowRight, BrainCircuit, CheckCircle, FileText, GitMerge, Lightbulb, MessageSquare, UploadCloud, Wand2 } from "lucide-react";
import Link from "next/link";
import { motion } from 'framer-motion';
import AIBuddy from '@/components/ai-buddy';
import { Button } from '@/components/ui/button';

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
                </div>
            </div>
        </div>
    </section>
);

const Feature = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, amount: 0.5 }}
        className="mb-12 p-6 rounded-lg"
    >
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-lg">
                {icon}
            </div>
            <div>
                <h3 className="text-2xl font-bold">{title}</h3>
                <p className="text-muted-foreground mt-2">{description}</p>
            </div>
        </div>
    </motion.div>
);


const features = [
    {
        icon: <UploadCloud size={24} />,
        title: "Upload Any Document",
        description: "Start by uploading PDFs, lecture notes, textbook chapters, or even just a photo of a worksheet. The AI can analyze any material to get started."
    },
    {
        icon: <GitMerge size={24} />,
        title: "Create Dynamic Study Flows",
        description: "Tell the AI what you want to learn, and it will generate a personalized roadmap with goals and milestones, or a full course outline complete with modules and chapters."
    },
    {
        icon: <MessageSquare size={24} />,
        title: "Chat with an AI Tutor",
        description: "Stuck on a concept? Ask the AI Tutor for help. It can provide explanations, summaries, and examples based on your course content, ensuring you never fall behind."
    },
    {
        icon: <Lightbulb size={24} />,
        title: "Generate Practice Materials",
        description: "Instantly create practice quizzes and flashcards from your notes or any chapter in your course. Test your knowledge and reinforce key concepts on demand."
    }
];


export default function Home() {
    return (
        <main className="light-background">
            <Navbar />
            <Hero />
            
            <section className="py-24">
                <div className="container mx-auto px-4">
                     <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                            A Guided Tour of Your New Study Partner
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                           Follow along as your AI Buddy shows you how to transform your study habits.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16 items-start">
                        {/* Left column for text content */}
                        <div className="w-full">
                           {features.map((feature, index) => (
                               <Feature key={index} {...feature} />
                           ))}
                        </div>

                        {/* Right column for sticky AI buddy */}
                        <div className="hidden md:block sticky top-32">
                           <div className="bg-card p-8 rounded-2xl border shadow-lg">
                                <AIBuddy className="w-full h-auto max-w-sm mx-auto" />
                           </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <Faqs />
            <CallToAction />
            <Footer />
        </main>
    );
}
