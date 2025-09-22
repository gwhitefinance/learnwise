
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Gem, Palette, Shirt, CheckCircle, Footprints, GraduationCap as HatIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import shopItems from '@/lib/shop-items.json';
import { useToast } from '@/hooks/use-toast';
import AIBuddy from '@/components/ai-buddy';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type UserProfile = {
    displayName: string;
    email: string;
    coins: number;
    unlockedItems?: Record<string, string[]>;
};

type Item = {
    name: string;
    price: number;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
    hex?: string;
};

const rarityConfig = {
    Common: { text: 'text-gray-400', ring: 'ring-gray-500/30', bg: 'bg-gray-500/10' },
    Uncommon: { text: 'text-green-400', ring: 'ring-green-500/30', bg: 'bg-green-500/10' },
    Rare: { text: 'text-blue-400', ring: 'ring-blue-500/30', bg: 'bg-blue-500/10' },
    Epic: { text: 'text-purple-400', ring: 'ring-purple-500/30', bg: 'bg-purple-500/10' },
    Legendary: { text: 'text-orange-400', ring: 'ring-orange-500/30', bg: 'bg-orange-500/10' },
};

export default function ShopClientPage() {
    const [user, authLoading] = useAuthState(auth);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [customizations, setCustomizations] = useState<Record<string, string>>({
        color: 'Default',
        hat: 'None',
        shirt: 'None',
        shoes: 'None',
    });
    const router = useRouter();
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
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

    if (!isMounted || authLoading || profileLoading) {
        return (
             <div className="space-y-8">
                <div>
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <Skeleton className="h-12 w-full mb-4" />
                            <Skeleton className="h-12 w-full mb-4" />
                            <Skeleton className="h-12 w-full mb-4" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <Skeleton className="w-full aspect-square rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return <div>Could not load user profile. Please try again.</div>;
    }
    
    const isItemUnlocked = (category: string, itemName: string) => {
        const categoryKey = `${category}s` as keyof typeof shopItems;
        const item = shopItems[categoryKey]?.find((i: any) => i.name === itemName);
        if (item && item.price === 0) return true;
        return profile.unlockedItems?.[category]?.includes(itemName) ?? false;
    }
    
    const shopCategories = [
        { id: 'color', name: 'Colors', icon: <Palette className="h-5 w-5" />, items: shopItems.colors },
        { id: 'hat', name: 'Hats', icon: <HatIcon className="h-5 w-5" />, items: shopItems.hats },
        { id: 'shirt', name: 'Shirts', icon: <Shirt className="h-5 w-5" />, items: shopItems.shirts },
        { id: 'shoes', name: 'Shoes', icon: <Footprints className="h-5 w-5" />, items: shopItems.shoes },
    ];


    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customization Shop</h1>
                    <p className="text-muted-foreground">
                        Use your coins to unlock new looks for your AI study buddy.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-2xl font-bold text-amber-500 bg-amber-500/10 px-4 py-2 rounded-lg">
                    <Gem className="h-6 w-6"/>
                    <span>{profile.coins}</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                 {/* Right side: Robot Preview */}
                <div className="lg:col-span-1 lg:sticky top-24">
                     <Card className="overflow-hidden">
                         <div className="aspect-square w-full bg-muted flex items-center justify-center p-4">
                            <AIBuddy 
                                className="w-64 h-64" 
                                color={customizations.color}
                                hat={customizations.hat}
                                shirt={customizations.shirt}
                                shoes={customizations.shoes}
                            />
                        </div>
                     </Card>
                </div>

                {/* Left side: Shop Items */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="color" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                             {shopCategories.map(category => (
                                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                                    {category.icon} {category.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        
                        {shopCategories.map(category => (
                            <TabsContent key={category.id} value={category.id}>
                                <div className={`grid ${category.id === 'color' ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'} gap-4 pt-4`}>
                                    {(category.items as Item[]).map((item: Item) => {
                                        const unlocked = isItemUnlocked(category.id, item.name);
                                        const isEquipped = customizations[category.id] === item.name;
                                        const rarityClass = rarityConfig[item.rarity as keyof typeof rarityConfig] || rarityConfig.Common;
                                        
                                        return (
                                            <Card 
                                                key={item.name}
                                                onClick={() => unlocked && handleSelectItem(category.id, item.name)}
                                                className={cn(
                                                    "p-0 flex flex-col items-center gap-2 transition-all cursor-pointer relative overflow-hidden ring-2",
                                                    isEquipped ? 'ring-primary' : 'ring-transparent hover:ring-primary/50',
                                                    rarityClass.bg
                                                )}
                                            >
                                                <div className="w-full aspect-square flex items-center justify-center p-3">
                                                    {category.id === 'color' ? (
                                                        <div className="w-16 h-16 rounded-full" style={{ backgroundColor: item.hex }}/>
                                                    ) : (
                                                        <AIBuddy 
                                                            className="w-20 h-20"
                                                            {...{[category.id]: item.name}}
                                                            color={category.id === 'hat' ? '#87CEEB' : 'transparent'} // Show default body for hats, transparent otherwise
                                                            />
                                                    )}
                                                </div>
                                                <div className="text-center w-full p-3 pt-0">
                                                    <p className={cn("text-xs font-bold uppercase", rarityClass.text)}>{item.rarity}</p>
                                                    <p className="text-sm font-semibold truncate">{item.name}</p>
                                                </div>
                                                {unlocked ? (
                                                    isEquipped && (
                                                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                                            <CheckCircle className="w-4 h-4"/>
                                                        </div>
                                                    )
                                                ) : (
                                                    <Button size="sm" className="h-7 text-xs w-full rounded-t-none" onClick={(e) => {e.stopPropagation(); handleBuyItem(category.id, item.name, item.price)}} disabled={profile.coins < item.price}>
                                                        <Gem className="w-3 h-3 mr-1" /> {item.price}
                                                    </Button>
                                                )}
                                                {unlocked && (
                                                  <div className="bg-primary/80 text-primary-foreground w-full p-1.5 text-center rounded-b-lg">
                                                      <span className="text-xs font-bold">Equip</span>
                                                  </div>
                                                )}
                                            </Card>
                                        )
                                    })}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
