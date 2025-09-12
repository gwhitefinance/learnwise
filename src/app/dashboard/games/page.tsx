
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Gamepad2, Brain, Flame, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

const games = [
    {
        title: "Memory Match",
        description: "Test your recall by matching terms with their definitions. Great for vocabulary and key concepts.",
        href: "/dashboard/games/memory-match",
        icon: <Brain className="w-10 h-10 text-purple-500" />
    },
    {
        title: "Snake",
        description: "A classic game of snake where eating food triggers a quiz question. Grow your snake by answering correctly!",
        href: "/dashboard/games/snake",
        icon: <Flame className="w-10 h-10 text-orange-500" />
    },
    {
        title: "Trivia Blaster",
        description: "An arcade-style shooter. A question appears, and you must shoot the correct answer asteroid.",
        href: "/dashboard/games/trivia-blaster",
        icon: <Rocket className="w-10 h-10 text-blue-500" />
    }
];

export default function GamesPage() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight">Study Games</h1>
                <p className="text-muted-foreground mt-2">
                    Make learning fun by choosing one of the games below.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game, index) => (
                    <motion.div
                        key={game.title}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <Link href={game.href} passHref>
                            <Card className="h-full hover:shadow-lg hover:border-primary transition-all cursor-pointer flex flex-col">
                                <CardHeader className="flex-grow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="bg-muted p-3 rounded-lg">
                                            {game.icon}
                                        </div>
                                        <CardTitle>{game.title}</CardTitle>
                                    </div>
                                    <CardDescription>{game.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm font-semibold text-primary">Play Now &rarr;</div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
