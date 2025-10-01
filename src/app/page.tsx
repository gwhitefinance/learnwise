
"use client"

import CallToAction from '@/sections/CallToAction';
import Faqs from '@/sections/Faqs';
import Footer from '@/sections/Footer';
import Navbar from '@/sections/Navbar';
import { ArrowRight, BrainCircuit, CheckCircle, FileText, GitMerge, Lightbulb, MessageSquare, UploadCloud, Wand2, Star, BookOpen, Calendar, FlaskConical } from "lucide-react";
import Link from "next/link";
import { motion } from 'framer-motion';
import AIBuddy from '@/components/ai-buddy';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRef } from 'react';

const Hero = () => (
    <section className="relative py-32 lg:py-48 text-white text-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">

            {/* Floating Icons */}
            <motion.div
                className="absolute top-[10%] left-[15%] w-24 h-24"
                animate={{ y: [-10, 10], rotate: [-5, 5] }}
                transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            >
                <Image src="https://w7.pngwing.com/pngs/918/425/png-transparent-paper-clip-attachment-miscellaneous-angle-text-thumbnail.png" alt="Paperclip" width={96} height={96} data-ai-hint="paper clip" />
            </motion.div>
            <motion.div
                className="absolute top-[20%] right-[15%] w-28 h-28"
                animate={{ y: [15, -15], rotate: [8, -8] }}
                transition={{ duration: 7, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            >
                <Image src="https://w7.pngwing.com/pngs/900/159/png-transparent-brown-and-black-notebook-illustration-notebook-icon-notebooks-miscellaneous-brown-spiral-thumbnail.png" alt="Notebook" width={112} height={112} data-ai-hint="notebook" />
            </motion.div>
            <motion.div
                className="absolute bottom-[25%] left-[20%] w-24 h-24"
                animate={{ y: [-5, 5], rotate: [10, -10] }}
                transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            >
                <Image src="https://w7.pngwing.com/pngs/80/232/png-transparent-post-it-note-sticky-notes-stationery-paper-sticky-notes-miscellaneous-angle-text-thumbnail.png" alt="Sticky Notes" width={96} height={96} data-ai-hint="sticky notes"/>
            </motion.div>
             <motion.div
                className="absolute bottom-[15%] right-[25%] w-24 h-24"
                animate={{ y: [10, -10], rotate: [-3, 3] }}
                transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            >
                <Image src="https://w7.pngwing.com/pngs/918/425/png-transparent-paper-clip-attachment-miscellaneous-angle-text-thumbnail.png" alt="Paperclip" width={96} height={96} data-ai-hint="paper clip" />
            </motion.div>


            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
                Master <span className="text-blue-400">your notes</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
               Turn class notes into quizzes, flashcards, and smart study plans instantly.
            </p>
             <div className="flex justify-center items-center gap-4 mt-8">
                <div className="flex -space-x-4">
                    <Image className="inline-block h-10 w-10 rounded-full ring-2 ring-background" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User 1" width={40} height={40}/>
                    <Image className="inline-block h-10 w-10 rounded-full ring-2 ring-background" src="https://i.pravatar.cc/150?u=a042581f4e29026705d" alt="User 2" width={40} height={40}/>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 ring-2 ring-background text-sm font-bold">25k+</div>
                </div>
                <div>
                     <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>
                    </div>
                    <p className="text-sm text-white/70">from 25k+ happy learners</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <Link href="/signup">
                    <Button size="lg" className="w-full sm:w-auto bg-blue-500 text-white hover:bg-blue-600 rounded-full text-base">
                        Start Now
                    </Button>
                </Link>
                 <Link href="#features">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white border-white text-black hover:bg-gray-200 rounded-full text-base">
                        More Info
                    </Button>
                </Link>
            </div>
        </div>
    </section>
);


const FeatureShowcase = () => {
    return (
        <section id="features" className="py-24">
            <div className="container mx-auto px-4">
                 <div className="grid md:grid-cols-2 gap-16 items-start">
                    <div className="space-y-16">
                        <div className="mb-24">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-blue-400">
                                <BookOpen />
                              </div>
                              <h3 className="text-2xl font-bold text-white">Add Your Course</h3>
                            </div>
                            <p className="text-white/70 text-lg mb-6">Start by creating a new course. Just give it a name, and our AI is ready to help you build out your learning journey.</p>
                            <Image 
                                src="https://picsum.photos/seed/course/600/400"
                                alt="Add Your Course"
                                width={600}
                                height={400}
                                className="rounded-lg border border-white/10 shadow-2xl"
                                data-ai-hint="screenshot of app feature"
                            />
                          </div>
                        <div className="mb-24">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-blue-400">
                                <GitMerge />
                              </div>
                              <h3 className="text-2xl font-bold text-white">Generate a Roadmap</h3>
                            </div>
                            <p className="text-white/70 text-lg mb-6">Our AI analyzes your course and creates a personalized study roadmap with milestones and goals, helping you stay on track.</p>
                            <Image 
                                src="https://picsum.photos/seed/roadmap/600/400"
                                alt="Generate a Roadmap"
                                width={600}
                                height={400}
                                className="rounded-lg border border-white/10 shadow-2xl"
                                data-ai-hint="screenshot of app feature"
                            />
                          </div>
                          <div className="mb-24">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-blue-400">
                                <Calendar />
                              </div>
                              <h3 className="text-2xl font-bold text-white">Manage Your Schedule</h3>
                            </div>
                            <p className="text-white/70 text-lg mb-6">All your milestones are automatically added to your calendar, so you can visualize your deadlines and plan your study sessions.</p>
                            <Image 
                                src="https://picsum.photos/seed/calendar/600/400"
                                alt="Manage Your Schedule"
                                width={600}
                                height={400}
                                className="rounded-lg border border-white/10 shadow-2xl"
                                data-ai-hint="screenshot of app feature"
                            />
                          </div>
                           <div className="mb-24">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-blue-400">
                                <FlaskConical />
                              </div>
                              <h3 className="text-2xl font-bold text-white">Enter the Learning Lab</h3>
                            </div>
                            <p className="text-white/70 text-lg mb-6">Dive into interactive, AI-generated lessons for each chapter, complete with activities and tools tailored to your learning style.</p>
                            <Image 
                                src="https://picsum.photos/seed/lab/600/400"
                                alt="Enter the Learning Lab"
                                width={600}
                                height={400}
                                className="rounded-lg border border-white/10 shadow-2xl"
                                data-ai-hint="screenshot of app feature"
                            />
                          </div>
                           <div className="mb-24">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-blue-400">
                                <Lightbulb />
                              </div>
                              <h3 className="text-2xl font-bold text-white">Test Your Knowledge</h3>
                            </div>
                            <p className="text-white/70 text-lg mb-6">Take practice quizzes generated from your notes or course content to ensure you've mastered the material.</p>
                            <Image 
                                src="https://picsum.photos/seed/quiz/600/400"
                                alt="Test Your Knowledge"
                                width={600}
                                height={400}
                                className="rounded-lg border border-white/10 shadow-2xl"
                                data-ai-hint="screenshot of app feature"
                            />
                          </div>
                    </div>
                    <div className="sticky top-24 h-auto">
                        <AIBuddy className="w-full h-full max-w-sm mx-auto" />
                    </div>
                 </div>
            </div>
        </section>
    )
}

export default function Home() {
    return (
        <main className="bg-black text-white">
            <Navbar />
            <Hero />
            <FeatureShowcase />
            <Faqs />
            <CallToAction />
            <Footer />
        </main>
    );
}
