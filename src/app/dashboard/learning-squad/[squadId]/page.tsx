
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Loading from './loading';

type Squad = {
    id: string;
    name: string;
    ownerId: string;
    members: string[];
    inviteCode: string;
    createdAt: any;
};

export default function SquadManagementPage() {
    const params = useParams();
    const router = useRouter();
    const { squadId } = params;
    const [user, authLoading] = useAuthState(auth);
    const [squad, setSquad] = useState<Squad | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) return;

        if (!user && !authLoading) {
            router.push('/login');
            return;
        }

        if (typeof squadId !== 'string') {
            setLoading(false);
            return;
        }

        const squadDocRef = doc(db, 'squads', squadId);
        const unsubscribe = onSnapshot(squadDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const squadData = { id: docSnap.id, ...docSnap.data() } as Squad;
                // Basic check to ensure user is part of the squad
                if (squadData.members.includes(user.uid)) {
                    setSquad(squadData);
                } else {
                    // Handle case where user is not a member
                    setSquad(null);
                }
            } else {
                setSquad(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, squadId, router]);


    if (loading || authLoading) {
        return <Loading />;
    }

    if (!squad) {
        return (
            <div>
                <h1 className="text-2xl font-bold">Squad not found</h1>
                <p>You may not have access to this squad or it may have been deleted.</p>
                <Button onClick={() => router.push('/dashboard/learning-squad')} className="mt-4">
                    Back to Squads
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.push('/dashboard/learning-squad')}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to All Squads
            </Button>
            <h1 className="text-3xl font-bold">Manage: {squad.name}</h1>
            <p className="text-muted-foreground">This is where you'll manage your squad members, shared resources, and settings.</p>
        </div>
    )
}
