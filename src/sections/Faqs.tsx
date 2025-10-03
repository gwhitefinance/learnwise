
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

const faqs = [
    {
        question: "How does Tutorin personalize my learning?",
        answer: "Tutorin analyzes your uploaded materials—from work training documents to college lecture notes—and your learning style to generate custom roadmaps and quizzes that focus on what you need to learn most.",
    },
    {
        question: "Can I use Tutorin for professional development?",
        answer: "Absolutely! Tutorin is designed for any learning scenario. Upload your company's training manuals, new project documentation, or any material you need to master for your job.",
    },
    {
        question: "Is my data secure?",
        answer: "Yes, your privacy and data security are our top priorities. All your uploaded materials and personal information are encrypted and stored securely.",
    },
    {
        question: "What kind of materials can I upload?",
        answer: "You can upload documents, notes, and other study materials. Our AI will analyze them to provide even more personalized support and generate relevant quizzes.",
    },
    {
        question: "How does the AI chat work?",
        answer: "Our AI chat assistant is available 24/7 to answer your questions and explain complex concepts on any topic, whether it's for work, school, or personal curiosity. It's like having a personal tutor in your pocket.",
    },
];

export default function Faqs() {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

    const handleClick = (index: number) => {
        setSelectedIndex(selectedIndex === index ? null : index);
    };

    return (
        <section className="py-24 ">
            <div className="container">
                <h2 className="text-4xl md:text-5xl font-bold text-center mt-6 max-w-2xl mx-auto text-white">
                    Frequently Asked Questions
                </h2>

                <div className="mt-12 flex flex-col gap-4 max-w-3xl mx-auto">
                    {faqs.map((faq, faqIndex) => (
                        <div
                            key={faq.question}
                            onClick={() => handleClick(faqIndex)}
                            className="bg-black rounded-2xl border border-white/10 p-6 cursor-pointer"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-lg text-white">
                                    {faq.question}
                                </h3>
                                <div className="p-2 bg-white/10 rounded-full text-white">
                                    <Plus
                                        size={20}
                                        className={twMerge(
                                            "transition duration-300",
                                            selectedIndex === faqIndex && "rotate-45"
                                        )}
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {selectedIndex === faqIndex && (
                                    <motion.div
                                        initial={{
                                            height: 0,
                                            marginTop: 0,
                                            opacity: 0,
                                        }}
                                        animate={{
                                            height: "auto",
                                            marginTop: 16,
                                            opacity: 1,
                                        }}
                                        exit={{
                                            height: 0,
                                            marginTop: 0,
                                            opacity: 0,
                                        }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-white/70">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
