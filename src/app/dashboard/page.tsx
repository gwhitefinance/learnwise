

'use client';

import { Plus, Flame, Upload, ChevronDown, ChevronRight, Calendar, FileText, Mic, LayoutGrid, Bookmark, Settings, PenTool, BookMarked, GraduationCap, Gamepad2, Headphones, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import AIBuddy from "@/components/ai-buddy";
import { Progress } from "@/components/ui/progress";
import StudySetCard from "@/components/StudySetCard";


const MaterialItem = ({ icon, title, date }: { icon: React.ReactNode, title: string, date: string }) => {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{date}</p>
            </div>
        </div>
    );
}

const UpcomingItem = ({ icon, title, date }: { icon: React.ReactNode, title: string, date: string }) => {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{date}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
    );
}


const Index = () => {
    const [addSetOpen, setAddSetOpen] = useState(false);
    
  return (
      <div className="p-8 overflow-y-auto">
        {/* Full width greeting section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <span className="text-xl">👋</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                Good afternoon, Grady White!
              </h1>
              <p className="text-muted-foreground">
                Which study set are you working on today?
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Dialog open={addSetOpen} onOpenChange={setAddSetOpen}>
                <DialogTrigger asChild>
                    <Button variant="link" className="text-primary hover:text-primary/90 font-semibold">
                        <Plus className="h-4 h-4 mr-1" />
                        Add Set
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a New Study Set</DialogTitle>
                        <DialogDescription>Give your new set a name to get started.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="set-name">Set Name</Label>
                        <Input id="set-name" placeholder="e.g., AP Biology Unit 3"/>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setAddSetOpen(false)}>Cancel</Button>
                        <Button onClick={() => setAddSetOpen(false)}>Create Set</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <Button variant="link" className="text-primary hover:text-primary/90 font-semibold">
              <LayoutGrid className="h-4 w-4 mr-1" />
              See All My Sets
            </Button>
          </div>
        </div>

        {/* Study set buttons */}
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="default" 
            className="bg-card-blue hover:bg-card-blue-dark text-foreground font-semibold px-6 py-6 rounded-2xl border-2 border-primary/20"
          >
            <div className="w-5 h-5 bg-primary rounded-full mr-2 flex items-center justify-center">
              <span className="text-white text-xs">SM</span>
            </div>
            Sat MAth
          </Button>
          <Button 
            variant="outline" 
            className="px-6 py-6 rounded-2xl border-2 border-dashed border-border hover:bg-muted"
            onClick={() => setAddSetOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Set
          </Button>
        </div>

        {/* Divider */}
        <Separator className="mb-8" />

        {/* Two column layout: Study set card on left, streak/materials on right */}
        <div className="grid grid-cols-[1fr_400px] gap-6">
          {/* Left column - Study set card */}
          <div>
            <StudySetCard />
          </div>

          {/* Right column - Streak, Materials, Upcoming */}
          <div className="space-y-6">
            {/* Streak card */}
            <div className="flex items-center justify-between bg-card rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-2">
                <Flame className="h-6 w-6 text-orange-500" />
                <span className="text-lg font-bold text-foreground">3 day streak!</span>
              </div>
              <Button variant="link" className="text-primary hover:text-primary/90">
                View Leaderboard
              </Button>
            </div>

            {/* Materials Box */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Materials</h2>
                <Button variant="outline" size="sm" className="text-primary border-primary">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>

              <div className="space-y-3">
                <MaterialItem icon={<FileText className="h-6 w-6 text-yellow-600" />} title="Risk Management Strategies" date="Nov 6, 2025" />
                <MaterialItem icon={<FileText className="h-6 w-6 text-yellow-600" />} title="Technical Analysis Tools" date="Nov 6, 2025" />
                <MaterialItem icon={<Mic className="h-6 w-6 text-gray-600" />} title="Untitled Lecture" date="Nov 5, 2025" />
              </div>

              <Button variant="link" className="w-full text-primary hover:text-primary/90 mt-4">
                View All
              </Button>
            </div>

            {/* Upcoming Box */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-foreground" />
                  <h2 className="text-xl font-bold text-foreground">Upcoming</h2>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="space-y-3">
                <UpcomingItem icon={<FileText className="h-6 w-6 text-pink-600" />} title="Technical Analysis for Day ..." date="Nov 8" />
                <UpcomingItem icon={<FileText className="h-6 w-6 text-yellow-600" />} title="Trend-Following Techni..." date="Nov 8" />
              </div>

              <Button variant="link" className="w-full text-primary hover:text-primary/90 mt-4">
                View All
              </Button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Index;
