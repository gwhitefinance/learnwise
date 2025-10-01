
"use client";

import FeatureCard from "@/sections/FeatureCard";
import Tag from "@/sections/Tag";
import { GitMerge, Lightbulb, MessageSquare, BrainCircuit, UploadCloud, FileText } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        title: "AI-Powered Chat",
        description: "Get instant, context-aware help. Ask questions and get detailed explanations on any topic.",
        icon: <MessageSquare className="w-12 h-12 text-blue-500" />,
    },
    {
        title: "Personalized Roadmaps",
        description: "Don't just learn—strategize. Our AI builds a custom, step-by-step path to understanding for any subject.",
        icon: <GitMerge className="w-12 h-12 text-purple-500" />,
    },
     {
        title: "Intelligent Practice Quizzes",
        description: "Move beyond generic questions. Generate practice quizzes based on your actual materials.",
        icon: <Lightbulb className="w-12 h-12 text-amber-500" />,
    },
    {
        title: "Smart Document Analysis",
        description: "Upload your documents and let the AI extract key concepts, summaries, and important topics.",
        icon: <FileText className="w-12 h-12 text-green-500" />,
    },
    {
        title: "Adaptive Learning Tools",
        description: "From flashcards to mind maps, get the tools that work best for your unique learning style.",
        icon: <BrainCircuit className="w-12 h-12 text-rose-500" />,
    },
    {
        title: "Upload Anything",
        description: "Works with PDFs, lecture notes, textbook photos, and more. If you can see it, you can learn it.",
        icon: <UploadCloud className="w-12 h-12 text-sky-500" />,
    }
];

const parentVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

export default function Features() {
    return (
        <section id="features" className="py-24 ">
            <div className="container">
                <div className="flex justify-center">
                    <Tag>Features</Tag>
                </div>
                <h2 className="text-5xl font-bold text-center mt-6 text-foreground">
                    A Smarter Way to Study
                </h2>
                 <p className="text-muted-foreground text-center mt-4 text-lg max-w-2xl mx-auto">
                    LearnWise provides a complete suite of AI-powered tools designed to help you learn faster and more effectively.
                </p>
                <motion.div
                    variants={parentVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map(feature => (
                         <motion.div
                            key={feature.title}
                            variants={cardVariants}
                            className="h-full"
                        >
                            <div className="bg-card border p-8 rounded-2xl h-full flex flex-col">
                               <div className="bg-primary/10 p-3 rounded-xl inline-block">
                                    {feature.icon}
                               </div>
                               <h3 className="text-xl font-semibold mt-4 text-foreground">{feature.title}</h3>
                               <p className="text-muted-foreground mt-2 flex-grow">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
