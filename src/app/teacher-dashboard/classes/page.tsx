
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function ClassesPage() {
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
                    <p className="text-muted-foreground">Manage your class sections and rosters.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Class
                </Button>
            </div>

            <Card className="text-center p-12">
                <CardHeader>
                    <CardTitle>No classes created yet</CardTitle>
                    <CardDescription>Get started by creating your first class to enroll students and assign content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button>Create Your First Class</Button>
                </CardContent>
            </Card>
        </div>
    );
}
