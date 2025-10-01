
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrainCircuit, Lightbulb, FileUp, Code, Image as ImageIcon, Video, GitMerge, Files, FlaskConical, MessageSquare } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const FeatureCard = ({ title, description, children, className }: { title: string, description: string, children: React.ReactNode, className?: string }) => (
    <div className={`bg-neutral-900 border border-white/10 rounded-3xl p-8 ${className}`}>
        {children}
        <h3 className="text-2xl font-bold mt-4 text-white">{title}</h3>
        <p className="text-white/70 mt-2">{description}</p>
    </div>
);

export default function Features() {
    return (
        <section id="features" className="py-24">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8 flex flex-col">
                        <FeatureCard 
                            title="Personalized Learning Paths" 
                            description="Your learning style is unique. We generate custom roadmaps and content that adapt to you, not the other way around."
                        >
                            <GitMerge className="w-12 h-12 text-blue-400" />
                             <div className="space-y-4 mt-6">
                                <Card className="bg-white/5 p-4">
                                    <h4 className="font-semibold text-white">Visual Learner</h4>
                                    <p className="text-xs text-white/50">Focus on diagrams & video.</p>
                                </Card>
                                <Card className="bg-blue-500/10 p-4 border border-blue-500/50">
                                    <h4 className="font-semibold text-white">Kinesthetic Learner</h4>
                                    <p className="text-xs text-white/50">Hands-on activities & examples.</p>
                                </Card>
                                <Card className="bg-white/5 p-4">
                                    <h4 className="font-semibold text-white">Auditory Learner</h4>
                                     <p className="text-xs text-white/50">Audio explanations & discussions.</p>
                                </Card>
                            </div>
                        </FeatureCard>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <FeatureCard
                            title="Transform Your Content"
                            description="Upload anything—from lecture notes and textbooks to articles and images—and watch it become interactive study material."
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                               <Card className="bg-white/5 flex flex-col items-center justify-center p-4 aspect-square">
                                    <FileUp className="w-8 h-8 text-blue-400 mb-2"/>
                                    <span className="text-sm text-white/70 text-center">Upload Your Notes & Docs</span>
                               </Card>
                               <Card className="bg-white/5 flex flex-col items-center justify-center p-4 aspect-square">
                                   <Files className="w-8 h-8 text-blue-400 mb-2"/>
                                    <span className="text-sm text-white/70 text-center">Generate Flashcards</span>
                               </Card>
                               <Card className="bg-white/5 flex flex-col items-center justify-center p-4 aspect-square">
                                   <Lightbulb className="w-8 h-8 text-blue-400 mb-2"/>
                                    <span className="text-sm text-white/70 text-center">Create Practice Quizzes</span>
                               </Card>
                            </div>
                        </FeatureCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <FeatureCard
                                title="Interactive Learning Lab"
                                description="Go beyond memorization. Engage with hands-on labs, activities, and challenges that make learning stick."
                            >
                                 <FlaskConical className="w-12 h-12 text-blue-400"/>
                            </FeatureCard>
                            <FeatureCard
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
