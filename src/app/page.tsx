
"use client"

import CallToAction from '@/sections/CallToAction';
import Faqs from '@/sections/Faqs';
import Footer from '@/sections/Footer';
import Navbar from '@/sections/Navbar';
import Integrations from '@/sections/Integrations';
import { ArrowRight, BrainCircuit, CheckCircle, FileText, GitMerge, Lightbulb, MessageSquare, UploadCloud, Wand2, Star, BookOpen, Calendar, FlaskConical } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from 'framer-motion';
import AIBuddy from '@/components/ai-buddy';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Spline from '@splinetool/react-spline';
import { useRef } from 'react';

const Hero = () => (
    <section className="relative py-32 lg:py-48 text-white">
        <div className="absolute inset-0 z-0">
             <Spline scene="https://prod.spline.design/iWPr341AINn90G0S/scene.splinecode" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
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
                    <Image className="inline-block h-10 w-10 rounded-full ring-2 ring-background" src="https://i.pravatar.cc/150?u=a042581f4e29026706d" alt="User 3" width={40} height={40}/>
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
                    <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 rounded-full text-base">
                        Start Now
                    </Button>
                </Link>
                 <Link href="#features">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full text-base">
                        More Info
                    </Button>
                </Link>
            </div>
        </div>
    </section>
);


const Feature = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
  <div className="mb-16">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-white/10 border border-white/20 rounded-lg text-blue-400">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white">{title}</h3>
    </div>
    <p className="text-white/70 text-lg ml-16">{description}</p>
  </div>
);


const FeatureShowcase = () => {
    const targetRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], ['10%', '-100%']);

    return (
        <section id="features" className="py-24">
            <div className="container mx-auto px-4">
                 <div ref={targetRef} className="grid md:grid-cols-2 gap-16 items-start">
                    <div className="md:sticky top-24 h-auto md:h-[500px]">
                        <motion.div style={{ y }}>
                            <AIBuddy className="w-full h-full max-w-sm mx-auto" />
                        </motion.div>
                    </div>
                    <div>
                        <Feature title="Create Your Course" description="Add a new course to your dashboard. Provide a name, and optionally, a URL to existing material (like a Wikipedia page or a course syllabus)." icon={<BookOpen />} />
                        <Feature title="Generate a Roadmap" description="Our AI analyzes your course and creates a personalized study roadmap with milestones and goals, helping you stay on track." icon={<GitMerge />} />
                        <Feature title="Manage Your Schedule" description="All your milestones are automatically added to your calendar, so you can visualize your deadlines and plan your study sessions." icon={<Calendar />} />
                        <Feature title="Enter the Learning Lab" description="Dive into interactive, AI-generated lessons for each chapter, complete with activities and tools tailored to your learning style." icon={<FlaskConical />} />
                         <Feature title="Test Your Knowledge" description="Take practice quizzes generated from your notes or course content to ensure you've mastered the material." icon={<Lightbulb />} />
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
            <Integrations />
            <Faqs />
            <CallToAction />
            <Footer />
        </main>
    );
}
