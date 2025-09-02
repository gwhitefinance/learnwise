
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function WhiteboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Whiteboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Digital Whiteboard</CardTitle>
          <CardDescription>
            Use this space for brainstorming, drawing diagrams, and taking notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg border border-dashed flex items-center justify-center">
            <p className="text-muted-foreground">Whiteboard area</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
