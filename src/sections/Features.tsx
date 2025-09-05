
"use client";

import FeatureCard from "@/sections/FeatureCard";
import Tag from "@/sections/Tag";
import Image from "next/image";
import Avatar from "@/sections/Avatar";
import { BrainCircuit, Lightbulb, GitMerge, FileText, CheckSquare, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    "AI-Powered Chat",
    "Personalized Roadmaps",
    "Smart Note-Taking",
    "Custom Quizzes",
    "Calendar Sync",
    "Learner Analysis",
];

const parentVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.7,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
    },
};

export default function Features() {
    return (
        <section className="py-24 ">
            <div className="container">
                <div className="flex justify-center">
                    <Tag>Features</Tag>
                </div>
                <h2 className="text-6xl font-medium text-center mt-6 max-w-2xl m-auto">
                    A smarter way to <span className="text-lime-400">learn</span>
                </h2>
                <motion.div
                    variants={parentVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="h-full"
                        >
                            <FeatureCard
                                title="Personalized Study Roadmaps"
                                description="AI generates a step-by-step plan to guide you through your courses."
                                className="h-full"
                            >
                                <div className="aspect-video flex items-center justify-center">
                                    <motion.div
                                        whileHover={{ rotateY: 180 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <GitMerge className="w-24 h-24 text-purple-400" />
                                    </motion.div>
                                </div>
                            </FeatureCard>
                        </motion.div>

                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="h-full"
                        >
                            <FeatureCard
                                title="Intelligent Quizzes"
                                description="Test your knowledge with practice quizzes tailored to your study material."
                                className="h-full"
                            >
                                <div className="aspect-video flex items-center justify-center">
                                     <motion.div
                                        whileHover={{ scale: 1.2, color: '#fde047' }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    >
                                        <CheckSquare className="w-24 h-24 text-amber-400" />
                                    </motion.div>
                                </div>
                            </FeatureCard>
                        </motion.div>

                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="h-full"
                        >
                            <FeatureCard
                                title="AI-Powered Chat Assistant"
                                description="Get instant answers, explanations, and study help 24/7."
                                className="h-full"
                            >
                                <div className="aspect-video flex justify-center items-center gap-4">
                                     <motion.div
                                        animate={{
                                            y: ["0%", "5%", "0%"],
                                        }}
                                        transition={{
                                            duration: 2,
                                            ease: "easeInOut",
                                            repeat: Infinity,
                                        }}
                                    >
                                        <MessageSquare className="w-24 h-24 text-lime-400" />
                                    </motion.div>
                                </div>
                            </FeatureCard>
                        </motion.div>
                    </div>
                </motion.div>

                <div className="my-8 flex items-center justify-center flex-wrap gap-2 max-w-3xl m-auto">
                    {features.map((feature) => (
                        <div
                            className="bg-neutral-900 border border-white/10 inline-flex px-3 md:px-5 md:py-2 py-1.5 rounded-2xl gap-3 items-center hover:scale-105 transition duration-500 group"
                            key={feature}
                        >
                            <span className="bg-lime-400 text-neutral-900 size-5 rounded-full inline-flex items-center justify-center text-xl group-hover:rotate-45 transition duration-500">
                                &#10038;
                            </span>
                            <span className="font-medium md:text-lg">
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
