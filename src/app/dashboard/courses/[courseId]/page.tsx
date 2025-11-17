
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc, collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { materialDesignIcons } from '@/lib/icons';

type Material = {
    type: 'file' | 'text' | 'url' | 'audio';
    content: string;
    fileName?: string;
};

type Unit = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    materials: Material[];
};

type Course = {
    id: string;
    name: string;
    description?: string;
    units: Unit[];
};

const MaterialIcon = ({ type }: { type: Material['type'] }) => {
    switch (type) {
        case 'file': return <span className="material-symbols-outlined text-base">description</span>;
        case 'text': return <span className="material-symbols-outlined text-base">notes</span>;
        case 'url': return <span className="material-symbols-outlined text-base">smart_display</span>;
        default: return <span className="material-symbols-outlined text-base">attachment</span>;
    }
};

export default function StudyHubPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const router = useRouter();
    const [user, authLoading] = useAuthState(auth);
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !courseId) return;

        const courseRef = doc(db, 'courses', courseId);
        const unsubscribe = onSnapshot(courseRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().userId === user.uid) {
                setCourse({ id: docSnap.id, ...docSnap.data() } as Course);
            } else {
                // Not found or not authorized
                router.push('/dashboard/courses');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [courseId, user, router]);

    if (loading || authLoading) {
        return (
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
                <Skeleton className="h-10 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <Skeleton className="h-24 w-full mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }
    
    if (!course) {
        return <div>Course not found.</div>;
    }

    const totalChapters = course.units?.flatMap(u => u.materials).length || 0;
    const completedChapters = 0; // Replace with actual logic later
    const progress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

    return (
        <main className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-grow">
                    <div className="flex flex-wrap justify-between gap-4 mb-6">
                        <div className="flex min-w-72 flex-col gap-2">
                            <p className="text-4xl font-black leading-tight tracking-[-0.033em]">{course.name}</p>
                            <p className="text-secondary-dark-text dark:text-gray-400 text-base font-normal leading-normal">{course.description || 'Your central dashboard for all course materials and study tools.'}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 mb-8 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                        <div className="flex gap-6 justify-between items-center">
                            <p className="text-base font-medium">Course Progress</p>
                            <p className="text-sm font-semibold">{Math.round(progress)}%</p>
                        </div>
                        <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-2.5">
                            <div className="h-2.5 rounded-full bg-primary" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] mb-4">My Study Units</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {course.units?.map(unit => (
                            <div key={unit.id} className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-5 transition-shadow hover:shadow-lg">
                                <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg" style={{ backgroundImage: `url(${unit.imageUrl || 'https://picsum.photos/seed/1/600/400'})` }}></div>
                                <div>
                                    <p className="text-lg font-bold leading-normal">{unit.title}</p>
                                    <p className="text-secondary-dark-text dark:text-gray-400 text-sm font-normal leading-normal mt-1 mb-4">{unit.description}</p>
                                </div>
                                <div className="flex flex-col gap-2 mt-auto">
                                    {unit.materials?.map((material, index) => (
                                         <button key={index} className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors dark:bg-primary/20 dark:hover:bg-primary/30">
                                            <MaterialIcon type={material.type} /> {material.fileName || "View Material"}
                                        </button>
                                    ))}
                                    <hr className="border-t border-gray-200 dark:border-gray-700 my-2"/>
                                    <button className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2 px-4 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
                                        <span className="material-symbols-outlined text-base">quiz</span> Take Practice Quiz
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <aside className="w-full lg:w-72 xl:w-80 lg:sticky top-24 self-start flex-shrink-0">
                    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4">Global Study Tools</h3>
                        <div className="flex flex-col gap-3">
                            <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors group" href="#">
                                <span className="material-symbols-outlined text-primary">school</span>
                                <span className="text-sm font-medium">Final Exam Prep</span>
                            </a>
                            <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors group" href="#">
                                <span className="material-symbols-outlined text-primary">biotech</span>
                                <span className="text-sm font-medium">Ask AI Tutor</span>
                            </a>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
