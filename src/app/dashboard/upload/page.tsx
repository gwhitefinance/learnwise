
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function UploadPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Upload Materials</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload Class Information and Documents</CardTitle>
          <CardDescription>
            Add your syllabus, notes, and other materials to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="class-name">Class Name</Label>
            <Input id="class-name" placeholder="e.g., Introduction to Psychology" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="documents">Documents</Label>
            <Input id="documents" type="file" multiple />
          </div>
           <Button className="w-full">
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
