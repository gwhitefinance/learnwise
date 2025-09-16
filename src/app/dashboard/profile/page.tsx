
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Gem, Palette, Shirt, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import shopItems from '@/lib/shop-items.json';

type UserProfile = {
    displayName: string;
    email: string;
    coins: number;
    // other fields...
};

export default function ProfilePage() {
    const [user, authLoading] = useAuthState(auth);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<Record<string, string>>({});
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/signup');
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setProfile(doc.data() as UserProfile);
            } else {
                // This case might happen if the user doc creation failed at signup
                // Or if they are an old user before this feature was added
                console.log("No user profile found!");
            }
            setProfileLoading(false);
        });

        // Load saved customizations
        const savedCustomizations = localStorage.getItem(`robotCustomizations_${user.uid}`);
        if(savedCustomizations) {
            setSelectedItems(JSON.parse(savedCustomizations));
        }

        return () => unsubscribe();
    }, [user, authLoading, router]);

    const handleSelectItem = (category: string, name: string) => {
        const newSelectedItems = {...selectedItems, [category]: name};
        setSelectedItems(newSelectedItems);
        if(user) {
            localStorage.setItem(`robotCustomizations_${user.uid}`, JSON.stringify(newSelectedItems));
        }
    }

    if (authLoading || profileLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!profile) {
        return <div>Could not load user profile.</div>
    }
    
    const achievements = [
        { title: 'First Quiz Completed', coins: 10, unlocked: true },
        { title: 'First Course Finished', coins: 50, unlocked: false },
        { title: '7-Day Study Streak', coins: 100, unlocked: false },
        { title: 'Perfect Quiz Score', coins: 25, unlocked: true },
        { title: 'Mastered a Topic', coins: 75, unlocked: false },
    ];
    
    const robotColor = shopItems.colors.find(c => c.name === selectedItems.color)?.hex || '#4f4f4f';
    const RobotHat = shopItems.hats.find(h => h.name === selectedItems.hat)?.component;

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Profile & Rewards</h1>
                <p className="text-muted-foreground">
                    Customize your experience and track your achievements.
                </p>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                             <Avatar className="h-20 w-20">
                                <AvatarImage src={user?.photoURL ?? undefined} />
                                <AvatarFallback>{profile.displayName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">{profile.displayName}</CardTitle>
                                <CardDescription>{profile.email}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-2 text-2xl font-bold text-amber-500">
                                <Gem className="h-6 w-6"/>
                                <span>{profile.coins} Coins</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Achievements</CardTitle>
                             <CardDescription>Earn coins by completing tasks.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {achievements.map((ach) => (
                                    <div key={ach.title} className={cn("flex items-center justify-between p-3 rounded-lg", ach.unlocked ? "bg-green-500/10" : "bg-muted opacity-60")}>
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-full", ach.unlocked ? "bg-green-500/20 text-green-600" : "bg-muted-foreground/20 text-muted-foreground")}>
                                                <Zap className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{ach.title}</p>
                                                <p className="text-sm text-muted-foreground">+{ach.coins} coins</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>Robot Customization Shop</CardTitle>
                            <CardDescription>Use your coins to personalize your AI study buddy!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="col-span-1 flex items-center justify-center bg-muted rounded-lg p-4 relative aspect-square">
                                    {/* Robot Preview */}
                                    <div className="relative w-40 h-40">
                                        {RobotHat && <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32 z-10" dangerouslySetInnerHTML={{ __html: RobotHat }} />}
                                        <div 
                                            className="w-full h-full rounded-full"
                                            style={{ backgroundColor: robotColor }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-2/3 h-1/4 bg-black/30 rounded-full flex items-center justify-center">
                                                    <div className="w-1/2 h-1/2 bg-white rounded-full animate-pulse"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                     <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold mb-2 flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/> Colors</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {shopItems.colors.map(item => (
                                                    <button 
                                                        key={item.name}
                                                        className={cn("w-10 h-10 rounded-full border-2 transition-transform hover:scale-110", selectedItems.color === item.name ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border')}
                                                        style={{ backgroundColor: item.hex }}
                                                        onClick={() => handleSelectItem('color', item.name)}
                                                    >
                                                        <span className="sr-only">{item.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-2 flex items-center gap-2"><Shirt className="h-5 w-5 text-primary"/> Hats & Accessories</h4>
                                             <div className="grid grid-cols-3 gap-4">
                                                {shopItems.hats.map(item => (
                                                     <button 
                                                        key={item.name}
                                                        onClick={() => handleSelectItem('hat', item.name)}
                                                        className={cn("p-2 rounded-lg border flex flex-col items-center gap-1 transition-all", selectedItems.hat === item.name ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'hover:bg-muted')}
                                                    >
                                                        <div className="w-12 h-12" dangerouslySetInnerHTML={{ __html: item.component || '' }} />
                                                        <span className="text-xs font-medium">{item.name}</span>
                                                        <span className="text-xs text-amber-500 font-semibold">{item.price} Coins</span>
                                                    </button>
                                                ))}
                                             </div>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
