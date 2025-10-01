
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrainCircuit, Lightbulb, FileUp, Code, Image as ImageIcon, Video } from 'lucide-react';
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
        <section className="py-24">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8 flex flex-col">
                        <FeatureCard 
                            title="Choose Your Tutor" 
                            description="Select a tutor that matches your learning style and subject."
                        >
                            <BrainCircuit className="w-12 h-12 text-blue-400" />
                             <div className="space-y-4 mt-6">
                                <Card className="bg-white/5 p-4">
                                    <h4 className="font-semibold text-white">Calculus</h4>
                                    <Badge variant="outline" className="border-blue-400 text-blue-400 mt-1">Beginner</Badge>
                                </Card>
                                <Card className="bg-white/5 p-4">
                                    <h4 className="font-semibold text-white">Bio</h4>
                                    <Badge className="bg-blue-500 mt-1">Active</Badge>
                                </Card>
                                <Card className="bg-white/5 p-4">
                                    <h4 className="font-semibold text-white">Chem</h4>
                                    <Badge variant="outline" className="border-blue-400 text-blue-400 mt-1">Expert</Badge>
                                </Card>
                            </div>
                        </FeatureCard>
                        <FeatureCard 
                            title="Chat with Document"
                            description="Speak or type your answers and converse with your tutor."
                        >
                             {/* Content for this card can be added if needed */}
                        </FeatureCard>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <FeatureCard
                            title="Upload Notes"
                            description="Drag and drop or browse and select the notes you need to study."
                            className="h-full"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full mt-6">
                               <Card className="bg-white/5 flex flex-col items-center justify-center p-4 min-h-[150px]">
                                    <Code className="w-8 h-8 text-blue-400 mb-2"/>
                                    <span className="text-sm text-white/70">Text Books</span>
                               </Card>
                               <Card className="bg-white/5 flex flex-col items-center justify-center p-4 min-h-[150px]">
                                   <ImageIcon className="w-8 h-8 text-blue-400 mb-2"/>
                                    <span className="text-sm text-white/70">Images</span>
                               </Card>
                               <Card className="bg-white/5 flex flex-col items-center justify-center p-4 min-h-[150px]">
                                   <Video className="w-8 h-8 text-blue-400 mb-2"/>
                                    <span className="text-sm text-white/70">Videos</span>
                               </Card>
                            </div>
                        </FeatureCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <FeatureCard
                                title="Unlimited Questions"
                                description="Ask as many questions as you need and get instant, accurate answers from your AI tutor."
                            >
                                 <Lightbulb className="w-12 h-12 text-blue-400"/>
                            </FeatureCard>
                            <FeatureCard
                                title="Start Learning"
                                description=""
                            >
                                <div className="space-y-4">
                                    <p className="bg-white/5 p-3 rounded-xl text-left text-white/90">Need help with tangible examples for osmosis...</p>
                                    <div className="bg-blue-500/10 p-3 rounded-xl text-left flex justify-between items-center">
                                       <span className="text-white/90">I can help! I specialize in biology 🪴</span>
                                       <Switch checked={true} />
                                    </div>
                                </div>
                            </FeatureCard>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
