
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, ArrowRight, BookOpen, BarChart3, Users } from "lucide-react";
import Link from "next/link";

export default function StudentsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Student Insights</h1>
                <p className="text-muted-foreground">Manage your student roster and view class-wide analytics.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <Users className="h-6 w-6 text-primary"/>
                            </div>
                            <div>
                                <CardTitle>Student Roster</CardTitle>
                                <CardDescription>View and manage individual student profiles.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Link href="/teacher-dashboard/students/1">
                            <Button className="w-full">
                                View Roster <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                 <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-primary"/>
                            </div>
                            <div>
                                <CardTitle>Class-wide Analytics</CardTitle>
                                <CardDescription>Get insights into overall class performance and trends.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" disabled>
                            Coming Soon
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
