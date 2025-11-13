
'use client';

import AIBuddy from '@/components/ai-buddy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const allSpecies = ["Zappy", "Seedling", "Ember", "Shelly", "Puff", "Goo", "Chirpy", "Sparky", "Rocky", "Splash", "Bear", "Lion", "Panda", "Fox", "Bunny"];

export default function TazShowroomPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Taz Showroom</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {allSpecies.map((species) => (
                    <Card key={species}>
                        <CardHeader>
                            <CardTitle>{species}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center p-4">
                            <div className="w-32 h-32">
                                <AIBuddy species={species} isStatic={true} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
