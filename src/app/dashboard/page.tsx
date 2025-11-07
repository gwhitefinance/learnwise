
'use client';

import { Plus, Flame, Upload, ChevronDown, ChevronRight, Calendar, FileText, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/DashboardLayout";
import StudySetCard from "@/components/StudySetCard";

const Index = () => {
  return (
    <DashboardLayout>
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
            <Button variant="link" className="text-primary hover:text-primary/90 font-semibold">
              <Plus className="h-4 w-4 mr-1" />
              Add Set
            </Button>
            <Button variant="link" className="text-primary hover:text-primary/90 font-semibold">
              <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
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
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Risk Management Strategies</h3>
                    <p className="text-sm text-muted-foreground">Nov 6, 2025</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Technical Analysis Tools</h3>
                    <p className="text-sm text-muted-foreground">Nov 6, 2025</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mic className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Untitled Lecture</h3>
                    <p className="text-sm text-muted-foreground">Nov 5, 2025</p>
                  </div>
                </div>
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
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Technical Analysis for Day ...</h3>
                    <p className="text-sm text-muted-foreground">Nov 8</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Trend-Following Techni...</h3>
                    <p className="text-sm text-muted-foreground">Nov 8</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <Button variant="link" className="w-full text-primary hover:text-primary/90 mt-4">
                View All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
