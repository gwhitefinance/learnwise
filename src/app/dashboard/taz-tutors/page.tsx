
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, File, Upload, Share2, Info } from 'lucide-react';
import AIBuddy from '@/components/ai-buddy';

// Mock data for materials
const materials = [
  { name: "Basics of American Government.pdf", date: "1/31/2025" },
  { name: "History of Law.pdf", date: "1/27/2025" },
  { name: "Databricks Generative AI Engineer...", date: "12/5/2024" },
  { name: "Op-Ed_Running for State Legislatu...", date: "11/18/2024" },
  { name: "Basics of American Government.pd...", date: "1/31/2025" },
  { name: "History of Law.pdf", date: "1/27/2025" },
  { name: "Databricks Generative AI Engineer...", date: "12/5/2024" },
  { name: "_USAID AI Ethics Guide_1.pdf", date: "11/18/2024" },
  { name: "Basics of American Government.pd...", date: "1/31/2025" },
  { name: "History of Law.pdf", date: "1/27/2025" },
  { name: "What is Databricks__ Databricks o...", date: "12/5/2024" },
  { name: "the-state-of-ai-in-2023-generative...", date: "11/18/2024" },
];

const MaterialCard = ({ name, date }: { name: string, date: string }) => (
  <Card className="hover:shadow-md transition-shadow cursor-pointer">
    <CardContent className="p-4 flex items-center gap-3">
      <File className="h-6 w-6 text-muted-foreground" />
      <div>
        <p className="font-semibold text-sm truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </CardContent>
  </Card>
);

export default function TazTutorsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex justify-end gap-2 mb-8">
                <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                <Button variant="outline"><Info className="mr-2 h-4 w-4" /> Feedback</Button>
            </div>

            <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-4">
                    <AIBuddy />
                </div>
                <h1 className="text-2xl font-bold">1:1 personalized tutoring sessions with your course materials</h1>
            </div>

            <Tabs defaultValue="new-session" className="w-full max-w-sm mx-auto mb-8">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="new-session">New Session</TabsTrigger>
                    <TabsTrigger value="my-sessions">My Sessions</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold">Start a Tutoring Session</h2>
                <p className="text-muted-foreground mt-2 flex items-center justify-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">PDF</span>
                    Tutor Me works with any PDF you've uploaded to StudyFetch, select one to get started
                </p>
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search materials..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button><Upload className="mr-2 h-4 w-4" /> Upload Material</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {materials
                    .filter(material => material.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((material, index) => (
                    <MaterialCard key={index} name={material.name} date={material.date} />
                ))}
            </div>
        </div>
    );
}
