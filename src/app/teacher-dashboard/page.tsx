
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, BarChart, AlertTriangle, Calendar as CalendarIcon, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from 'recharts';
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Mock Data
const totalStudents = 128;
const averageScore = 84;
const assignmentsDue = 3;

const studentsData = [
    { name: 'Olivia Martin', avatar: '/avatars/01.png', progress: 85, score: 92, engagement: 'High', time: '12h 30m' },
    { name: 'Liam Garcia', avatar: '/avatars/02.png', progress: 95, score: 98, engagement: 'High', time: '14h 15m' },
    { name: 'Emma Rodriguez', avatar: '/avatars/03.png', progress: 60, score: 75, engagement: 'Medium', time: '9h 45m' },
    { name: 'Noah Smith', avatar: '/avatars/04.png', progress: 30, score: 68, engagement: 'Low', time: '5h 20m' },
    { name: 'Ava Johnson', avatar: '/avatars/05.png', progress: 78, score: 88, engagement: 'High', time: '11h 5m' },
];

const learningStylesData = [
  { style: 'Visual', students: 55, className: 'bg-blue-400' },
  { style: 'Auditory', students: 30, className: 'bg-purple-400' },
  { style: 'Kinesthetic', students: 25, className: 'bg-emerald-400' },
  { style: 'Reading/Writing', students: 18, className: 'bg-amber-400' },
];

const heatmapData = {
    topics: ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics'],
    students: ['Student A', 'Student B', 'Student C', 'Student D', 'Student E'],
    scores: [
        [95, 80, 88, 75, 92],
        [70, 85, 90, 88, 78],
        [55, 65, 70, 60, 72],
        [98, 92, 95, 99, 100],
        [82, 88, 85, 90, 87],
    ]
};

const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/80';
    if (score >= 80) return 'bg-green-500/60';
    if (score >= 70) return 'bg-yellow-500/60';
    if (score >= 60) return 'bg-yellow-500/40';
    return 'bg-red-500/60';
}

const alertsData = [
    { student: 'Noah Smith', issue: 'Low Engagement', details: 'Completed only 1 of 5 tasks this week.'},
    { student: 'Emma Rodriguez', issue: 'Struggling Topic', details: 'Scored 55% on Geometry quiz.'},
    { student: 'Liam Garcia', issue: 'Excelling', details: 'Completed all assignments 3 days early.'}
];

const calendarEvents = [
    { date: new Date(2025, 6, 12), title: 'Midterm Exams' },
    { date: new Date(2025, 6, 25), title: 'Project Alpha Due' },
];


export default function TeacherDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome, Teacher!</h1>
                    <p className="text-muted-foreground">Here's an overview of your classes and students.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{totalStudents}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{averageScore}%</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assignments Due</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{assignmentsDue}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Class Overview</CardTitle>
                        <CardDescription>Track student progress and engagement.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead className="text-center">Quiz Score</TableHead>
                                    <TableHead className="text-center">Time Spent</TableHead>
                                    <TableHead className="text-right">Engagement</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentsData.map(student => (
                                    <TableRow key={student.name}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={student.avatar} alt={student.name} />
                                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{student.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Progress value={student.progress} className="w-[120px]"/>
                                        </TableCell>
                                        <TableCell className="text-center font-medium">{student.score}%</TableCell>
                                        <TableCell className="text-center text-muted-foreground">{student.time}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={student.engagement === 'High' ? 'default' : student.engagement === 'Medium' ? 'secondary' : 'destructive'}
                                            className={cn(
                                                student.engagement === 'High' && 'bg-green-500/20 text-green-700 border-green-500/30',
                                                student.engagement === 'Medium' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
                                                student.engagement === 'Low' && 'bg-red-500/20 text-red-700 border-red-500/30',
                                            )}>
                                                {student.engagement}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Learning Style Insights</CardTitle>
                            <CardDescription>AI-powered breakdown of your class.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center">
                                <ChartContainer config={{}} className="h-40 w-40">
                                     <PieChart>
                                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                        <Pie data={learningStylesData} dataKey="students" nameKey="style" innerRadius={25} strokeWidth={5}>
                                            <Cell fill="#60a5fa" />
                                            <Cell fill="#a78bfa" />
                                            <Cell fill="#34d399" />
                                            <Cell fill="#fbbf24" />
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                            </div>
                             <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                {learningStylesData.map(item => (
                                    <div key={item.style} className="flex items-center gap-2">
                                        <div className={cn("h-3 w-3 rounded-full", item.className)}></div>
                                        <span className="font-medium text-muted-foreground">{item.style}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>AI-Generated Alerts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                             {alertsData.map(alert => (
                                <div key={alert.student} className="flex items-start gap-3">
                                    <div className="p-2 bg-yellow-500/10 rounded-full mt-1">
                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{alert.issue}: {alert.student}</p>
                                        <p className="text-xs text-muted-foreground">{alert.details}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Progress Heatmap</CardTitle>
                        <CardDescription>Visualize class-wide understanding of key topics.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex">
                            <div className="flex flex-col justify-between pt-10 text-xs text-muted-foreground">
                                {heatmapData.students.map(student => (
                                    <div key={student} className="h-8 flex items-center pr-2">{student}</div>
                                ))}
                            </div>
                            <div className="flex-1">
                                <div className="grid grid-cols-5 gap-1">
                                    {heatmapData.topics.map(topic => (
                                        <div key={topic} className="text-center text-xs font-semibold text-muted-foreground h-8">{topic}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-5 gap-1">
                                    {heatmapData.scores.flat().map((score, index) => (
                                        <div key={index} className={cn("h-8 w-full rounded", getScoreColor(score))}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Smart Calendar</CardTitle>
                        <CardDescription>Upcoming due dates and events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="multiple"
                            selected={calendarEvents.map(e => e.date)}
                            className="p-0"
                            components={{
                                DayContent: ({ date }) => {
                                  const event = calendarEvents.find(e => e.date.toDateString() === date.toDateString());
                                  return (
                                    <div className="relative h-full w-full">
                                      {date.getDate()}
                                      {event && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary"></div>}
                                    </div>
                                  );
                                },
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
