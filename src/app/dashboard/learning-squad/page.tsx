
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Copy, Check, Link as LinkIcon, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { nanoid } from 'nanoid';

type Squad = {
    id: string;
    name: string;
    ownerId: string;
    members: string[];
    inviteCode: string;
    createdAt: any;
};

export default function LearningSquadPage() {
    const [user, authLoading] = useAuthState(auth);
    const { toast } = useToast();
    const [squads, setSquads] = useState<Squad[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newSquadName, setNewSquadName] = useState('');
    const [copiedLink, setCopiedLink] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !user) return;

        const q = query(collection(db, 'squads'), where('members', 'array-contains', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userSquads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Squad));
            setSquads(userSquads);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    const handleCreateSquad = async () => {
        if (!newSquadName.trim() || !user) {
            toast({ variant: 'destructive', title: 'Squad name is required.' });
            return;
        }

        setIsCreating(true);
        try {
            const inviteCode = nanoid(10);
            await addDoc(collection(db, 'squads'), {
                name: newSquadName,
                ownerId: user.uid,
                members: [user.uid],
                inviteCode: inviteCode,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Squad Created!', description: `"${newSquadName}" is ready.`});
            setNewSquadName('');
        } catch (error) {
            console.error("Error creating squad:", error);
            toast({ variant: 'destructive', title: 'Failed to create squad.' });
        } finally {
            setIsCreating(false);
        }
    };

    const copyToClipboard = (inviteCode: string) => {
        const link = `${window.location.origin}/squad/join/${inviteCode}`;
        navigator.clipboard.writeText(link).then(() => {
            setCopiedLink(inviteCode);
            toast({ title: 'Invite link copied!' });
            setTimeout(() => setCopiedLink(null), 2000);
        });
    };

    if (isLoading || authLoading) {
         return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Learning Squads</h1>
                    <p className="text-muted-foreground">Collaborate with friends, share resources, and learn together.</p>
                </div>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create a Squad
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a New Squad</DialogTitle>
                            <DialogDescription>Give your new learning squad a name.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="squad-name">Squad Name</Label>
                            <Input id="squad-name" value={newSquadName} onChange={(e) => setNewSquadName(e.target.value)} placeholder="e.g., The Study Buddies" />
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" >Cancel</Button>
                            <Button onClick={handleCreateSquad} disabled={isCreating}>
                                {isCreating ? 'Creating...' : 'Create Squad'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {squads.length === 0 ? (
                <Card className="text-center p-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold">You're not in any squads yet</h2>
                    <p className="text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
                        Create a squad to start collaborating with your friends.
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {squads.map(squad => (
                        <Card key={squad.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{squad.name}</CardTitle>
                                <CardDescription>{squad.members.length} member(s)</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="flex -space-x-2 overflow-hidden">
                                    {squad.members.slice(0, 5).map(memberId => (
                                        <Avatar key={memberId} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                            <AvatarFallback>{memberId.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                     {squad.members.length > 5 && (
                                        <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                            <AvatarFallback>+{squad.members.length - 5}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="outline" onClick={() => copyToClipboard(squad.inviteCode)}>
                                    {copiedLink === squad.inviteCode ? <Check className="mr-2 h-4 w-4" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                                    {copiedLink === squad.inviteCode ? 'Copied!' : 'Copy Invite Link'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
