
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Gem, Palette, Shirt, CheckCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import shopItems from '@/lib/shop-items.json';
import { useToast } from '@/hooks/use-toast';
import AIBuddy from '@/components/ai-buddy';

type UserProfile = {
    displayName: string;
    email: string;
    coins: number;
    unlockedItems?: Record<string, string[]>;
};

export default function ShopClientPage() {
    const [user, authLoading] = useAuthState(auth);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [customizations, setCustomizations] = useState<Record<string, string>>({});
    const router = useRouter();
    const { toast } = useToast();

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
            }
            setProfileLoading(false);
        });

        // Load saved customizations for the robot preview
        const savedCustomizations = localStorage.getItem(`robotCustomizations_${user.uid}`);
        if(savedCustomizations) {
            setCustomizations(JSON.parse(savedCustomizations));
        }

        return () => unsubscribe();
    }, [user, authLoading, router]);

    const handleSelectItem = (category: string, name: string) => {
        const newCustomizations = {...customizations, [category]: name};
        setCustomizations(newCustomizations);
        if(user) {
            localStorage.setItem(`robotCustomizations_${user.uid}`, JSON.stringify(newCustomizations));
        }
    }
    
    const handleBuyItem = async (category: string, itemName: string, price: number) => {
        if (!user || !profile) return;
        
        if (profile.coins < price) {
            toast({ variant: 'destructive', title: 'Not enough coins!', description: 'Complete more tasks to earn coins.' });
            return;
        }

        const userRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userRef, {
                coins: increment(-price),
                [`unlockedItems.${category}`]: arrayUnion(itemName)
            });
            toast({ title: 'Purchase Successful!', description: `You've unlocked ${itemName}.`});
        } catch (error) {
            console.error("Purchase failed: ", error);
            toast({ variant: 'destructive', title: 'Purchase Failed', description: 'Something went wrong. Please try again.' });
        }
    }

    if (authLoading || profileLoading) {
        return (
             <div className="space-y-8">
                <div>
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                        <Skeleton className="h-4 w-96 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1">
                                <Skeleton className="w-full aspect-square rounded-lg" />
                            </div>
                            <div className="md:col-span-2 space-y-8">
                                <div>
                                    <Skeleton className="h-6 w-24 mb-4" />
                                    <div className="flex gap-4">
                                        <Skeleton className="h-16 w-16 rounded-full" />
                                        <Skeleton className="h-16 w-16 rounded-full" />
                                        <Skeleton className="h-16 w-16 rounded-full" />
                                    </div>
                                </div>
                                <div>
                                    <Skeleton className="h-6 w-32 mb-4" />
                                    <div className="grid grid-cols-3 gap-4">
                                        <Skeleton className="h-24 w-full" />
                                        <Skeleton className="h-24 w-full" />
                                        <Skeleton className="h-24 w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!profile) {
        // This can happen briefly or if the user document doesn't exist
        return <div>Could not load user profile. Please try again.</div>;
    }
    
    const isItemUnlocked = (category: string, itemName: string) => {
        const item = category === 'colors' ? shopItems.colors.find(c => c.name === itemName) : shopItems.hats.find(h => h.name === itemName) || shopItems.shirts.find(s => s.name === itemName) || shopItems.shoes.find(s => s.name === itemName);
        if (item && item.price === 0) return true;
        return profile.unlockedItems?.[category]?.includes(itemName) ?? false;
    }

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight">Shop & Rewards</h1>
                <p className="text-muted-foreground">
                    Use your coins to unlock new customizations for your AI study buddy.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center justify-between">
                        <span>Robot Customization Shop</span>
                        <div className="flex items-center gap-2 text-xl font-bold text-amber-500">
                            <Gem className="h-5 w-5"/>
                            <span>{profile.coins} Coins</span>
                        </div>
                    </CardTitle>
                    <CardDescription>Click an item to preview it on your robot. Unlocked items can be equipped freely.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 flex items-center justify-center bg-muted rounded-lg p-4 relative aspect-square">
                            {/* Robot Preview */}
                            <AIBuddy 
                                className="w-48 h-48" 
                                color={customizations.color}
                                hat={customizations.hat}
                                shirt={customizations.shirt}
                                shoes={customizations.shoes}
                            />
                        </div>
                        <div className="md:col-span-2">
                             <div className="space-y-8">
                                <div>
                                    <h4 className="font-semibold mb-3 text-lg flex items-center gap-2"><Palette className="h-5 w-5 text-primary"/> Colors</h4>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                                        {shopItems.colors.map(item => {
                                            const unlocked = isItemUnlocked('colors', item.name);
                                            return (
                                                <div key={item.name} className="flex flex-col items-center gap-2">
                                                    <button 
                                                        className={cn("w-12 h-12 rounded-full border-2 transition-transform hover:scale-110", customizations.color === item.name ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border')}
                                                        style={{ backgroundColor: item.hex }}
                                                        onClick={() => unlocked && handleSelectItem('color', item.name)}
                                                        title={unlocked ? `Equip ${item.name}` : `Locked`}
                                                    >
                                                        <span className="sr-only">{item.name}</span>
                                                         {!unlocked && <Gem className="w-4 h-4 text-white opacity-80" />}
                                                    </button>
                                                    {!unlocked ? (
                                                        <Button size="sm" className="h-7 text-xs" onClick={() => handleBuyItem('colors', item.name, item.price)} disabled={profile.coins < item.price}>
                                                            <Gem className="w-3 h-3 mr-1" /> {item.price}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Owned</span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-3 text-lg flex items-center gap-2"><Shirt className="h-5 w-5 text-primary"/> Accessories</h4>
                                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {[...shopItems.hats, ...shopItems.shirts, ...shopItems.shoes].map(item => {
                                            const category = shopItems.hats.some(h => h.name === item.name) ? 'hats' : shopItems.shirts.some(s => s.name === item.name) ? 'shirts' : 'shoes';
                                            const unlocked = isItemUnlocked(category, item.name);
                                            return (
                                             <div key={item.name} className={cn("p-2 rounded-lg border flex flex-col items-center gap-2 transition-all", customizations[category] === item.name ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'hover:bg-muted')}>
                                                <button 
                                                    className="w-full"
                                                    onClick={() => unlocked && handleSelectItem(category, item.name)}
                                                    title={unlocked ? `Equip ${item.name}` : `Locked`}
                                                >
                                                    <div className="w-16 h-16 mx-auto" dangerouslySetInnerHTML={{ __html: item.component || '<div class="w-16 h-16"></div>' }} />
                                                    <span className="text-sm font-medium mt-1">{item.name}</span>
                                                </button>
                                                {!unlocked ? (
                                                     <Button size="sm" className="h-7 text-xs w-full" onClick={() => handleBuyItem(category, item.name, item.price)} disabled={profile.coins < item.price}>
                                                        <Gem className="w-3 h-3 mr-1" /> {item.price}
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs font-semibold text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Owned</span>
                                                )}
                                             </div>
                                            )
                                        })}
                                     </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
