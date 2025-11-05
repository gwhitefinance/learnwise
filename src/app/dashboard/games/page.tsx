
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Play, Search, Sparkles, Folder, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const games = [
    {
        title: "Match Game",
        description: "Test your memory by matching terms and definitions.",
        thumbnail: "https://picsum.photos/seed/match/400/300",
        href: "/dashboard/games/memory-match"
    },
    {
        title: "City Run",
        description: "Race through a cityscape, answering questions to gain speed.",
        thumbnail: "https://picsum.photos/seed/city/400/300",
        href: "/dashboard/games/city-run"
    },
    {
        title: "Rocket Defender",
        description: "Defend your base by shooting down asteroids with correct answers.",
        thumbnail: "https://picsum.photos/seed/rocket/400/300",
        href: "/dashboard/games/rocket-defender"
    },
    {
        title: "Platform Jump",
        description: "Jump from platform to platform by choosing the right path.",
        thumbnail: "https://picsum.photos/seed/platform/400/300",
        href: "/dashboard/games/platform-jump"
    },
     {
        title: "Track Race",
        description: "Outpace your opponents by answering questions the fastest.",
        thumbnail: "https://picsum.photos/seed/race/400/300",
        href: "/dashboard/games/track-race"
    },
    {
        title: "Jetpack Quiz",
        description: "Fly high by fueling your jetpack with correct answers.",
        thumbnail: "https://picsum.photos/seed/jetpack/400/300",
        href: "/dashboard/games/jetpack-quiz"
    },
    {
        title: "Cloud Bridge",
        description: "Build a bridge across the clouds by sequencing concepts correctly.",
        thumbnail: "https://picsum.photos/seed/bridge/400/300",
        href: "/dashboard/games/cloud-bridge"
    },
     {
        title: "Quiz With Friends",
        description: "Challenge your squad to a live quiz competition.",
        thumbnail: "https://picsum.photos/seed/friends/400/300",
        href: "/dashboard/games/quiz-with-friends"
    }
];

type Course = {
    id: string;
    name: string;
    description: string;
};

export default function GamesPage() {
    const [selectedGame, setSelectedGame] = useState(games[0].title);
    const [generationMethod, setGenerationMethod] = useState('topic');
    const [topic, setTopic] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [user] = useAuthState(auth);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            const q = query(collection(db, 'courses'), where('userId', '==', user.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setCourses(userCourses);
            });
            return () => unsubscribe();
        }
    }, [user]);

    const handleCreateGame = () => {
        const game = games.find(g => g.title === selectedGame);
        if (game) {
            let gameTopic = '';
            if (generationMethod === 'topic') {
                gameTopic = topic;
            } else if (generationMethod === 'course') {
                const course = courses.find(c => c.id === selectedCourse);
                gameTopic = course?.name || '';
            }

            if (!gameTopic) {
                // You might want to show a toast message here
                alert("Please select a topic or course.");
                return;
            }
            
            router.push(`${game.href}?topic=${encodeURIComponent(gameTopic)}`);
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                 <div className="inline-block bg-primary/10 text-primary p-3 rounded-full mb-4">
                     <Gamepad2 className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Turn your files into Games</h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Transform your study materials into fun interactive games with PDF to Game.
                </p>
            </div>

            <Card className="p-6">
                <CardContent className="p-0">
                    <div className="space-y-6">
                        <Tabs value={generationMethod} onValueChange={setGenerationMethod}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="topic">From Topic</TabsTrigger>
                                <TabsTrigger value="course">From Course</TabsTrigger>
                                <TabsTrigger value="materials" disabled>From Materials</TabsTrigger>
                            </TabsList>
                            <TabsContent value="topic">
                                 <div className="space-y-2 pt-2">
                                     <Label className="text-sm font-semibold">Enter a topic to learn about</Label>
                                     <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="e.g., 'The American Revolution'" className="pl-10 h-12" value={topic} onChange={(e) => setTopic(e.target.value)} />
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="course">
                                 <div className="space-y-2 pt-2">
                                    <Label className="text-sm font-semibold">Select an existing course</Label>
                                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Choose a course..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map(course => (
                                                <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TabsContent>
                        </Tabs>

                         <div className="space-y-2">
                             <Label className="text-sm font-semibold">Select a Game</Label>
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {games.map(game => (
                                    <motion.div key={game.title} whileHover={{ scale: 1.05 }} className="cursor-pointer" onClick={() => setSelectedGame(game.title)}>
                                        <Card className={cn("overflow-hidden transition-all", selectedGame === game.title ? "ring-2 ring-primary border-primary" : "")}>
                                            <div className="aspect-video relative">
                                                <Image src={game.thumbnail} alt={game.title} layout="fill" objectFit="cover" />
                                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Play className="h-8 w-8 text-white" />
                                                </div>
                                            </div>
                                             <div className="p-3">
                                                <p className="font-semibold text-sm truncate">{game.title}</p>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                             <Label className="text-sm font-semibold flex items-center gap-1.5">Style Game <Badge variant="outline">Optional</Badge></Label>
                             <div className="relative">
                                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="e.g., 'Retro 80s', 'Neon Cyberpunk', 'Space Adventure'" className="pl-10 h-12"/>
                            </div>
                        </div>

                         <div className="flex justify-end pt-4">
                            <Button size="lg" onClick={handleCreateGame}>
                                Create Game
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
