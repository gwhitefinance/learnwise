
'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, HelpCircle, FileQuestion } from 'lucide-react';
import { useState } from 'react';

const CalendarDay = ({ day, isToday, isSelected }: { day: number, isToday?: boolean, isSelected?: boolean }) => (
    <div className={cn(
        "flex items-center justify-center h-10 w-10 rounded-full text-sm",
        isToday ? "border border-blue-500 text-blue-400" : "text-white/70",
        isSelected && "bg-blue-500 text-white"
    )}>
        {day}
    </div>
);

const StudyItem = ({ icon, title, duration, progress }: { icon: React.ReactNode, title: string, duration: string, progress: number }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-start gap-4">
            <div className="bg-white/10 p-3 rounded-xl text-blue-400">
                {icon}
            </div>
            <div>
                <h4 className="font-semibold text-white">{title}</h4>
                <p className="text-xs text-white/50">{duration}</p>
            </div>
        </div>
        <div className="mt-4">
            <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-white/50">Progress</span>
                <span className="text-white">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
        </div>
        <Button variant="outline" className="w-full mt-4 bg-white/10 border-white/20 text-white hover:bg-white/20">
            Continue <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
    </div>
);


export default function PersonalizedTutor() {
    const [currentMonth] = useState(new Date(2025, 0, 1));
    const calendarDays = [29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1];

    return (
        <section className="py-24">
            <div className="container text-center">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
                    <span className="text-blue-400">Personalized</span> Tutor
                </h2>
                <div className="mt-12 bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-white text-left">Your study plan</h3>
                            <p className="text-blue-400 text-sm text-left">Dynamically generated learning paths</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-white/50" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                             <div className="flex justify-between items-center mb-4">
                                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white"><ChevronLeft/></Button>
                                <p className="font-semibold text-white">January 2025</p>
                                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white"><ChevronRight/></Button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                    <div key={day} className="text-xs text-white/50 font-medium py-2">{day}</div>
                                ))}
                                {calendarDays.map((day, i) => (
                                    <CalendarDay key={i} day={day} isSelected={day === 15} />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <StudyItem
                                icon={<HelpCircle />}
                                title="Multiple Choice Quiz"
                                duration="1 hour"
                                progress={23}
                            />
                             <StudyItem
                                icon={<FileQuestion />}
                                title="Quiz Mode"
                                duration="1.5 hours"
                                progress={67}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
