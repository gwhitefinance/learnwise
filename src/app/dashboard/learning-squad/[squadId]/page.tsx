
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useContext } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc, collection, query, where, updateDoc, arrayRemove, deleteDoc, writeBatch, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Link as LinkIcon, Trash2, Shield, MoreVertical, Copy, Check, Settings, Plus, Briefcase, Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import Loading from './loading';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea';
import { CallContext } from '@/context/CallContext';


type Squad = {
    id: string;
    name: string;
    ownerId: string;
    members: string[];
    inviteCode: string;
    createdAt: any;
    permissions?: {
        allowWhiteboard?: boolean;
        allowCalendar?: boolean;
    }
};

type Member = {
    uid: string;
    displayName: string;
    photoURL?: string;
};

type GroupProject = {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: any;
}

export default function SquadManagementPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { squadId } = params;
    const [user, authLoading] = useAuthState(auth);
    const [squad, setSquad] = useState<Squad | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [projects, setProjects] = useState<GroupProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const { startCall, isInCall } = useContext(CallContext);

    // Dialog state for new project
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');

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
        
        // Listen to projects subcollection
        const projectsColRef = collection(db, 'squads', squadId, 'projects');
        const unsubscribeProjects = onSnapshot(query(projectsColRef), (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as GroupProject));
            setProjects(projectsData);
        });

        return () => {
            unsubscribeSquad();
            unsubscribeMembers();
            unsubscribeProjects();
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
    
    const handleTogglePermission = async (permission: 'allowWhiteboard' | 'allowCalendar', value: boolean) => {
        if (!squad || user?.uid !== squad.ownerId) return;
        const squadRef = doc(db, 'squads', squad.id);
        try {
            await updateDoc(squadRef, {
                [`permissions.${permission}`]: value
            });
        } catch (error) {
            console.error(`Failed to update ${permission}`, error);
            toast({ variant: 'destructive', title: 'Update Failed' });
        }
    }

    const handleAddProject = async () => {
        if (!newProjectName.trim() || !squad || !user) return;
        
        try {
            await addDoc(collection(db, 'squads', squad.id, 'projects'), {
                name: newProjectName,
                description: newProjectDescription,
                createdBy: user.uid,
                squadId: squad.id,
                createdAt: serverTimestamp(),
            });
            toast({ title: 'Project Added!' });
            setNewProjectName('');
            setNewProjectDescription('');
            setIsProjectDialogOpen(false);
        } catch (error) {
            console.error('Error adding project:', error);
            toast({ variant: 'destructive', title: 'Could not add project' });
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
                            <CardTitle className="flex items-center gap-2"><Briefcase />Group Projects</CardTitle>
                            <CardDescription>Shared projects for the squad.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {projects.length > 0 ? (
                                <div className="space-y-4">
                                    {projects.map(project => (
                                        <div key={project.id} className="p-3 rounded-lg bg-muted">
                                            <p className="font-semibold">{project.name}</p>
                                            <p className="text-sm text-muted-foreground">{project.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No group projects yet.</p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <Plus className="h-4 w-4 mr-2"/> Add Project
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add a New Group Project</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="project-name">Project Name</Label>
                                            <Input id="project-name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="e.g., Q3 Marketing Plan"/>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="project-desc">Description</Label>
                                            <Textarea id="project-desc" value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} placeholder="A brief description of the project goals."/>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                        <Button onClick={handleAddProject}>Add Project</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Settings />Permissions</CardTitle>
                            <CardDescription>Control what members can do in this squad.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                               <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                    <div>
                                        <Label htmlFor="whiteboard-permission" className="font-semibold">Shared Whiteboard</Label>
                                        <p className="text-xs text-muted-foreground">Allow members to use a collaborative whiteboard.</p>
                                    </div>
                                    <Switch id="whiteboard-permission" checked={squad.permissions?.allowWhiteboard ?? false} onCheckedChange={(val) => handleTogglePermission('allowWhiteboard', val)} disabled={!isOwner} />
                               </div>
                               <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                    <div>
                                        <Label htmlFor="calendar-permission" className="font-semibold">Shared Calendar</Label>
                                        <p className="text-xs text-muted-foreground">Allow members to view and add to a shared squad calendar.</p>
                                    </div>
                                    <Switch id="calendar-permission" checked={squad.permissions?.allowCalendar ?? false} onCheckedChange={(val) => handleTogglePermission('allowCalendar', val)} disabled={!isOwner} />
                               </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Phone />Squad Call</CardTitle>
                            <CardDescription>Start a video call with your squad members.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Button onClick={() => startCall(members)} disabled={isInCall} className="w-full">
                                {isInCall ? "You are already in a call" : "Start Squad Call"}
                           </Button>
                        </CardContent>
                    </Card>
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
