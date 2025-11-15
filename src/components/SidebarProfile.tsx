
'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import LevelBadge from '@/components/LevelBadge';
import TazCoinIcon from '@/components/TazCoinIcon';
import { Skeleton } from './ui/skeleton';

export default function SidebarProfile() {
    const [user, loading] = useAuthState(auth);
    const [profile, setProfile] = useState<{ displayName: string, photoURL: string | null, level: number, coins: number } | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (loading || !user) return;

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setProfile({
                    displayName: data.displayName || 'User',
                    photoURL: data.photoURL || null,
                    level: data.level || 1,
                    coins: data.coins || 0,
                });
            }
        });

        return () => unsubscribe();
    }, [user, loading]);

    if (loading || !profile) {
        return (
            <div className="w-full p-2">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                </div>
            </div>
        );
    }
    
    return (
         <div className="w-full p-2 rounded-2xl hover:bg-muted cursor-pointer" onClick={() => router.push('/dashboard/profile')}>
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.photoURL ?? undefined} alt="User" />
                    <AvatarFallback>{profile.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-sm truncate">{profile.displayName}</p>
                    <div className="flex items-center gap-2">
                        <LevelBadge level={profile.level} size="sm" />
                    </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1.5 shrink-0">
                    <TazCoinIcon className="h-4 w-4" /> {profile.coins}
                </Badge>
            </div>
        </div>
    )
}
