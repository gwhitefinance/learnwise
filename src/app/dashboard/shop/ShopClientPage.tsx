

'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette, Shirt, CheckCircle, Footprints, GraduationCap as HatIcon, Sparkles, Clock, Copy, Check, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import shopItemsData from '@/lib/shop-items.json';
import { useToast } from '@/hooks/use-toast';
import AIBuddy from '@/components/ai-buddy';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TazCoinIcon from '@/components/TazCoinIcon';
import { Input } from '@/components/ui/input';

type UserProfile = {
    displayName: string;
    email: string;
    coins: number;
    unlockedItems?: Record<string, string[]>;
    taz?: {
        species: string;
    };
};

type Item = {
    name: string;
    price: number;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
    hex?: string;
    originalPrice?: number;
};

const rarityConfig = {
    Common: { text: 'text-gray-400', ring: 'ring-gray-500/30', bg: 'bg-gray-500/10' },
    Uncommon: { text: 'text-green-400', ring: 'ring-green-500/30', bg: 'bg-green-500/10' },
    Rare: { text: 'text-blue-400', ring: 'ring-blue-500/30', bg: 'bg-blue-500/10' },
    Epic: { text: 'text-purple-400', ring: 'ring-purple-500/30', bg: 'bg-purple-500/10' },
    Legendary: { text: 'text-orange-400', ring: 'ring-orange-500/30', bg: 'bg-orange-500/10' },
};

const shopItems: Record<string, Item[]> = shopItemsData as Record<string, Item[]>;

