
'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle, Flag, FlaskConical, Calendar as CalendarIcon, Users, Trophy } from "lucide-react";

const milestones = [
  {
    icon: CalendarIcon,
    date: "August 15, 2024",
    title: "Course Enrollment",
    completed: true,
  },
  {
    icon: FlaskConical,
    date: "September 5, 2024",
    title: "Midterm Exam",
    completed: false,
  },
  {
    icon: CheckCircle,
    date: "September 15, 2024",
    title: "Project Submission",
    completed: false,
  },
  {
    icon: Trophy,
    date: "September 25, 2024",
    title: "Final Exam",
    completed: false,
  },
  {
    icon: CheckCircle,
    date: "October 1, 2024",
    title: "Course Completion",
    completed: false,
  },
];

const goals = [
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
]

export default function RoadmapsPage() {
    const [date, setDate] = useState<Date | undefined>(new Date('2024-08-15'));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Study Roadmap</h1>
        <p className="text-muted-foreground">
          Visualize your learning journey with key milestones and goals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card>
            <CardContent className="p-2">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="w-full"
                  />
            </CardContent>
           </Card>

            <div>
                <h2 className="text-2xl font-semibold mb-4">Goals</h2>
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
                  <p className="text-sm text-muted-foreground">{milestone.date}</p>
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
