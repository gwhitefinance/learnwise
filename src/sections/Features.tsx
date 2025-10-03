
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrainCircuit, Lightbulb, FileUp, Code, Image as ImageIcon, Video, GitMerge, Files, FlaskConical, MessageSquare } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const FeatureCard = ({ title, description, children, className, theme }: { title: string, description: string, children: React.ReactNode, className?: string, theme: string }) => (
    <div className={cn(`rounded-3xl p-8 ${className}`, theme === 'dark' ? 'bg-neutral-900 border border-white/10' : 'bg-gray-100 border border-gray-200')}>
        {children}
        <h3 className={cn("text-2xl font-bold mt-4", theme === 'dark' ? "text-white" : "text-black")}>{title}</h3>
        <p className={cn("mt-2", theme === 'dark' ? 'text-white/70' : 'text-black/70')}>{description}</p>
    </div>
);

export default function Features({ theme }: { theme: string }) {
    return (
        <section id="features" className="py-24">
            <div className="container text-center mb-16">
                <h2 className={cn("text-4xl md:text-5xl font-bold tracking-tighter", theme === 'dark' ? 'text-white' : 'text-black')}>
                    Your Study Sessions, Supercharged
                </h2>
                <p className={cn("text-xl mx-auto max-w-2xl mt-4", theme === 'dark' ? 'text-white/70' : 'text-black/70')}>
                    Tutorin is packed with features designed to make your study sessions more effective and engaging.
                </p>
            </div>
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8 flex flex-col">
                        <FeatureCard 
                            theme={theme}
                            title="Personalized Learning Paths" 
                            description="Your learning style is unique. We generate custom roadmaps and content that adapt to you, not the other way around."
                        >
                            <GitMerge className="w-12 h-12 text-blue-400" />
                             <div className="space-y-4 mt-6">
                                <Card className={cn("p-4", theme === 'dark' ? 'bg-white/5' : 'bg-white')}>
                                    <h4 className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-black')}>Visual Learner</h4>
                                    <p className={cn("text-xs", theme === 'dark' ? 'text-white/50' : 'text-black/50')}>Focus on diagrams & video.</p>
                                </Card>
                                <Card className="bg-blue-500/10 p-4 border border-blue-500/50">
                                    <h4 className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-black')}>Kinesthetic Learner</h4>
                                    <p className={cn("text-xs", theme === 'dark' ? 'text-white/50' : 'text-black/50')}>Hands-on activities & examples.</p>
                                </Card>
                                <Card className={cn("p-4", theme === 'dark' ? 'bg-white/5' : 'bg-white')}>
                                    <h4 className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-black')}>Auditory Learner</h4>
                                     <p className={cn("text-xs", theme === 'dark' ? 'text-white/50' : 'text-black/50')}>Audio explanations & discussions.</p>
                                </Card>
                            </div>
                        </FeatureCard>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <FeatureCard
                            theme={theme}
                            title="Transform Your Content"
                            description="Upload anything—from lecture notes and textbooks to articles and images—and watch it become interactive study material."
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                               <Card className={cn("flex flex-col items-center justify-center p-4 aspect-square", theme === 'dark' ? 'bg-white/5' : 'bg-white')}>
                                    <FileUp className="w-8 h-8 text-blue-400 mb-2"/>
                                    <span className={cn("text-sm text-center", theme === 'dark' ? 'text-white/70' : 'text-black/70')}>Upload Your Notes & Docs</span>
                               </Card>
                               <Card className={cn("flex flex-col items-center justify-center p-4 aspect-square", theme === 'dark' ? 'bg-white/5' : 'bg-white')}>
                                   <Files className="w-8 h-8 text-blue-400 mb-2"/>
                                    <span className={cn("text-sm text-center", theme === 'dark' ? 'text-white/70' : 'text-black/70')}>Generate Flashcards</span>
                               </Card>
                               <Card className={cn("flex flex-col items-center justify-center p-4 aspect-square", theme === 'dark' ? 'bg-white/5' : 'bg-white')}>
                                   <Lightbulb className="w-8 h-8 text-blue-400 mb-2"/>
                                    <span className={cn("text-sm text-center", theme === 'dark' ? 'text-white/70' : 'text-black/70')}>Create Practice Quizzes</span>
                               </Card>
                            </div>
                        </FeatureCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <FeatureCard
                                theme={theme}
                                title="Interactive Learning Lab"
                                description="Go beyond memorization. Engage with hands-on labs, activities, and challenges that make learning stick."
                            >
                                 <FlaskConical className="w-12 h-12 text-blue-400"/>
                            </FeatureCard>
                            <FeatureCard
                                theme={theme}
                                title="24/7 AI Tutor"
                                description="Stuck on a problem at 2 AM? Your AI tutor is always available to provide instant help and clear explanations."
                            >
                                <MessageSquare className="w-12 h-12 text-blue-400" />
                            </FeatureCard>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