const DailyItemCard = ({ species, category, item, onBuy, onSelect, isEquipped, hasPurchased, userCoins }: { species?: string, category: string, item: Item, onBuy: (category: string, itemName: string, price: number) => void, onSelect: (category: string, itemName: string) => void, isEquipped: boolean, hasPurchased: boolean, userCoins: number }) => {
    const rarityClass = rarityConfig[item.rarity as keyof typeof rarityConfig] || rarityConfig.Common;
    const categoryIcons = {
        color: <Palette className="h-5 w-5" />,
        hat: <HatIcon className="h-5 w-5" />,
        shirt: <Shirt className="h-5 w-5" />,
        shoes: <Footprints className="h-5 w-5" />,
    };

    return (
        <Card 
            onClick={() => hasPurchased && onSelect(category, item.name)}
            className={cn(
                "p-0 flex flex-col items-center gap-2 transition-all cursor-pointer relative overflow-hidden ring-2 w-full",
                isEquipped ? 'ring-primary' : 'ring-transparent hover:ring-primary/50',
                rarityClass.bg
            )}
        >
             {item.originalPrice && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 text-xs font-bold bg-yellow-400 text-yellow-900 rounded-full flex items-center gap-1">
                    <Percent className="h-3 w-3"/> On Sale!
                </div>
            )}
            <div className="w-full aspect-square flex items-center justify-center p-3 relative">
                <div className="absolute top-2 left-2 p-1.5 bg-background/50 rounded-full">
                     {(categoryIcons as any)[category]}
                </div>
                {category === 'color' ? (
                    <div className="w-20 h-20 rounded-full" style={{ backgroundColor: item.hex }}/>
                ) : (
                    <AIBuddy 
                        className="w-24 h-24"
                        species={species}
                        {...{[category]: item.name}}
                        color={category === 'hat' ? '#87CEEB' : 'transparent'} 
                    />
                )}
            </div>
            <div className="text-center w-full px-3 pt-0">
                <p className={cn("text-xs font-bold uppercase", rarityClass.text)}>{item.rarity}</p>
                <p className="text-sm font-semibold truncate">{item.name}</p>
            </div>
            
            <div className="w-full p-2">
                {!hasPurchased ? (
                    <Button
                        size="sm"
                        className="h-8 text-xs w-full bg-blue-600 hover:bg-blue-700"
                        onClick={(e) => { e.stopPropagation(); onBuy(category, item.name, item.price); }}
                        disabled={userCoins < item.price}
                    >
                        <TazCoinIcon className="w-4 h-4 mr-1.5" /> 
                        {item.originalPrice && <span className="mr-1.5 text-red-300 line-through">{item.originalPrice}</span>}
                        {item.price}
                    </Button>
                ) : isEquipped ? (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs w-full bg-green-600 hover:bg-green-700 text-white cursor-default"
                    >
                        <CheckCircle className="w-3 h-3 mr-1.5" /> Equipped
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs w-full"
                        onClick={() => onSelect(category, item.name)}
                    >
                        Equip
                    </Button>
                )}
            </div>
        </Card>
    )
}

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
    const [copied, setCopied] = useState(false);

    // Daily Shop State
    const [dailyItems, setDailyItems] = useState<Record<string, Item>>({});
    const [timeUntilRefresh, setTimeUntilRefresh] = useState('');

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

        // --- Daily Shop Logic ---
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        
        let currentSeed = seed;
        function seededRandom() {
            const x = Math.sin(currentSeed++) * 10000;
            return x - Math.floor(x);
        }

        const selectDailyItem = (items: Item[]) => {
            const randomIndex = Math.floor(seededRandom() * items.length);
            const selected = items[randomIndex];
            const originalPrice = selected.price;
            // Apply a 15% discount, rounded to the nearest 5 coins
            const discountedPrice = Math.round((originalPrice * 0.85) / 5) * 5;
            return { ...selected, price: discountedPrice, originalPrice };
        };

        const newDailyItems: Record<string, Item> = {
            color: selectDailyItem(shopItems.colors),
            hat: selectDailyItem(shopItems.hats),
            shirt: selectDailyItem(shopItems.shirts),
            shoes: selectDailyItem(shopItems.shoes),
        };
        setDailyItems(newDailyItems);
        
        const timer = setInterval(() => {
            const now = new Date();
            const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            const diff = midnight.getTime() - now.getTime();
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeUntilRefresh(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => {
            unsubscribe();
            clearInterval(timer);
        };
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
    
    const copyReferralLink = () => {
        if (!user) return;
        const link = `${window.location.origin}/signup?ref=${user.uid}`;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            toast({ title: 'Referral link copied!' });
            setTimeout(() => setCopied(false), 2000);
        });
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
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                <Skeleton className="w-full aspect-square"/>
                                <Skeleton className="w-full aspect-square"/>
                                <Skeleton className="w-full aspect-square"/>
                                <Skeleton className="w-full aspect-square hidden md:block"/>
                            </div>
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
    
    const hasPurchased = (category: string, itemName: string) => {
        const item = (shopItems as any)[`${category}s`]?.find((i: any) => i.name === itemName);
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
                    <TazCoinIcon className="h-7 w-7"/>
                    <span>{profile.coins}</span>
                </div>
            </div>

             <div className="bg-red-600 text-white p-4 rounded-xl text-center font-bold shadow-lg">
                🎄 Our Christmas Update is Here! Check out the daily deals for festive items! 🎄
            </div>

            <Card className="bg-gradient-to-r from-blue-500 to-indigo-700 text-white">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles/> Daily Deals
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                            <Clock className="h-4 w-4"/>
                            <span>Refreshes in: {timeUntilRefresh}</span>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(dailyItems).map(([category, item]) => {
                        const isEquipped = customizations[category] === item.name;
                        const purchased = hasPurchased(category, item.name);
                        return (
                             <DailyItemCard 
                                key={item.name}
                                species={profile.taz?.species}
                                category={category} 
                                item={item}
                                onBuy={handleBuyItem}
                                onSelect={handleSelectItem}
                                isEquipped={isEquipped}
                                hasPurchased={purchased}
                                userCoins={profile.coins}
                            />
                        )
                    })}
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                 {/* Right side: Robot Preview */}
                <div className="lg:col-span-1 lg:sticky top-24">
                     <Card className="overflow-hidden">
                         <div className="aspect-square w-full bg-muted flex items-center justify-center p-4">
                            <AIBuddy 
                                className="w-64 h-64" 
                                species={profile.taz?.species}
                                color={customizations.color}
                                hat={customizations.hat}
                                shirt={customizations.shirt}
                                shoes={customizations.shoes}
                            />
                        </div>
                     </Card>
                     <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Refer a Friend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Share your link with friends. You both get <span className="font-bold text-amber-500">500 coins</span> when they sign up!</p>
                            <div className="flex gap-2">
                                <Input value={`${window.location.origin}/signup?ref=${user?.uid}`} readOnly />
                                <Button onClick={copyReferralLink} size="icon" variant="outline">
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </CardContent>
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
                                        const purchased = hasPurchased(category.id, item.name);
                                        const isEquipped = customizations[category.id] === item.name;
                                        
                                        return (
                                            <DailyItemCard
                                                key={item.name}
                                                species={profile.taz?.species}
                                                category={category.id}
                                                item={item}
                                                onBuy={handleBuyItem}
                                                onSelect={handleSelectItem}
                                                isEquipped={isEquipped}
                                                hasPurchased={purchased}
                                                userCoins={profile.coins}
                                            />
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
