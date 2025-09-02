
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle, Flag, FlaskConical, Calendar as CalendarIcon, Users, Trophy, Plus, Pen, Trash2, GitMerge } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { studyPlannerFlow } from '@/ai/flows/study-planner-flow';

const initialMilestones = [
  {
    icon: CalendarIcon,
    date: new Date("2024-08-15T00:00:00.000Z"),
    title: "Course Enrollment",
    completed: true,
  },
  {
    icon: FlaskConical,
    date: new Date("2024-09-05T00:00:00.000Z"),
    title: "Midterm Exam",
    completed: false,
  },
  {
    icon: CheckCircle,
    date: new Date("2024-09-15T00:00:00.000Z"),
    title: "Project Submission",
    completed: false,
  },
  {
    icon: Trophy,
    date: new Date("2024-09-25T00:00:00.000Z"),
    title: "Final Exam",
    completed: false,
  },
  {
    icon: CheckCircle,
    date: new Date("2024-10-01T00:00:00.000Z"),
    title: "Course Completion",
    completed: false,
  },
];

const initialGoals = [
    {
        icon: Flag,
        title: "Finish Course",
        description: "Complete all course modules"
    },
    {
        icon: Trophy,
        title: "Target Grade",
        description: "Achieve a grade of 85% or higher"
    },
    {
        icon: Users,
        title: "Engagement",
        description: "Participate in all discussion forums"
    }
];

export default function RoadmapsPage() {
    const [milestones, setMilestones] = useState(initialMilestones);
    const [goals, setGoals] = useState(initialGoals);
    const [goalTitle, setGoalTitle] = useState('');
    const [goalDescription, setGoalDescription] = useState('');
    const [isAddGoalOpen, setAddGoalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    const milestoneDates = milestones.map(m => m.date);

    const handleAddGoal = () => {
        if (!goalTitle || !goalDescription) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please provide a title and description for your goal.',
            });
            return;
        }
        
        const newGoal = {
            icon: Flag,
            title: goalTitle,
            description: goalDescription,
        };
        setGoals([...goals, newGoal]);
        setGoalTitle('');
        setGoalDescription('');
        setAddGoalOpen(false);
        toast({
            title: 'Goal Added!',
            description: 'Your new goal has been added to your roadmap.',
        });
    };

    const handleGenerateRoadmap = async () => {
        setIsLoading(true);
        toast({ title: 'Generating Roadmap...', description: 'The AI is creating your personalized study plan.' });
        try {
            // This is a simplified example. In a real app, you'd get the current course context.
            const response = await studyPlannerFlow({
                history: [{ role: 'user', content: 'Generate a detailed study roadmap with milestones and goals for the course "Introduction to AI".' }],
            });
            
            // In a real implementation, you would parse the AI response to create structured
            // goals and milestones. For this example, we'll just show the raw response.
            toast({
                title: 'AI-Generated Roadmap Suggestion',
                description: response,
                duration: 9000,
            });

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate roadmap.' });
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">My Study Roadmap</h1>
            <p className="text-muted-foreground">
            Visualize your learning journey with key milestones and goals.
            </p>
        </div>
        <Button onClick={handleGenerateRoadmap} disabled={isLoading}>
            <GitMerge className="mr-2 h-4 w-4"/> {isLoading ? 'Generating...' : 'Generate with AI'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card>
            <CardContent className="p-2">
                <Calendar
                    mode="multiple"
                    selected={milestoneDates}
                    classNames={{
                        day_selected: "bg-primary/20 text-primary-foreground rounded-full",
                    }}
                    components={{
                        DayContent: ({ date, ...props }) => {
                            const isMilestone = milestoneDates.some(
                                (milestoneDate) => new Date(date).toDateString() === new Date(milestoneDate).toDateString()
                            );
                            return (
                                <div className="relative">
                                    <span>{props.children}</span>
                                    {isMilestone && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />}
                                </div>
                            );
                        },
                    }}
                    className="w-full"
                  />
            </CardContent>
           </Card>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Goals</h2>
                    <Dialog open={isAddGoalOpen} onOpenChange={setAddGoalOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4"/> Add Goal</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add a New Goal</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="goal-title" className="text-right">Title</Label>
                                    <Input id="goal-title" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} className="col-span-3" placeholder="e.g., Master React"/>
                                </div>
                                 <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="goal-description" className="text-right">Description</Label>
                                    <Input id="goal-description" value={goalDescription} onChange={(e) => setGoalDescription(e.target.value)} className="col-span-3" placeholder="Describe your goal"/>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="ghost">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleAddGoal}>Add Goal</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    {goals.map((goal, index) => (
                         <Card key={index}>
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className="bg-muted p-3 rounded-lg">
                                    <goal.icon className="h-6 w-6 text-muted-foreground"/>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{goal.title}</h3>
                                    <p className="text-muted-foreground text-sm">{goal.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-semibold">Milestones</h2>
          <div className="relative">
            <div className="absolute left-3.5 top-0 h-full w-0.5 bg-border"></div>
            {milestones.map((milestone, index) => (
              <div key={index} className="relative flex items-start gap-6 mb-8">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center z-10 ${milestone.completed ? 'bg-primary text-primary-foreground' : 'bg-muted border-2 border-primary'}`}>
                  <milestone.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{milestone.date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  <h3 className="font-semibold text-lg">{milestone.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
