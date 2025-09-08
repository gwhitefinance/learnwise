
'use client';

import { motion } from "framer-motion"
import {
  Users,
  FileText,
  Download,
  Plus
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

  const recentFiles = [
    {
      name: "Calculus Midterm Study Guide.pdf",
      subject: "Calculus I",
      modified: "2 hours ago",
      shared: true,
      size: "2.1 MB",
      collaborators: 3,
    },
    {
      name: "History Chapter 5 Notes.docx",
      subject: "World History",
      modified: "Yesterday",
      shared: true,
      size: "82 KB",
      collaborators: 2,
    },
    {
      name: "Programming Assignment 3.py",
      subject: "Intro to Programming",
      modified: "3 days ago",
      shared: false,
      size: "12 KB",
      collaborators: 0,
    },
  ]
  
  const projects = [
    {
      name: "Calculus I",
      description: "Master differential and integral calculus.",
      progress: 75,
      dueDate: "June 15, 2025",
      members: 1,
      files: 12,
    },
    {
      name: "Intro to Programming",
      description: "Learn Python fundamentals and best practices.",
      progress: 60,
      dueDate: "July 30, 2025",
      members: 1,
      files: 28,
    },
    {
      name: "Linear Algebra",
      description: "Understand vectors, matrices, and transformations.",
      progress: 90,
      dueDate: "May 25, 2025",
      members: 1,
      files: 18,
    },
  ]


export default function DashboardPage() {
   
  return (
    <div className="space-y-8 mt-0">
        <Tabs defaultValue="home">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <TabsList className="grid w-full max-w-[600px] grid-cols-5 rounded-2xl p-1">
                <TabsTrigger value="home" className="rounded-xl data-[state=active]:rounded-xl">
                  Home
                </TabsTrigger>
                <TabsTrigger value="apps" className="rounded-xl data-[state=active]:rounded-xl">
                  Apps
                </TabsTrigger>
                <TabsTrigger value="files" className="rounded-xl data-[state=active]:rounded-xl">
                  Files
                </TabsTrigger>
                <TabsTrigger value="projects" className="rounded-xl data-[state=active]:rounded-xl">
                  Projects
                </TabsTrigger>
                <TabsTrigger value="learn" className="rounded-xl data-[state=active]:rounded-xl">
                  Learn
                </TabsTrigger>
              </TabsList>
              <div className="hidden md:flex gap-2">
                <Button variant="outline" className="rounded-2xl">
                  <Download className="mr-2 h-4 w-4" />
                  Install App
                </Button>
                <Button className="rounded-2xl">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </div>
            </div>
        </Tabs>
        <section>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 text-white"
        >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
                <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Premium</Badge>
                <h2 className="text-3xl font-bold">Welcome to LearnWise Study Suite</h2>
                <p className="max-w-[600px] text-white/80">
                Unleash your potential with our comprehensive suite of AI-powered study tools and
                resources.
                </p>
                <div className="flex flex-wrap gap-3">
                <Button className="rounded-2xl bg-white text-indigo-700 hover:bg-white/90">
                    Upgrade to Pro
                </Button>
                <Button
                    variant="outline"
                    className="rounded-2xl bg-transparent border-white text-white hover:bg-white/10"
                >
                    Take a Tour
                </Button>
                </div>
            </div>
            <div className="hidden lg:block">
                <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="relative h-40 w-40"
                >
                <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-md" />
                <div className="absolute inset-4 rounded-full bg-white/20" />
                <div className="absolute inset-8 rounded-full bg-white/30" />
                <div className="absolute inset-12 rounded-full bg-white/40" />
                <div className="absolute inset-16 rounded-full bg-white/50" />
                </motion.div>
            </div>
            </div>
        </motion.div>
        </section>


        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Recent Files</h2>
                <Button variant="ghost" className="rounded-2xl">
                    View All
                </Button>
                </div>
                <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Last Modified</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {recentFiles.map((file) => (
                        <TableRow key={file.name}>
                             <TableCell className="font-medium">{file.name}</TableCell>
                            <TableCell>{file.subject}</TableCell>
                            <TableCell>{file.modified}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </Card>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Active Courses</h2>
                <Button variant="ghost" className="rounded-2xl">
                    View All
                </Button>
                </div>
                 <div className="space-y-4">
                    {projects.slice(0, 3).map((project) => (
                        <Card key={project.name}>
                             <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium">{project.name}</h3>
                                    <Badge variant="outline" className="rounded-xl">
                                    In Progress
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                    </div>
                                    <Progress value={project.progress} className="h-2 rounded-xl" />
                                </div>
                                <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                    <FileText className="mr-1 h-4 w-4" />
                                    {project.files} files
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    </div>
  )
}
