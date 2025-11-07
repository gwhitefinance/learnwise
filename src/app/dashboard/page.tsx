'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardClientPage from './DashboardClientPage';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flame, Upload, FileText, Mic, Calendar, ChevronRight, Gamepad2, FilePenLine } from 'lucide-react';
import AIBuddy from '@/components/ai-buddy';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RightSidebar = () => {

    const materials = [
        { icon: <FilePenLine className="h-6 w-6 text-blue-500" />, title: 'Risk Management Strategies', date: 'Nov 6, 2025' },
        { icon: <FilePenLine className="h-6 w-6 text-blue-500" />, title: 'Technical Analysis Tools', date: 'Nov 6, 2025' },
        { icon: <Mic className="h-6 w-6 text-purple-500" />, title: 'Untitled Lecture', date: 'Nov 5, 2025' }
    ]

    const upcoming = [
        { icon: <Gamepad2 className="h-5 w-5" />, title: 'Technical Analysis for Day ...', date: 'Nov 8', color: 'bg-pink-500/20 text-pink-600' },
        { icon: <FileText className="h-5 w-5" />, title: 'Trend-Following Technical ...', date: 'Nov 8', color: 'bg-yellow-500/20 text-yellow-600' },
    ]

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Flame className="text-orange-500"/>
                        <span className="font-semibold">3 day streak!</span>
                    </div>
                    <Button variant="link" asChild>
                        <Link href="/leaderboard">View Leaderboard</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Materials</CardTitle>
                    <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2"/>
                        Upload
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {materials.map(item => (
                        <div key={item.title} className="flex items-center gap-4">
                            <div className="p-2 bg-muted rounded-lg">
                                {item.icon}
                            </div>
                            <div>
                                <p className="font-semibold">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.date}</p>
                            </div>
                        </div>
                    ))}
                    <Button variant="link" className="w-full">View All</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Upcoming
                        <Calendar className="h-5 w-5 text-muted-foreground"/>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {upcoming.map(item => (
                        <div key={item.title} className="flex items-center justify-between hover:bg-muted p-2 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${item.color}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">{item.date}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    ))}
                     <Button variant="link" className="w-full">View All</Button>
                </CardContent>
            </Card>
        </div>
    )
}

/**
 * A wrapper for the dashboard that handles the initial welcome popup and tour trigger.
 */
export default function DashboardPageWrapper() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <DashboardClientPage />
        </div>
         <div className="lg:col-span-1">
            <RightSidebar />
        </div>
    </div>
  );
};
