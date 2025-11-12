

'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Calendar, BookOpen, MessageSquare, HelpCircle, Plus, ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const ActivityCard = ({ icon, title, duration, progress, theme, actionText, actionVariant, progressColor }: { icon: React.ReactNode, title: string, duration: string, progress: number, theme: string, actionText: string, actionVariant?: 'primary' | 'secondary', progressColor?: string }) => (
    <div className={cn("border rounded-2xl p-6 flex flex-col", theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200')}>
        <div className="flex items-start gap-4">
            {icon}
            <div>
                <h4 className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-black')}>{title}</h4>
                <p className="text-xs text-muted-foreground">{duration}</p>
            </div>
        </div>
        <div className="mt-4 flex-grow">
            <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className={cn(theme === 'dark' ? 'text-white' : 'text-black')}>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
        </div>
        <Button 
            className={cn(
                "w-full mt-4", 
                actionVariant === 'primary' 
                    ? "bg-green-500 hover:bg-green-600 text-white" 
                    : (theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black')
            )}
        >
            {actionText} {actionVariant === 'primary' ? <Play className="w-4 h-4 ml-2 fill-white" /> : <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
    </div>
);

export default function DailyPractice({ theme }: { theme: string }) {
    const topics = ["Cell Respiration", "Osmosis"];

    return (
        <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="py-24"
        >
            <div className="container text-center">
                <h2 className={cn("text-4xl md:text-5xl font-bold tracking-tighter", theme === 'dark' ? 'text-white' : 'text-black')}>
                    Daily <span className="text-blue-400">Practice</span>
                </h2>
                <div className={cn("mt-12 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl text-left", theme === 'dark' ? 'bg-black border border-white/10' : 'bg-gray-100 border-gray-200')}>
                    <div className={cn("flex justify-between items-start pb-6 border-b", theme === 'dark' ? 'border-white/10' : 'border-gray-200')}>
                        <div>
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-xl", theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-100' )}>
                                    <Calendar className="w-6 h-6 text-blue-400"/>
                                </div>
                                <div>
                                    <h3 className={cn("font-bold", theme === 'dark' ? 'text-white' : 'text-black')}>July 9, 2025</h3>
                                    <p className="text-sm text-muted-foreground">Day 1</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                {topics.map(topic => (
                                    <div key={topic} className={cn("text-xs font-medium px-3 py-1 rounded-full", theme === 'dark' ? 'bg-white/10 text-white/80' : 'bg-gray-200 text-gray-800')}>{topic}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="py-6">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl", theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-100' )}>
                                <BookOpen className="w-6 h-6 text-blue-400" />
                            </div>
                             <h3 className={cn("font-bold", theme === 'dark' ? 'text-white' : 'text-black')}>Today's Topics</h3>
                        </div>
                        <div className="flex items-center gap-2 mt-4 ml-16">
                            {topics.map(topic => (
                                <div key={topic} className={cn("text-xs font-medium px-3 py-1 rounded-full", theme === 'dark' ? 'bg-white/10 text-white/80' : 'bg-gray-200 text-gray-800')}>{topic}</div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                       <ActivityCard
                            theme={theme}
                            icon={<div className="p-3 rounded-xl bg-orange-500/10"><MessageSquare className="w-6 h-6 text-orange-400" /></div>}
                            title="Quiz Mode"
                            duration="2 hours"
                            progress={75}
                            actionText="Continue"
                       />
                       <ActivityCard
                            theme={theme}
                            icon={<div className="p-3 rounded-xl bg-indigo-500/10"><HelpCircle className="w-6 h-6 text-indigo-400" /></div>}
                            title="Multiple Choice"
                            duration="1.5 hours"
                            progress={0}
                            actionText="Start"
                            actionVariant="primary"
                       />
                    </div>

                    <div className={cn("mt-6 pt-6 border-t", theme === 'dark' ? 'border-white/10' : 'border-gray-200')}>
                         <Button variant="ghost" className={cn("w-full h-12 border-2 border-dashed", theme === 'dark' ? 'border-white/10 text-white/70 hover:bg-white/10 hover:text-white' : 'border-gray-300 text-gray-600 hover:bg-gray-200')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Activity
                        </Button>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}
