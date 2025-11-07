

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


const StudyItem = ({ title, progress }: { title: string, progress: number }) => {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <div className="flex items-center gap-2">
          <Progress value={progress} className="w-24 h-2" />
          <span className="text-sm font-medium">{progress}%</span>
        </div>
      </div>
    );
}

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

const StudySetCard = () => {
    return (
        <div className="bg-gradient-to-br from-card-blue to-card-blue-dark rounded-2xl p-6 text-foreground">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Sat MAth</h2>
                    <p className="text-gray-700">9 materials</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30">
                    <Bookmark className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/20 rounded-lg p-3 flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-orange-300" />
                  <span className="font-medium text-sm">1 Tests/Quizzes</span>
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </div>
                <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
                  <BookMarked className="w-4 h-4" />
                  <span className="font-medium text-sm">0 Explainers</span>
                </div>
                <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span className="font-medium text-sm">0 Tutor Me</span>
                </div>
                <div className="bg-white/20 rounded-lg p-3 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-pink-300" />
                  <span className="font-medium text-sm">2 Arcade</span>
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </div>
                <div className="bg-white/20 rounded-lg p-3 flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <span className="font-medium text-sm">1 Flashcards</span>
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </div>
                <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  <span className="font-medium text-sm">0 Audio Recap</span>
                </div>
              </div>

              <button className="w-full bg-primary text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 mb-6">
                <Play className="w-5 h-5" />
                <span className="font-semibold">Continue Learning</span>
              </button>

              <div className="bg-black/10 rounded-xl p-4 space-y-3">
                <StudyItem title="Technical Analysis for Day Trading" progress={0} />
                <StudyItem title="Day Trading Risk Management" progress={0} />
                <StudyItem title="Trading Psychology and Discipline" progress={0} />
                <StudyItem title="Order Types and Execution" progress={0} />
              </div>

              <button className="w-full mt-4 text-center text-sm font-medium text-foreground/80 hover:text-foreground">
                View All
              </button>
            </div>
    );
};


const Index = () => {
    const [addSetOpen, setAddSetOpen] = useState(false);
    
  return (
    <div className="p-8">
        <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-4">
                <AIBuddy className="w-12 h-12" />
                <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">
                    Good afternoon, Grady White!
                </h1>
                <p className="text-muted-foreground">
                    Which study set are you working on today?
                </p>
                </div>
            </div>
          
            <div className="flex items-center gap-2">
                <Dialog open={addSetOpen} onOpenChange={setAddSetOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" className="text-primary hover:text-primary/90 font-semibold">
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
                
                <Button variant="ghost" className="text-primary hover:text-primary/90 font-semibold">
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    See All My Sets
                </Button>
            </div>
        </div>

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

        <Separator className="mb-8" />

        <div className="grid grid-cols-[1fr_400px] gap-6">
            <StudySetCard />
            <div className="space-y-6">
                <div className="flex items-center justify-between bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center gap-2">
                        <Flame className="h-6 w-6 text-orange-500" />
                        <span className="text-lg font-bold text-foreground">3 day streak!</span>
                    </div>
                    <Button variant="link" className="text-primary hover:text-primary/90">
                        View Leaderboard
                    </Button>
                </div>

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
