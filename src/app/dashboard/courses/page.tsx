
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function CoursesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Courses</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon!</CardTitle>
            <CardDescription>This page is under construction.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Check back later for course information.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
