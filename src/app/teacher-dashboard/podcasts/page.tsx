
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Podcast, Play, User, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const mockEpisodes = [
    {
        title: "The Mitochondria Powerhouse",
        student: "Olivia Martin",
        avatar: "/avatars/01.png",
        duration: "3:45",
        isFeatured: true,
    },
    {
        title: "Solving Linear Equations",
        student: "Liam Garcia",
        avatar: "/avatars/02.png",
        duration: "5:12",
        isFeatured: false,
    },
    {
        title: "Causes of the Civil War",
        student: "Emma Rodriguez",
        avatar: "/avatars/03.png",
        duration: "4:30",
        isFeatured: false,
    },
];

export default function TeacherPodcastsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Podcast Studio</h1>
                <p className="text-muted-foreground">Review and feature your students' best podcast episodes.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Student Submissions</CardTitle>
                    <CardDescription>Listen to recent podcast assignments and highlight excellent work.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockEpisodes.map(episode => (
                        <Card key={episode.title} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="icon" className="h-12 w-12 flex-shrink-0">
                                    <Play className="h-6 w-6"/>
                                </Button>
                                <div>
                                    <p className="font-semibold">{episode.title}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src={episode.avatar} />
                                            <AvatarFallback>{episode.student.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{episode.student}</span>
                                        <span>&#8226;</span>
                                        <span>{episode.duration}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {episode.isFeatured && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600"><Star className="mr-1 h-3 w-3"/> Featured</Badge>}
                                <Button variant="ghost" size="sm">
                                    <Star className="mr-2 h-4 w-4"/> Feature
                                </Button>
                            </div>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
