
'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Lightbulb, TrendingUp, Gem, Shield, Star, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

// Mock Data
const mockStudent = {
    name: 'Olivia Martin',
    avatar: '/avatars/01.png',
    email: 'olivia.martin@example.com',
    learningStyle: 'Visual',
    motivationStyle: 'Achievement-oriented',
    strengths: ['Quick to grasp concepts from diagrams', 'Consistent quiz performance'],
    struggles: ['Abstract algebraic concepts', 'Maintaining focus during long texts'],
    averageScore: 92,
    assignmentsCompleted: 18,
    totalAssignments: 20,
    coins: 1250,
    badges: ['Perfect Score', 'Quick Learner', '7-Day Streak']
};

export default function StudentProfilePage() {
    const router = useRouter();
    const params = useParams();
    const { studentId } = params;

    // In a real app, you would fetch student data based on the studentId
    const student = mockStudent;

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.push('/teacher-dashboard/students')}>
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Student Roster
            </Button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                     <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                             <Avatar className="h-20 w-20">
                                <AvatarImage src={student.avatar} />
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-3xl">{student.name}</CardTitle>
                                <CardDescription>{student.email}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Avg. Score</p>
                                <p className="text-2xl font-bold">{student.averageScore}%</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Assignments</p>
                                <p className="text-2xl font-bold">{student.assignmentsCompleted}/{student.totalAssignments}</p>
                            </div>
                             <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Coins Earned</p>
                                <p className="text-2xl font-bold flex items-center justify-center gap-1 text-amber-500"><Gem size={20}/> {student.coins}</p>
                            </div>
                              <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Badges</p>
                                <p className="text-2xl font-bold flex items-center justify-center gap-1 text-yellow-500"><Star size={20}/> {student.badges.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Timeline</CardTitle>
                            <CardDescription>Visual growth over time in engagement, quizzes, and activities.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
                                <p className="text-muted-foreground">Timeline chart coming soon...</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Learning Profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm">Learning Style</h4>
                                <p className="p-2 bg-blue-500/10 text-blue-700 rounded-md mt-1 font-medium text-center">{student.learningStyle}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-sm">Motivation Style</h4>
                                <p className="p-2 bg-purple-500/10 text-purple-700 rounded-md mt-1 font-medium text-center">{student.motivationStyle}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-sm">Strengths</h4>
                                <ul className="list-disc list-inside text-muted-foreground text-sm mt-1 space-y-1">
                                    {student.strengths.map(s => <li key={s}>{s}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm">Struggle Areas</h4>
                                <ul className="list-disc list-inside text-muted-foreground text-sm mt-1 space-y-1">
                                    {student.struggles.map(s => <li key={s}>{s}</li>)}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="bg-green-500/10 border-green-500/20">
                        <CardHeader>
                            <CardTitle className="text-green-700 flex items-center gap-2"><Lightbulb /> AI Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                             <div className="text-sm text-green-800/80">
                                <p className="font-semibold">- Suggest visual aids for algebra.</p>
                                <p>- Break down long reading assignments into smaller chunks.</p>
                                <p>- Provide project-based challenges to leverage achievement motivation.</p>
                            </div>
                            <Button variant="outline" className="w-full border-green-500/50 bg-transparent hover:bg-green-500/10 text-green-700">
                                Create Remediation Plan
                            </Button>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Motivation Metrics</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-2">
                            {student.badges.map(badge => (
                                <div key={badge} className="flex items-center gap-2 text-sm p-2 bg-muted rounded-md">
                                    <Award className="h-5 w-5 text-yellow-500" />
                                    <span className="font-medium">{badge}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
