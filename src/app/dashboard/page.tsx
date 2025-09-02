
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>This is your central hub for studying.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Use the navigation on the left to get started.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
