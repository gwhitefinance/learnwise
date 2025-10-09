
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function JoinSquadPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [user, loading] = useAuthState(auth);
    const inviteCode = params.inviteCode as string;

    useEffect(() => {
        if (loading) {
            return; // Wait until authentication state is loaded
        }

        if (!user) {
            // User is not logged in, store invite code and redirect to signup
            localStorage.setItem('squadInviteCode', inviteCode);
            router.push('/signup');
            return;
        }

        // User is logged in, attempt to join the squad
        const joinSquad = async () => {
            if (!inviteCode) return;
            
            const squadsRef = collection(db, 'squads');
            const q = query(squadsRef, where('inviteCode', '==', inviteCode));
            
            try {
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const squadDoc = querySnapshot.docs[0];
                    // Add the user to the members array
                    await updateDoc(squadDoc.ref, {
                        members: arrayUnion(user.uid)
                    });
                    toast({ title: "Squad Joined!", description: `Welcome to ${squadDoc.data().name}!` });
                } else {
                    toast({ variant: 'destructive', title: 'Invalid Invite Code', description: 'This squad does not exist.' });
                }
            } catch (error) {
                console.error("Error joining squad:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not join the squad.' });
            } finally {
                // Redirect to the dashboard regardless of outcome
                router.push('/dashboard/learning-squad');
            }
        };

        joinSquad();

    }, [user, loading, inviteCode, router, toast]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Joining squad, please wait...</p>
        </div>
    );
}
