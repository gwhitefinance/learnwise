

'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, HelpCircle, FileQuestion, Copy, BrainCircuit } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const CalendarDay = ({ day, isSelected, isOtherMonth, onClick, hasEvent, theme }: { day: number, isSelected?: boolean, isOtherMonth?: boolean, onClick: () => void, hasEvent?: boolean, theme: string }) => (
    <button
        onClick={onClick}
        className={cn(
        "flex items-center justify-center h-10 w-10 rounded-full text-sm transition-colors",
        isOtherMonth ? (theme === 'dark' ? "text-white/30" : "text-black/30") : (theme === 'dark' ? "text-white/80" : "text-black/80"),
        isSelected ? "bg-blue-500 text-white font-bold" : (theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'),
        hasEvent && !isSelected && (theme === 'dark' ? 'bg-white/10' : 'bg-gray-100')
    )}>
        {day}
    </button>
);

const StudyItem = ({ icon, title, duration, progress, theme }: { icon: React.ReactNode, title: string, duration: string, progress: number, theme: string }) => (
    <div className={cn("border rounded-2xl p-4", theme === 'dark' ? 'bg-black/20 border-white/10' : 'bg-white border-gray-200')}>
        <div className="flex items-start gap-4">
            <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400">
                {icon}
            </div>
            <div>
                <h4 className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-black')}>{title}</h4>
                <p className="text-xs text-muted-foreground">{duration}</p>
            </div>
        </div>
        <div className="mt-4">
            <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className={cn(theme === 'dark' ? 'text-white' : 'text-black')}>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
        </div>
        <Button variant="outline" className={cn("w-full mt-4 border hover:bg-accent", theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-black')}>
            Continue <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
    </div>
);

const studyPlanData: Record<number, (props: { theme: string }) => React.ReactNode> = {
    15: ({ theme }) => (
        <>
            <StudyItem
                theme={theme}
                icon={<HelpCircle />}
                title="Practice Quiz: Algebra"
                duration="45 minutes"
                progress={75}
            />
            <StudyItem
                theme={theme}
                icon={<Copy />}
                title="Review Flashcards"
                duration="30 minutes"
                progress={80}
            />
        </>
    ),
    16: ({ theme }) => (
        <>
            <StudyItem
                theme={theme}
                icon={<FileQuestion />}
                title="Learning Lab: Photosynthesis"
                duration="1.5 hours"
                progress={45}
            />
             <StudyItem
                theme={theme}
                icon={<BrainCircuit />}
                title="AI Tutor Chat"
                duration="20 minutes"
                progress={100}
            />
        </>
    ),
    17: ({ theme }) => (
         <>
            <StudyItem
                theme={theme}
                icon={<FileQuestion />}
                title="Finish Notes on Chapter 3"
                duration="1 hour"
                progress={60}
            />
        </>
    ),
    18: ({ theme }) => (
         <>
            <StudyItem
                theme={theme}
                icon={<HelpCircle />}
                title="Roadmap Milestone"
                duration="2 hours"
                progress={25}
            />
            <StudyItem
                theme={theme}
                icon={<FileQuestion />}
                title="Weekly Review Quiz"
                duration="45 minutes"
                progress={90}
            />
        </>
    )
};


export default function PersonalizedTutor({ theme }: { theme: string }) {
    const [currentMonth] = useState(new Date(2025, 0, 1));
    const [selectedDay, setSelectedDay] = useState(15);
    const calendarDays = [29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1];

    const StudyPlanForDay = studyPlanData[selectedDay];

    return (
        <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="py-24"
        >
            <div className="container text-center">
                <h2 className={cn("text-4xl md:text-5xl font-bold tracking-tighter", theme === 'dark' ? 'text-white' : 'text-black')}>
                    <span className="text-blue-400">Study</span> Smarter
                </h2>
                <div className={cn("mt-12 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl", theme === 'dark' ? 'bg-black border border-white/10' : 'bg-gray-100 border-gray-200')}>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className={cn("text-2xl font-bold text-left", theme === 'dark' ? 'text-white' : 'text-black')}>Your study plan</h3>
                            <p className="text-blue-400 text-sm text-left">Dynamically generated learning paths</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                             <div className="flex justify-between items-center mb-4">
                                <Button variant="ghost" size="icon" className={cn(theme === 'dark' ? "text-white/70 hover:text-white hover:bg-white/10" : "text-black/70 hover:text-black hover:bg-black/10")}><ChevronLeft/></Button>
                                <p className={cn("font-semibold", theme === 'dark' ? 'text-white' : 'text-black')}>January 2025</p>
                                <Button variant="ghost" size="icon" className={cn(theme === 'dark' ? "text-white/70 hover:text-white hover:bg-white/10" : "text-black/70 hover:text-black hover:bg-black/10")}><ChevronRight/></Button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                    <div key={day} className="text-xs text-muted-foreground font-medium py-2">{day}</div>
                                ))}
                                {calendarDays.map((day, i) => (
                                    <CalendarDay 
                                        key={i} 
                                        day={day} 
                                        isSelected={day === selectedDay} 
                                        isOtherMonth={(i < 3) || (i > 33)}
                                        onClick={() => setSelectedDay(day)}
                                        hasEvent={!!studyPlanData[day]}
                                        theme={theme}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                           {StudyPlanForDay ? <StudyPlanForDay theme={theme} /> : <div className="text-center text-muted-foreground pt-16">No study items for this day.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    )
}
