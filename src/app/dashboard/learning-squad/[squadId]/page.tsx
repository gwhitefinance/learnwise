
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc, collection, query, where, updateDoc, arrayRemove, deleteDoc, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Link as LinkIcon, Trash2, Shield, MoreVertical, Copy, Check, Settings } from 'lucide-react';
import Loading from './loading';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


type Squad = {
    id: string;
    name: string;
    ownerId: string;
    members: string[];
    inviteCode: string;
    createdAt: any;
};

type Member = {
    uid: string;
    displayName: string;
    photoURL?: string;
};

export default function SquadManagementPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { squadId } = params;
    const [user, authLoading] = useAuthState(auth);
    const [squad, setSquad] = useState<Squad | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

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
        
        const unsubscribeSquad = onSnapshot(squadDocRef, (docSnap) => {
             if (docSnap.exists()) {
                const squadData = { id: docSnap.id, ...docSnap.data() } as Squad;
                if (squadData.members.includes(user.uid)) {
                    setSquad(squadData);
                } else {
                    setSquad(null); // User is not a member, access denied
                }
            } else {
                setSquad(null); // Squad doesn't exist
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching squad:", error);
            toast({ variant: 'destructive', title: 'Permission Error', description: 'You may not have access to this squad.'})
            setSquad(null);
            setLoading(false);
        });

        // Listen to memberDetails subcollection
        const memberDetailsColRef = collection(db, 'squads', squadId, 'memberDetails');
        const unsubscribeMembers = onSnapshot(memberDetailsColRef, (snapshot) => {
            const membersData = snapshot.docs.map(doc => doc.data() as Member);
            setMembers(membersData);
        });

        return () => {
            unsubscribeSquad();
            unsubscribeMembers();
        };
    }, [user, authLoading, squadId, router, toast]);
    
    const copyInviteLink = () => {
        if (!squad) return;
        const link = `${window.location.origin}/squad/join/${squad.inviteCode}`;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            toast({ title: 'Invite link copied!' });
            setTimeout(() => setCopied(false), 2000);
        });
    }

    const removeMember = async (memberId: string) => {
        if (!squad || user?.uid !== squad.ownerId) return;

        const batch = writeBatch(db);
        const squadRef = doc(db, 'squads', squad.id);
        const memberDetailRef = doc(db, 'squads', squad.id, 'memberDetails', memberId);

        batch.update(squadRef, {
            members: arrayRemove(memberId)
        });
        batch.delete(memberDetailRef);
        
        try {
            await batch.commit();
            toast({ title: "Member removed" });
        } catch (error) {
            console.error("Error removing member:", error);
            toast({ variant: 'destructive', title: "Failed to remove member" });
        }
    };
    
    const handleDeleteSquad = async () => {
        if (!squad || user?.uid !== squad.ownerId) return;

        try {
            await deleteDoc(doc(db, 'squads', squad.id));
            toast({ title: "Squad Deleted", description: "The squad has been permanently removed."});
            router.push('/dashboard/learning-squad');
        } catch (error) {
            console.error("Error deleting squad:", error);
            toast({ variant: 'destructive', title: "Deletion Failed"});
        }
    }

    const isOwner = user?.uid === squad?.ownerId;

    if (loading || authLoading) {
        return <Loading />;
    }

    if (!squad) {
        return (
            <div>
                <Button variant="ghost" onClick={() => router.push('/dashboard/learning-squad')} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to All Squads
                </Button>
                <h1 className="text-2xl font-bold">Squad not found</h1>
                <p>You may not have access to this squad or it may have been deleted.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.push('/dashboard/learning-squad')}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to All Squads
            </Button>
            <div>
                <h1 className="text-3xl font-bold">Manage Squad: {squad.name}</h1>
                <p className="text-muted-foreground">Manage members, permissions, and settings for your squad.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users />Members ({squad.members.length})</CardTitle>
                            <CardDescription>View and manage who is in your squad.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {members.map(member => (
                                    <div key={member.uid} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={member.photoURL} />
                                                <AvatarFallback>{member.displayName?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{member.displayName}</p>
                                                <p className="text-xs text-muted-foreground">{member.uid === squad.ownerId ? 'Owner' : 'Member'}</p>
                                            </div>
                                        </div>
                                        {isOwner && member.uid !== user?.uid && (
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4"/>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                                <Trash2 className="mr-2 h-4 w-4" /> Remove Member
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove {member.displayName}?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to remove this member from the squad? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => removeMember(member.uid)}>Remove</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Settings />Permissions</CardTitle>
                            <CardDescription>Control what members can do in this squad.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                               <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                    <div>
                                        <Label htmlFor="edit-permission" className="font-semibold">Allow members to edit course content</Label>
                                        <p className="text-xs text-muted-foreground">Allows members to add/remove units and chapters.</p>
                                    </div>
                                    <Switch id="edit-permission" disabled={!isOwner} />
                               </div>
                               <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                    <div>
                                        <Label htmlFor="note-permission" className="font-semibold">Allow members to add notes</Label>
                                        <p className="text-xs text-muted-foreground">Allows members to create new notes linked to the squad.</p>
                                    </div>
                                    <Switch id="note-permission" disabled={!isOwner} />
                               </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><LinkIcon />Invite Link</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">Share this link to invite others to join your squad.</p>
                             <div className="flex gap-2">
                                <Input value={`${window.location.origin}/squad/join/${squad.inviteCode}`} readOnly />
                                <Button onClick={copyInviteLink} size="icon" variant="outline">
                                    {copied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-destructive/10 border-destructive/20">
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full" disabled={!isOwner}>Delete Squad</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the squad and all of its data.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteSquad}>Delete Squad</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
