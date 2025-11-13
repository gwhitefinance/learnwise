

'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette, Shirt, CheckCircle, Footprints, GraduationCap as HatIcon, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import shopItemsData from '@/lib/shop-items.json';
import { useToast } from '@/hooks/use-toast';
import AIBuddy from '@/components/ai-buddy';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TazCoinIcon from '@/components/TazCoinIcon';

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
                        <TazCoinIcon className="w-4 h-4 mr-1.5" /> {item.price}
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
        const seed = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();
        
        function seededRandom(seed: number) {
            let x = Math.sin(seed) * 10000;
            return x - Math.floor(x);
        }

        const newDailyItems: Record<string, Item> = {};
        const featuredItems = {
            color: shopItems.colors.find(i => i.name === 'Cranberry'),
            hat: shopItems.hats.find(i => i.name === 'Santa Hat'),
            shirt: shopItems.shirts.find(i => i.name === 'Ugly Christmas Sweater'),
            shoes: shopItems.shoes.find(i => i.name === 'Boots'),
        };

        setDailyItems(featuredItems as Record<string, Item>);
        
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
            
             <div className="bg-red-600 text-white rounded-2xl p-6 text-center shadow-lg">
                <h2 className="text-3xl font-bold font-bubble tracking-wider">It's Tiiiimeee!</h2>
                <p className="font-semibold">Our Christmas update is here! Check out the festive items below.</p>
            </div>

            <Card className="bg-gradient-to-r from-red-500 to-rose-700 text-white">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Sparkles/> Holiday Specials
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
