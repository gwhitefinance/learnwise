
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

export default function LearningSquadPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Learning Squad</h1>
                <p className="text-muted-foreground">Collaborate with friends, share resources, and learn together.</p>
            </div>

            <Card className="text-center p-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">Create Your First Squad</h2>
                <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                    Invite your friends to form a study group. You can share notes, track progress on courses, and motivate each other.
                </p>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create a Squad
                </Button>
            </Card>
        </div>
    );
}
