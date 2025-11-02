
'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { motion } from "framer-motion"
import {
  FileText,
  Download,
  Plus,
  UploadCloud,
  GraduationCap,
  Lightbulb,
  GitMerge,
  ClipboardPenLine,
  Calendar,
  BarChart3,
  BrainCircuit,
  PenSquare,
  Home,
  LayoutGrid,
  Folder,
  Briefcase,
  BookOpen,
  ArrowRight,
  Link as LinkIcon,
  Notebook,
  Flame,
  Trophy,
  Palette,
  Gem,
  Music,
  Gamepad2,
  FolderOpen,
  X,
  Gift,
  Wand2,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Rabbit,
  Snail,
  Turtle,
  Copy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Target,
  Loader2,
  ListTodo,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from "next/image";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, doc, Timestamp, updateDoc, increment, orderBy, limit, getDocs, deleteDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';
import AIBuddy from '@/components/ai-buddy';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import rewardsData from '@/lib/rewards.json';
import { generateExplanation, generateRoadmap, generateFlashcardsFromModule, generateChapterContent, generateDailyFocus } from '@/lib/actions';
import AudioPlayer from '@/components/audio-player';
import type { GenerateExplanationOutput } from '@/ai/schemas/quiz-explanation-schema';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RewardContext } from '@/context/RewardContext';
import { Textarea } from '@/components/ui/textarea';
import Logo from '@/components/Logo';
import Spotlight from '@/components/ui/spotlight';
import PomodoroTimer from '@/components/PomodoroTimer';
import { AnimatePresence } from 'framer-motion';

  type CourseFile = {
      id: string;
      name: string;
      type: string;
      size: number;
  };

  type Unit = {
      id: string;
      name: string;
      files?: CourseFile[];
      chapters?: { id: string; title: string; content?: string }[];
  };

  type Course = {
    id: string;
    name: string;
    instructor: string;
    credits: number;
    url?: string;
    description: string;
    progress: number;
    files: number; // This might be a count or can be removed if we calculate it
    userId?: string;
    units?: Unit[];
    completedChapters?: string[];
    isNewTopic?: boolean;
  };

  type FirestoreProject = {
    id:string;
    name: string;
    course: string;
    dueDate: Timestamp;
    status: 'Not Started' | 'In Progress' | 'Completed';
    userId?: string;
  }
  
  type RecentFile = {
      id: string;
      name: string;
      subject: string;
      modified: Timestamp;
      userId?: string;
  };

  type Project = Omit<FirestoreProject, 'dueDate'> & {
    dueDate: string;
  }

  type DisplayFile = Omit<RecentFile, 'modified'> & {
      modified: string;
  }

  type Chest = {
    id: string;
    name: string;
    description: string;
    cost: number;
    coinRange: [number, number];
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
    unlocksAt?: number;
  };

  type RewardState = 'idle' | 'opening' | 'revealed';

  type QuizAttempt = {
      id: string;
      userId: string;
      question: string;
      userAnswer: string;
      correctAnswer: string;
      topic: string;
      timestamp: Timestamp;
  }
  
  // New type for the component state
  type WeakestLinkState = {
      attempt: QuizAttempt;
      explanation?: GenerateExplanationOutput;
      isExplanationLoading: boolean;
      practiceAnswer?: string;
      practiceFeedback?: 'correct' | 'incorrect';
      remediationChapter?: { title: string; content: string; }; // content is a JSON string
  };
  
  type Flashcard = {
    front: string;
    back: string;
  };

  type TodoItem = {
      id: string;
      text: string;
      completed: boolean;
      isEditing?: boolean;
      isAiGenerated?: boolean;
  }

const paces = [
  { value: "6", label: "Casual", description: "A relaxed pace for exploring.", icon: <Snail className="h-6 w-6" /> },
  { value: "3", label: "Steady", description: "A balanced pace for consistent learning.", icon: <Turtle className="h-6 w-6" /> },
  { value: "1", label: "Intense", description: "A fast-paced schedule for quick mastery.", icon: <Rabbit className="h-6 w-6" /> },
];

const integrations = [
    {
        name: "Google Classroom",
        description: "Sync your roster, assignments, and grades seamlessly.",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Google_Classroom_Logo.svg/2048px-Google_Classroom_Logo.svg.png",
    },
    {
        name: "Microsoft Teams",
        description: "Integrate Tutorin's tools directly into your Teams channels.",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/2203px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png",
    },
    {
        name: "Canvas",
        description: "Connect with Canvas LMS for gradebook synchronization.",
        icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/canvas-lms-logo-icon.png",
    },
     {
        name: "Schoology",
        description: "Import rosters and export grades to your Schoology courses.",
        icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/schoology-logo-icon.png",
    },
     {
        name: "Zoom",
        description: "Launch and record study sessions directly within Tutorin.",
        icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/zoom-icon.png",
    },
    {
        name: "Edpuzzle",
        description: "Embed interactive video lessons into your Tutorin courses.",
        icon: "https://img.favpng.com/1/10/22/edpuzzle-logo-google-classroom-interactive-video-png-favpng-s5DPyVv2VjC4XA9gXy4GjC9sA.jpg",
    },
];

function DashboardClientPage({ isHalloweenTheme }: { isHalloweenTheme?: boolean }) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [recentFiles, setRecentFiles] = useState<DisplayFile[]>([]);
    const [isAddCourseOpen, setAddCourseOpen] = useState(false);
    const [isSavingCourse, setIsSavingCourse] = useState(false);
    const [newCourse, setNewCourse] = useState({ name: '', instructor: '', credits: '', url: '', description: '' });
    const { toast } = useToast();
    const [files, setFiles] = useState<FileList | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploadOpen, setUploadOpen] = useState(false);
    const [isAddProjectOpen, setAddProjectOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', course: '', dueDate: new Date() as Date | undefined });
    const [streak, setStreak] = useState(0);
    const [user] = useAuthState(auth);
    const [customizations, setCustomizations] = useState<Record<string, string>>({});
    const [userCoins, setUserCoins] = useState(0);

    const [rewardState, setRewardState] = useState<RewardState>('idle');
    const [claimedCoins, setClaimedCoins] = useState(0);
    const [hasClaimedFreeChest, setHasClaimedFreeChest] = useState(false);

    // Weakest Link State
    const [weakestLinks, setWeakestLinks] = useState<Record<string, WeakestLinkState[]>>({});
    const [weakestLinkLoading, setWeakestLinkLoading] = useState(true);
    const [learnerType, setLearnerType] = useState<string | null>(null);
    const [gradeLevel, setGradeLevel] = useState<string | null>(null);
    const { showReward } = useContext(RewardContext);

    // Add Course Dialog State
    const [addCourseStep, setAddCourseStep] = useState(1);
    const [isNewTopic, setIsNewTopic] = useState<boolean | null>(null);
    const [learningPace, setLearningPace] = useState<string>("3");
    const [isRoadmapGenerating, setIsRoadmapGenerating] = useState(false);
    
    // Key Concepts Dialog State
    const [isConceptsOpen, setIsConceptsOpen] = useState(false);
    const [selectedConceptCourse, setSelectedConceptCourse] = useState<string>('');
    const [isFlashcardLoading, setIsFlashcardLoading] = useState(false);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Today's Focus state
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
    const [isFocusDialogOpen, setIsFocusDialogOpen] = useState(false);
    const [timeUntilMidnight, setTimeUntilMidnight] = useState('');


    useEffect(() => {
        const calculateTimeUntilMidnight = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeUntilMidnight(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        };

        calculateTimeUntilMidnight();
        const intervalId = setInterval(calculateTimeUntilMidnight, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const getTasksKey = useCallback(() => {
        if (!user) return null;
        return `dailyFocusTasks_${user.uid}_${new Date().toDateString()}`;
    }, [user]);

    const handleAiSuggestions = useCallback(async (force = false) => {
        if (!user) return;
        const tasksKey = getTasksKey();
        if (!tasksKey) return;

        // If not forcing, and tasks already exist for today, do nothing.
        if (!force && localStorage.getItem(tasksKey)) {
            return;
        }

        try {
            const courseNames = courses.map(c => c.name);
            const weakestTopics = Object.keys(weakestLinks);
            
            const result = await generateDailyFocus({ courseNames, weakestTopics });
            const newAiTodos: TodoItem[] = result.tasks.map(task => ({
                id: crypto.randomUUID(),
                text: task,
                completed: false,
                isEditing: false,
                isAiGenerated: true,
            }));
            
            const currentTasks = JSON.parse(localStorage.getItem(tasksKey) || '[]') as TodoItem[];
            const userTasks = currentTasks.filter(t => !t.isAiGenerated);
            const updatedTasks = [...userTasks, ...newAiTodos];

            setTodos(updatedTasks);
            localStorage.setItem(tasksKey, JSON.stringify(updatedTasks));

        } catch (error) {
            console.error("Failed to get AI suggestions:", error);
            toast({ variant: 'destructive', title: "AI Error", description: "Could not generate focus tasks." });
        }
    }, [courses, weakestLinks, user, toast, getTasksKey]);

    useEffect(() => {
        if (!user) return;
        const tasksKey = getTasksKey();
        if (!tasksKey) return;

        try {
            const savedTasks = localStorage.getItem(tasksKey);
            if (savedTasks) {
                setTodos(JSON.parse(savedTasks));
            } else {
                 handleAiSuggestions();
            }
        } catch (error) {
            console.error("Failed to load tasks from localStorage", error);
            handleAiSuggestions();
        }
        
        const rewardKey = `dailyFocusReward_${user.uid}_${new Date().toDateString()}`;
        const rewardClaimed = localStorage.getItem(rewardKey);
        setDailyRewardClaimed(!!rewardClaimed);

    }, [user, getTasksKey, handleAiSuggestions]);
    
    useEffect(() => {
        const tasksKey = getTasksKey();
        if (!tasksKey || todos.length === 0) return;
        try {
            localStorage.setItem(tasksKey, JSON.stringify(todos));
        } catch (error) {
            console.error("Failed to save tasks to localStorage", error);
        }
    }, [todos, getTasksKey]);
    
    useEffect(() => {
        if (dailyRewardClaimed || !user) return;
        
        const aiTasks = todos.filter(t => t.isAiGenerated);
        const allAiTasksCompleted = aiTasks.length > 0 && aiTasks.every(t => t.completed);

        if (allAiTasksCompleted) {
            const reward = async () => {
                if (!user) return;
                try {
                    await updateDoc(doc(db, 'users', user.uid), { coins: increment(50) });
                    showReward({ type: 'coins', amount: 50 });
                    toast({ title: "Daily Focus Complete!", description: "You've earned 50 coins!" });
                    const rewardKey = `dailyFocusReward_${user.uid}_${new Date().toDateString()}`;
                    localStorage.setItem(rewardKey, 'true');
                    setDailyRewardClaimed(true);
                } catch (e) {
                    console.error("Failed to give daily reward", e);
                }
            };
            reward();
        }
    }, [todos, user, showReward, toast, dailyRewardClaimed]);


     useEffect(() => {
        if (!user) return;
        
        setIsDataLoading(true);

        const savedCustomizations = localStorage.getItem(`robotCustomizations_${user.uid}`);
        if(savedCustomizations && savedCustomizations.trim() !== '') {
            try {
                setCustomizations(JSON.parse(savedCustomizations));
            } catch (e) {
                 console.error("Failed to parse customizations from localStorage", e);
            }
        }

        const freeChestClaimed = localStorage.getItem(`freeChestClaimed_${user.uid}_${new Date().toDateString()}`);
        if (freeChestClaimed === 'true') {
            setHasClaimedFreeChest(true);
        }

        const storedLearnerType = localStorage.getItem('learnerType');
        setLearnerType(storedLearnerType ?? 'Unknown');
        const storedGradeLevel = localStorage.getItem('onboardingGradeLevel');
        setGradeLevel(storedGradeLevel);

        const unsubscribes: (() => void)[] = [];

        const userDocRef = doc(db, 'users', user.uid);
        unsubscribes.push(onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setUserCoins(doc.data().coins || 0);
            }
        }));

        // Subscribe to courses
        const qCourses = query(collection(db, "courses"), where("userId", "==", user.uid));
        unsubscribes.push(onSnapshot(qCourses, (snapshot) => {
            const userCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
            setCourses(userCourses);
            setIsDataLoading(false);
        }));

        // Subscribe to projects
        const qProjects = query(collection(db, "projects"), where("userId", "==", user.uid));
        unsubscribes.push(onSnapshot(qProjects, (snapshot) => {
            const userProjects = snapshot.docs.map(doc => {
                const data = doc.data() as FirestoreProject;
                return {
                    ...data,
                    id: doc.id,
                    dueDate: data.dueDate.toDate().toISOString(),
                } as Project;
            });
            // Sort on client
            userProjects.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
            setProjects(userProjects);
        }));

        // Subscribe to recent files
        const qFiles = query(collection(db, "recentFiles"), where("userId", "==", user.uid));
        unsubscribes.push(onSnapshot(qFiles, (snapshot) => {
            const userFiles = snapshot.docs.map(doc => {
                const data = doc.data() as RecentFile;
                return {
                    ...data,
                    id: doc.id,
                    modified: format(data.modified.toDate(), 'PPP'),
                } as DisplayFile;
            });
            // Sort on client
            userFiles.sort((a,b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
            setRecentFiles(userFiles);
        }));
        
        // Fetch all quiz attempts
        const qAttempts = query(collection(db, 'quizAttempts'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
        unsubscribes.push(onSnapshot(qAttempts, (snapshot) => {
            const attempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt));
            
            // Group by topic
            const groupedByTopic: Record<string, QuizAttempt[]> = {};
            for (const attempt of attempts) {
                if (!groupedByTopic[attempt.topic]) {
                    groupedByTopic[attempt.topic] = [];
                }
                groupedByTopic[attempt.topic].push(attempt);
            }

            const newWeakestLinks: Record<string, WeakestLinkState[]> = {};
            for (const topic in groupedByTopic) {
                newWeakestLinks[topic] = groupedByTopic[topic].map(attempt => ({
                    attempt,
                    isExplanationLoading: false,
                }));
            }
            
            setWeakestLinks(newWeakestLinks);
            setWeakestLinkLoading(false);
        }));


        // Mock streak calculation
        const lastVisit = localStorage.getItem('lastVisit');
        const today = new Date().toDateString();
        if (lastVisit === today) {
            setStreak(Number(localStorage.getItem('streakCount')) || 1);
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastVisit === yesterday.toDateString()) {
                const newStreak = (Number(localStorage.getItem('streakCount')) || 0) + 1;
                setStreak(newStreak);
                localStorage.setItem('streakCount', String(newStreak));
            } else {
                setStreak(1);
                localStorage.setItem('streakCount', '1');
            }
        }
        localStorage.setItem('lastVisit', today);
        
        return () => {
            unsubscribes.forEach(unsub => unsub());
        }
    }, [user]);

    const handleProjectInputChange = (field: string, value: string | Date | undefined) => {
        setNewProject(prev => ({ ...prev, [field]: value }));
    };

    const handleAddProject = async () => {
        if (!newProject.name || !newProject.course || !newProject.dueDate || !user) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all required fields.'
            });
            return;
        }

        try {
            await addDoc(collection(db, "projects"), {
                name: newProject.name,
                course: newProject.course,
                dueDate: Timestamp.fromDate(newProject.dueDate),
                status: 'Not Started',
                userId: user.uid
            });
            setNewProject({ name: '', course: '', dueDate: new Date() });
            setAddProjectOpen(false);
            toast({
                title: 'Project Added!',
                description: `${newProject.name} has been added to your list.`
            });
        } catch (error) {
            console.error("Error adding project: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not add project."});
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewCourse(prev => ({ ...prev, [name]: value }));
    };

    const resetAddCourseDialog = () => {
        setAddCourseStep(1);
        setIsNewTopic(null);
        setNewCourse({ name: '', instructor: '', credits: '', url: '', description: '' });
        setLearningPace("3");
    };

    const handleAddCourse = async () => {
        if (!newCourse.name) {
            toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please enter a course name.' });
            return;
        }
        if (!user) return;

        setIsSavingCourse(true);
        if (isNewTopic) { // Learning something new
            setIsRoadmapGenerating(true);
            try {
                 const courseData = {
                    name: newCourse.name,
                    instructor: newCourse.instructor || 'N/A',
                    credits: parseInt(newCourse.credits, 10) || 0,
                    url: newCourse.url,
                    description: newCourse.description || `A course on ${newCourse.name}`,
                    userId: user.uid,
                    isNewTopic: isNewTopic,
                    units: [],
                    completedChapters: [],
                    progress: 0,
                    files: 0,
                };
                const docRef = await addDoc(collection(db, "courses"), courseData);
                toast({
                    title: 'Course Added!',
                    description: 'Now generating your study roadmap...',
                });

                const roadmapResult = await generateRoadmap({
                    courseName: courseData.name,
                    courseDescription: courseData.description,
                    courseUrl: courseData.url,
                    durationInMonths: parseInt(learningPace, 10),
                });
                const newRoadmap = {
                    goals: roadmapResult.goals.map(g => ({ ...g, id: `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, icon: g.icon || 'Flag' })),
                    milestones: roadmapResult.milestones.map(m => ({ ...m, id: `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, icon: m.icon || 'Calendar', completed: false }))
                };
                await addDoc(collection(db, 'roadmaps'), { ...newRoadmap, courseId: docRef.id, userId: user.uid });
                toast({ title: 'Roadmap Generated!', description: 'Your new study plan is ready.' });
                
                setAddCourseOpen(false);
                resetAddCourseDialog();
            } catch (error) {
                console.error("Error generating new topic course and roadmap: ", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not set up the new course.' });
            } finally {
                 setIsSavingCourse(false);
                 setIsRoadmapGenerating(false);
            }
        } else { // Already in this course
            try {
                await addDoc(collection(db, "courses"), {
                    name: newCourse.name,
                    description: newCourse.description || `A course on ${newCourse.name}`,
                    url: newCourse.url,
                    instructor: newCourse.instructor || 'N/A',
                    credits: parseInt(newCourse.credits, 10) || 0,
                    userId: user.uid,
                    isNewTopic: false,
                    units: [],
                    completedChapters: [],
                    progress: 0,
                    files: 0,
                });
                toast({ title: 'Course Added!' });
                setAddCourseOpen(false);
                resetAddCourseDialog();
            } catch (error) {
                 console.error("Error adding existing course: ", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not add the course.' });
            } finally {
                setIsSaving(false);
            }
        }
    };
    
    const handleFileChange = (selectedFiles: FileList | null) => {
        if (selectedFiles) {
          setFiles(selectedFiles);
        }
    };

    const handleUpload = async () => {
        if (!files || files.length === 0 || !user) {
          toast({
            variant: 'destructive',
            title: 'No files selected',
            description: 'Please select at least one file to upload.',
          });
          return;
        }
        
        const uploadPromises = Array.from(files).map(file => {
            return addDoc(collection(db, 'recentFiles'), {
                name: file.name,
                subject: "General",
                modified: Timestamp.now(),
                userId: user.uid,
            });
        });

        try {
            await Promise.all(uploadPromises);
            toast({
                title: 'Upload Successful!',
                description: `${files.length} file(s) have been added.`,
            });
        } catch (error) {
            console.error("Error uploading files: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not upload files."});
        }

        setFiles(null);
        setUploadOpen(false);
    };
     
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
         if (!isDragging) setIsDragging(true);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
          handleFileChange(droppedFiles);
          setUploadOpen(true);
        }
    };

    const handleClaimChest = async (chest: Chest) => {
        if (!user) return;
        
        const hasClaimedStreak = chest.unlocksAt && localStorage.getItem(`streakChestClaimed_${chest.id}_${user.uid}`);
        if(hasClaimedStreak === 'true') {
             toast({ variant: 'destructive', title: 'Already claimed!' });
             return;
        }

        const coinsWon = Math.floor(Math.random() * (chest.coinRange[1] - chest.coinRange[0] + 1)) + chest.coinRange[0];
        setClaimedCoins(coinsWon);
        setRewardState('opening');

        setTimeout(async () => {
            setRewardState('revealed');
            try {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    coins: increment(coinsWon),
                });

                if (chest.id === 'daily_free') {
                    setHasClaimedFreeChest(true);
                    localStorage.setItem(`freeChestClaimed_${user.uid}_${new Date().toDateString()}`, 'true');
                } else if (chest.unlocksAt) {
                    localStorage.setItem(`streakChestClaimed_${chest.id}_${user.uid}`, 'true');
                }
            } catch (e) {
                console.error("Failed to update coins: ", e);
                toast({ variant: 'destructive', title: 'Error updating coins.' });
            }
        }, 2000); // Duration of the animation
    };
    
    const chests: Chest[] = rewardsData.chests as Chest[];
    
    const handleGetExplanation = async (topic: string, attemptId: string) => {
        if (!learnerType) return;
        
        const currentLink = weakestLinks[topic].find(l => l.attempt.id === attemptId);
        if (!currentLink) return;

        setWeakestLinks(prev => ({
            ...prev,
            [topic]: prev[topic].map(l => l.attempt.id === attemptId ? { ...l, isExplanationLoading: true, explanation: undefined } : l)
        }));

        try {
            const { attempt } = currentLink;
            const result = await generateExplanation({
                question: attempt.question,
                userAnswer: attempt.userAnswer,
                correctAnswer: attempt.correctAnswer,
                learnerType: learnerType as any,
                provideFullExplanation: true,
            });
            setWeakestLinks(prev => ({
                ...prev,
                [topic]: prev[topic].map(l => l.attempt.id === attemptId ? { ...l, explanation: result, practiceAnswer: undefined, practiceFeedback: undefined } : l)
            }));
        } catch (error) {
            console.error("Failed to get explanation:", error);
            toast({ variant: 'destructive', title: 'AI Error', description: 'Could not generate an explanation.' });
        } finally {
             setWeakestLinks(prev => ({
                ...prev,
                [topic]: prev[topic].map(l => l.attempt.id === attemptId ? { ...l, isExplanationLoading: false } : l)
            }));
        }
    };

    const handleCheckPracticeAnswer = async (topic: string, attemptId: string, selectedAnswer: string) => {
        const currentLink = weakestLinks[topic].find(l => l.attempt.id === attemptId);
        if (!currentLink?.explanation || !user || !learnerType) return;
        
        const isCorrect = selectedAnswer === currentLink.explanation.practiceQuestion.answer;

        if (isCorrect) {
            toast({ title: "Correct!", description: "Great job! This question has been mastered." });
            setWeakestLinks(prev => ({
                ...prev,
                [topic]: prev[topic].filter(l => l.attempt.id !== attemptId)
            }));
            
            try {
                await deleteDoc(doc(db, 'quizAttempts', attemptId));
            } catch (error) {
                console.error("Failed to delete mastered question:", error);
            }

        } else {
            toast({ variant: 'destructive', title: "Not quite...", description: "Let's try a different approach to this concept." });
            
            setWeakestLinks(prev => ({
                ...prev,
                [topic]: prev[topic].map(l => l.attempt.id === attemptId ? { ...l, isExplanationLoading: true } : l)
            }));

            try {
                const { attempt } = currentLink;
                // Instead of getting a new question, generate a full remediation chapter
                const remediationContent = await generateChapterContent({
                    courseName: "Targeted Review",
                    moduleTitle: attempt.topic,
                    chapterTitle: `Understanding: "${attempt.question}"`,
                    learnerType: learnerType as any,
                });

                setWeakestLinks(prev => ({
                    ...prev,
                    [topic]: prev[topic].map(l => l.attempt.id === attemptId ? { 
                        ...l,
                        isExplanationLoading: false,
                        // FIX: Stringify the content
                        remediationChapter: { title: `Deep Dive: ${attempt.topic}`, content: JSON.stringify(remediationContent.content) },
                        explanation: undefined, // Clear old explanation and question
                    } : l)
                }));
            } catch (error) {
                console.error("Failed to get remediation chapter:", error);
                toast({ variant: 'destructive', title: 'AI Error', description: 'Could not generate a new explanation.' });
                setWeakestLinks(prev => ({
                    ...prev,
                    [topic]: prev[topic].map(l => l.attempt.id === attemptId ? { ...l, isExplanationLoading: false } : l)
                }));
            }
        }
    };
    
    const setPracticeAnswer = (topic: string, attemptId: string, answer: string) => {
        setWeakestLinks(prev => {
            const topicLinks = prev[topic].map(l => 
                l.attempt.id === attemptId ? { ...l, practiceAnswer: answer } : l
            );
            return { ...prev, [topic]: topicLinks };
        });
    }

    const handleGenerateFlashcards = async () => {
        if (!selectedConceptCourse) {
            toast({ variant: 'destructive', title: "Please select a course."});
            return;
        }
        
        const course = courses.find(c => c.id === selectedConceptCourse);
        if (!course || !course.units || course.units.length === 0) {
            toast({ variant: 'destructive', title: "Course has no content.", description: 'Please select a course with generated units and chapters.'});
            return;
        }

        const courseContent = course.units
            .flatMap(unit => unit.chapters || [])
            .map(chapter => `Chapter: ${chapter.title}\n${chapter.content || ''}`)
            .join('\n\n---\n\n');

        if (!courseContent.trim()) {
            toast({ variant: 'destructive', title: "Course content is empty." });
            return;
        }

        setIsFlashcardLoading(true);
        setFlashcards([]);
        setCurrentFlashcardIndex(0);
        setIsFlipped(false);

        try {
            const result = await generateFlashcardsFromModule({
                moduleContent: courseContent,
                learnerType: (learnerType as any) ?? 'Reading/Writing'
            });
            setFlashcards(result.flashcards);
            if(result.flashcards.length === 0) {
                 toast({ title: 'No Key Terms Found', description: "We couldn't find enough key terms to generate flashcards."});
            }
        } catch(error) {
            console.error("Failed to generate flashcards:", error);
            toast({
                variant: 'destructive',
                title: 'Flashcard Generation Failed',
            });
        } finally {
            setIsFlashcardLoading(false);
        }
    };
    
    const addTodo = () => {
        const newTodo: TodoItem = {
            id: crypto.randomUUID(),
            text: '',
            completed: false,
            isEditing: true
        };
        setTodos(prev => [...prev, newTodo]);
    };

    const toggleTodo = (id: string) => {
        setTodos(prev => prev.map(todo => 
            todo.id === id ? { ...todo, completed: !todo.completed, isEditing: false } : todo
        ));
    };
    
    const updateTodoText = (id: string, newText: string) => {
        setTodos(prev => prev.map(todo => 
            todo.id === id ? { ...todo, text: newText } : todo
        ));
    }
    
    const saveTodo = (id: string) => {
        setTodos(prev => prev.map(todo => 
            todo.id === id ? { ...todo, isEditing: false } : todo
        ));
    }

    const addCalendarEvent = async (text: string) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "calendarEvents"), {
                title: text,
                description: "Study session for today's focus.",
                date: new Date().toISOString(),
                startTime: "16:00",
                endTime: "17:00",
                type: 'Homework',
                color: 'bg-blue-500',
                userId: user.uid,
                reminderMinutes: 10,
            });
            toast({ title: 'Event Added!', description: `"${text}" added to your calendar.`});
        } catch (e) {
            toast({ variant: 'destructive', title: "Error", description: "Could not add event to calendar." });
        }
    };
    
    const completedAiTasks = todos.filter(t => t.isAiGenerated && t.completed).length;
    const totalAiTasks = todos.filter(t => t.isAiGenerated).length;
    const progress = totalAiTasks > 0 ? (completedAiTasks / totalAiTasks) * 100 : 0;


   
  return (
    <div className="space-y-8 mt-0">
        <Tabs defaultValue="home" id="main-tabs">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4" id="main-tabs-nav">
              <TabsList className="grid w-full grid-cols-5 rounded-2xl p-1">
                <TabsTrigger value="home" className="rounded-xl data-[state=active]:rounded-xl" id="home-tab-trigger"><Home className="w-4 h-4 mr-2"/>Home</TabsTrigger>
                <TabsTrigger value="files" className="rounded-xl data-[state=active]:rounded-xl"><Folder className="w-4 h-4 mr-2"/>Files</TabsTrigger>
                <TabsTrigger value="projects" className="rounded-xl data-[state=active]:rounded-xl"><Briefcase className="w-4 h-4 mr-2"/>Projects</TabsTrigger>
                <TabsTrigger value="learn" className="rounded-xl data-[state=active]:rounded-xl"><BookOpen className="w-4 h-4 mr-2"/>Learn</TabsTrigger>
                <TabsTrigger value="integrations" className="rounded-xl data-[state=active]:rounded-xl"><LinkIcon className="w-4 h-4 mr-2"/>Integrations</TabsTrigger>
              </TabsList>
              <div className="hidden md:flex gap-2">
                <Dialog open={isUploadOpen} onOpenChange={setUploadOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="rounded-2xl" id="upload-materials-button">
                          <Download className="mr-2 h-4 w-4" />
                          Upload Materials
                        </Button>
                    </DialogTrigger>
                    <DialogContent
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                         <DialogHeader>
                           <DialogTitle>Upload Study Materials</DialogTitle>
                         </DialogHeader>
                         <div 
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                                isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                            )}
                            onClick={() => document.getElementById('file-upload-input')?.click()}
                           >
                           <input 
                             id="file-upload-input"
                             type="file" 
                             multiple 
                             className="hidden"
                             onChange={(e) => handleFileChange(e.target.files)}
                           />
                           <div className="flex flex-col items-center justify-center pt-5 pb-6">
                             <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                             <p className="mb-2 text-lg font-semibold">
                               Drag and drop your files here
                             </p>
                             <p className="text-sm text-muted-foreground">
                               Or click to browse
                             </p>
                           </div>
                         </div>
                         {files && files.length > 0 && (
                           <div className="mt-4">
                               <h3 className="text-lg font-semibold">Selected files:</h3>
                               <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                                    {Array.from(files).map((file, index) => (
                                        <li key={index}>{file.name}</li>
                                    ))}
                               </ul>
                           </div>
                         )}
                         <DialogFooter>
                             <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                             <Button onClick={handleUpload}>Upload</Button>
                         </DialogFooter>
                    </DialogContent>
                </Dialog>
                
                <Dialog open={isAddCourseOpen} onOpenChange={(open) => { if (!open) resetAddCourseDialog(); setAddCourseOpen(open); }}>
                    <DialogTrigger asChild>
                        <Button className="rounded-2xl">
                          <Plus className="mr-2 h-4 w-4" />
                          New Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a New Course</DialogTitle>
                            <DialogDescription>
                                {addCourseStep === 1 ? 'First, provide some details about your course.' : 'How quickly do you want to learn?'}
                            </DialogDescription>
                        </DialogHeader>
                        {addCourseStep === 1 ? (
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Course Name</Label>
                                    <Input id="name" name="name" value={newCourse.name} onChange={handleInputChange} placeholder="e.g., Introduction to AI"/>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea id="description" name="description" value={newCourse.description} onChange={handleInputChange} placeholder="A brief summary of the course"/>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="url">Course URL (Optional)</Label>
                                    <Input id="url" name="url" value={newCourse.url} onChange={handleInputChange} placeholder="https://example.com/course-link"/>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="is-new-topic">Are you currently in this course?</Label>
                                    <Select onValueChange={(value) => setIsNewTopic(value === 'true')}>
                                        <SelectTrigger id="is-new-topic">
                                            <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="false">Yes, I am</SelectItem>
                                            <SelectItem value="true">No, I'm learning something new</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ) : (
                            <div className="py-4">
                                <RadioGroup value={learningPace} onValueChange={setLearningPace} className="space-y-4">
                                    {paces.map(pace => (
                                        <Label key={pace.value} htmlFor={`pace-${pace.value}`} className={cn("flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer", learningPace === pace.value && "border-primary bg-primary/10 ring-2 ring-primary")}>
                                            <RadioGroupItem value={pace.value} id={`pace-${pace.value}`} className="mt-1" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    {pace.icon}
                                                    <span className="font-semibold text-lg">{pace.label}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{pace.description}</p>
                                            </div>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
                        )}
                        <DialogFooter>
                             {addCourseStep === 1 ? (
                                <>
                                    <Button variant="ghost" onClick={() => { setAddCourseOpen(false); resetAddCourseDialog();}}>Cancel</Button>
                                    {isNewTopic ? (
                                        <Button onClick={() => setAddCourseStep(2)} disabled={isSavingCourse || isNewTopic === null || !newCourse.name}>
                                            Next
                                        </Button>
                                    ) : (
                                         <Button onClick={handleAddCourse} disabled={isSavingCourse || isNewTopic === null || !newCourse.name}>
                                            Add Course
                                        </Button>
                                    )}
                                </>
                             ) : (
                                <>
                                    <Button variant="ghost" onClick={() => setAddCourseStep(1)}>Back</Button>
                                    <Button onClick={handleAddCourse} disabled={isSavingCourse || isRoadmapGenerating}>
                                        {isSavingCourse ? 'Saving...' : (isRoadmapGenerating ? 'Generating Roadmap...' : 'Add Course')}
                                    </Button>
                                </>
                             )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </div>
            </div>

            <TabsContent value="home">
                 <section>
                    <motion.div
                        id="welcome-banner"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={cn(
                            "relative overflow-hidden rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8",
                             isHalloweenTheme ? 'halloween-welcome' : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600'
                        )}
                    >
                        {isHalloweenTheme && (
                            <div className="halloween-scene">
                                <div className="bat-container"><div className="bat"></div></div>
                                <div className="bat-container" style={{animationDelay: '1s'}}><div className="bat"></div></div>
                                <div className="bat-container" style={{animationDelay: '2s'}}><div className="bat"></div></div>
                            </div>
                        )}
                      <div className="relative flex-1 space-y-4">
                        <Badge className="bg-white/20 text-white hover:bg-white/30 rounded-xl">Get Started</Badge>
                        <h2 className="text-3xl font-bold">Welcome back, {user?.displayName?.split(' ')[0] || 'Learner'}!</h2>
                        <p className="max-w-md text-white/80">
                            This is your central hub for all your learning activities. Let's make today a productive one!
                        </p>
                         <div className="mt-4 flex gap-4">
                            <div className="animated-button-container group w-full max-w-[280px]">
                              <Spotlight />
                                <Button asChild variant="outline" className="relative w-full bg-white text-black hover:bg-gray-100 rounded-xl font-semibold flex items-center gap-2 overflow-hidden h-11 text-base">
                                   <Link href="/dashboard/courses" >
                                    <Logo className="w-5 h-5"/>
                                    Start Tutorin
                                  </Link>
                                </Button>
                            </div>
                        </div>
                      </div>
                       <div className="relative hidden lg:flex items-center justify-center gap-8">
                           
                            <AIBuddy 
                                className="w-32 h-32"
                                color={customizations.color}
                                hat={customizations.hat}
                                shirt={customizations.shirt}
                                shoes={customizations.shoes}
                            />
                        </div>
                    </motion.div>
                </section>
                
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card id="streak-card" className="bg-orange-500/10 border-orange-500/20 text-orange-900 dark:text-orange-200">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center justify-center gap-4 text-center">
                                     <div className="p-4 bg-white/50 rounded-full">
                                        <Flame className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold">{streak} Day Streak!</h3>
                                        <p className="text-sm opacity-80 mt-1">
                                            {streak > 1 ? "Keep the fire going! You're building a great habit." : "Every journey starts with a single step. Keep it up!"}
                                        </p>
                                    </div>
                                    <Dialog onOpenChange={(open) => !open && setRewardState('idle')}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="rounded-full border-orange-500/50 bg-transparent hover:bg-white/20 mt-2">
                                                View Streak Rewards
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" /> Your Reward Chests</DialogTitle>
                                                <CardDescription>
                                                    Claim chests by maintaining your study streak.
                                                </CardDescription>
                                            </DialogHeader>
                                            <div className="py-4 space-y-4">
                                                {rewardState === 'idle' && chests.map(chest => {
                                                    const hasClaimedStreak = chest.unlocksAt && localStorage.getItem(`streakChestClaimed_${chest.id}_${user?.uid}`);
                                                    const isStreakLocked = chest.unlocksAt && streak < chest.unlocksAt;
                                                    const isFreeClaimed = chest.id === 'daily_free' && hasClaimedFreeChest;
                                                    const isDisabled = isStreakLocked || (isFreeClaimed && chest.id === 'daily_free') || !!hasClaimedStreak;
                                                    
                                                    let buttonText: React.ReactNode = "Claim Reward";
                                                    if(isFreeClaimed && chest.id === 'daily_free') {
                                                        buttonText = 'Claimed Today';
                                                    } else if (hasClaimedStreak) {
                                                        buttonText = 'Claimed';
                                                    } else if (isStreakLocked) {
                                                        const daysLeft = chest.unlocksAt! - streak;
                                                        buttonText = `Unlock in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`;
                                                    }


                                                    return (
                                                        <Card key={chest.id} className={cn("transition-all", isDisabled && "opacity-50")}>
                                                            <CardContent className="p-4 flex items-center justify-between gap-2">
                                                                <div className="flex items-center gap-4 flex-1">
                                                                    <div className="p-3 rounded-lg bg-muted">
                                                                        <Gift className="h-8 w-8 text-primary" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-semibold">{chest.name}</p>
                                                                        <p className="text-sm text-muted-foreground">{chest.description}</p>
                                                                    </div>
                                                                </div>
                                                                <Button size="sm" className="w-36" disabled={isDisabled} onClick={() => handleClaimChest(chest)}>
                                                                    {buttonText}
                                                                </Button>
                                                            </CardContent>
                                                        </Card>
                                                    )
                                                })}

                                                {rewardState !== 'idle' && (
                                                    <div className="flex flex-col items-center justify-center h-48">
                                                        <motion.div
                                                            className="relative w-32 h-32"
                                                            animate={rewardState === 'opening' ? { y: [0, -20, 0, -10, 0], rotate: [0, 5, -5, 5, 0] } : {}}
                                                            transition={rewardState === 'opening' ? { duration: 0.8, ease: 'easeInOut' } : {}}
                                                        >
                                                            <Gift className={cn("w-32 h-32 text-yellow-500 transition-all duration-500", rewardState === 'revealed' && 'scale-150 opacity-0')} />
                                                            {rewardState === 'revealed' && (
                                                                <motion.div 
                                                                    className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-amber-400"
                                                                    initial={{ scale: 0, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    transition={{ delay: 0.3, type: 'spring' }}
                                                                >
                                                                    <Gem className="mr-2 h-6 w-6"/> +{claimedCoins}
                                                                </motion.div>
                                                            )}
                                                        </motion.div>
                                                        {rewardState === 'revealed' && (
                                                            <Button className="mt-8" onClick={() => setRewardState('idle')}>Awesome!</Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                        <Card id="active-courses">
                             <CardHeader>
                                <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Active Courses</h2>
                                <Link href="/dashboard/courses">
                                    <Button variant="ghost" className="rounded-2xl text-sm">
                                        View All
                                    </Button>
                                </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {isDataLoading ? (
                                        Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
                                    ) : courses.length > 0 ? (
                                        courses.slice(0, 2).map((course) => {
                                            const totalChapters = course.units?.reduce((acc, unit) => acc + (unit.chapters?.length ?? 0), 0) ?? 0;
                                            const completedCount = course.completedChapters?.length ?? 0;
                                            const courseProgress = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

                                            return (
                                                <Card key={course.id} className="p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className="font-medium">{course.name}</h3>
                                                            <Badge variant="outline" className="rounded-xl">
                                                            In Progress
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between text-sm">
                                                            <span>Progress</span>
                                                            <span>{courseProgress}%</span>
                                                            </div>
                                                            <Progress value={courseProgress} className="h-2 rounded-xl" />
                                                        </div>
                                                </Card>
                                            );
                                        })
                                    ) : (
                                        <div className="p-4 text-center text-muted-foreground">You haven't added any courses yet.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                     <div className="space-y-4">
                        <Dialog open={isFocusDialogOpen} onOpenChange={setIsFocusDialogOpen}>
                            <Card id="todays-focus-card">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="text-primary"/> Today's Focus
                                        </CardTitle>
                                        <div className="flex gap-1">
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7"><ListTodo className="h-4 w-4"/></Button>
                                            </DialogTrigger>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={addTodo}><Plus className="h-4 w-4"/></Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {todos.length > 0 ? todos.slice(0, 3).map(todo => (
                                        <div key={todo.id} className="flex items-center gap-3 group">
                                            <button onClick={() => toggleTodo(todo.id)}>
                                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", todo.completed ? "bg-primary border-primary" : "border-muted-foreground")}>
                                                    {todo.completed && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground"/>}
                                                </div>
                                            </button>
                                            {todo.isEditing ? (
                                                <Input 
                                                    autoFocus
                                                    value={todo.text}
                                                    onChange={(e) => updateTodoText(todo.id, e.target.value)}
                                                    onBlur={() => saveTodo(todo.id)}
                                                    onKeyDown={(e) => e.key === 'Enter' && saveTodo(todo.id)}
                                                    className="h-8 text-sm"
                                                />
                                            ) : (
                                                <span className={cn("text-sm flex-1", todo.completed && "line-through text-muted-foreground")}>{todo.text}</span>
                                            )}
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => addCalendarEvent(todo.text)}>
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-center text-muted-foreground py-4">No tasks yet. Add one or get AI suggestions!</p>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    {dailyRewardClaimed && (
                                        <div className="text-xs text-green-600 font-semibold flex items-center gap-1 w-full justify-center">
                                            <CheckCircle className="w-3 h-3"/> Daily reward claimed!
                                        </div>
                                    )}
                                </CardFooter>
                            </Card>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Full Task List</DialogTitle>
                                    <DialogDescription>
                                        Time remaining today: <span className="font-mono font-semibold">{timeUntilMidnight}</span>
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-3 max-h-80 overflow-y-auto">
                                     {todos.map(todo => (
                                        <div key={todo.id} className="flex items-center gap-3 group p-2 rounded-md hover:bg-muted">
                                            <button onClick={() => toggleTodo(todo.id)}>
                                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", todo.completed ? "bg-primary border-primary" : "border-muted-foreground")}>
                                                    {todo.completed && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground"/>}
                                                </div>
                                            </button>
                                            <span className={cn("text-sm flex-1", todo.completed && "line-through text-muted-foreground")}>{todo.text}</span>
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => addCalendarEvent(todo.text)}>
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Card id="recent-files-card">
                             <CardHeader>
                               <CardTitle>Recent Files</CardTitle>
                               <CardDescription>Your most recently accessed documents.</CardDescription>
                             </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Last Modified</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentFiles.length > 0 ? (
                                            recentFiles.slice(0, 3).map((file, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{file.name}</TableCell>
                                                    <TableCell>{file.subject}</TableCell>
                                                    <TableCell>{file.modified}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground p-8">
                                                    You haven't uploaded any files yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="files">
                <Card>
                    <CardHeader>
                        <CardTitle>All Files</CardTitle>
                        <CardDescription>Manage all your uploaded study materials, organized by course and unit.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {courses.filter(course => course.units && course.units.some(unit => unit.files && unit.files.length > 0)).length > 0 ? (
                            <Accordion type="multiple" className="w-full">
                                {courses.filter(course => course.units && course.units.some(unit => unit.files && unit.files.length > 0)).map(course => (
                                    <AccordionItem key={course.id} value={course.id}>
                                        <AccordionTrigger className="text-xl font-semibold">
                                            <div className="flex items-center gap-3">
                                                <FolderOpen />
                                                {course.name}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="pl-6">
                                                {course.units?.filter(unit => unit.files && unit.files.length > 0).map(unit => (
                                                    <Accordion key={unit.id} type="single" collapsible>
                                                        <AccordionItem value={unit.id}>
                                                            <AccordionTrigger>{unit.name}</AccordionTrigger>
                                                            <AccordionContent>
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead>File Name</TableHead>
                                                                            <TableHead>Type</TableHead>
                                                                            <TableHead>Size</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {unit.files?.map(file => (
                                                                            <TableRow key={file.id}>
                                                                                <TableCell className="font-medium">{file.name}</TableCell>
                                                                                <TableCell>{file.type}</TableCell>
                                                                                <TableCell>{(file.size / 1024).toFixed(2)} KB</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center text-muted-foreground p-8">
                                You haven't uploaded any files to your courses yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>


            <TabsContent value="projects">
                {projects.length > 0 ? (
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Projects &amp; Assignments</CardTitle>
                                    <CardDescription>Keep track of your larger tasks and their deadlines.</CardDescription>
                                </div>
                                <Dialog open={isAddProjectOpen} onOpenChange={setAddProjectOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                        <Plus className="mr-2 h-4 w-4" /> Add Project
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add a New Project</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="project-name">Project Name</Label>
                                                <Input id="project-name" value={newProject.name} onChange={(e) => handleProjectInputChange('name', e.target.value)} placeholder="e.g., Research Paper"/>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="project-course">Course</Label>
                                                <Select value={newProject.course} onValueChange={(value) => handleProjectInputChange('course', value)}>
                                                    <SelectTrigger id="project-course">
                                                        <SelectValue placeholder="Select a course" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {courses.map(course => (
                                                            <SelectItem key={course.id} value={course.name}>{course.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="project-due-date">Due Date</Label>
                                                <DatePicker date={newProject.dueDate} setDate={(date) => handleProjectInputChange('dueDate', date)} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                            <Button onClick={handleAddProject}>Add Project</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => (
                                    <Card key={project.id} className="flex flex-col">
                                        <CardHeader>
                                            <CardTitle>{project.name}</CardTitle>
                                            <CardDescription>{project.course}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-sm text-muted-foreground">Due: {format(new Date(project.dueDate), "PPP")}</p>
                                        </CardContent>
                                        <CardFooter>
                                            <Badge 
                                                variant={project.status === 'Completed' ? 'secondary' : project.status === 'In Progress' ? 'default' : 'outline'}
                                                className={cn(
                                                    project.status === 'Completed' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                                                    project.status === 'In Progress' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                                                )}
                                            >{project.status}</Badge>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="text-center py-20 rounded-lg border border-dashed">
                        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Projects Yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Click the button to add your first project or assignment.
                        </p>
                        <Dialog open={isAddProjectOpen} onOpenChange={setAddProjectOpen}>
                            <DialogTrigger asChild>
                                <Button className="mt-4">
                                <Plus className="mr-2 h-4 w-4" /> Add Project
                                </Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add a New Project</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="project-name">Project Name</Label>
                                        <Input id="project-name" value={newProject.name} onChange={(e) => handleProjectInputChange('name', e.target.value)} placeholder="e.g., Research Paper"/>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="project-course">Course</Label>
                                        <Select value={newProject.course} onValueChange={(value) => handleProjectInputChange('course', value)}>
                                            <SelectTrigger id="project-course">
                                                <SelectValue placeholder="Select a course" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courses.map(course => (
                                                    <SelectItem key={course.id} value={course.name}>{course.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="project-due-date">Due Date</Label>
                                        <DatePicker date={newProject.dueDate} setDate={(date) => handleProjectInputChange('dueDate', date)} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                    <Button onClick={handleAddProject}>Add Project</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </TabsContent>


            <TabsContent value="learn">
              {weakestLinkLoading ? (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-8 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ) : Object.keys(weakestLinks).length > 0 ? (
                <Accordion type="multiple" className="w-full space-y-4">
                    {Object.entries(weakestLinks).map(([topic, states]) => (
                         <AccordionItem key={topic} value={topic} className="bg-amber-500/5 border border-amber-500/20 rounded-lg">
                            <AccordionTrigger className="p-6">
                               <div className="flex items-center gap-3">
                                  <Lightbulb className="h-6 w-6 text-amber-500" />
                                  <div>
                                    <h3 className="font-semibold text-lg text-left">Weakest Link Workout: {topic}</h3>
                                    <p className="text-sm text-muted-foreground text-left">{states.length} questions to review</p>
                                  </div>
                               </div>
                            </AccordionTrigger>
                            <AccordionContent>
                               <div className="px-6 pb-6 space-y-8">
                                    {states.map((state, index) => (
                                         <div key={state.attempt.id} className="border-t border-dashed border-amber-500/30 pt-6">
                                            <p className="font-semibold text-base">Question {index+1}: {state.attempt.question}</p>
                                            <div className="space-y-2 mt-2">
                                                <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 text-red-700 text-sm">
                                                    <XCircle className="h-5 w-5 flex-shrink-0" />
                                                    <div><span className="font-semibold">Your Answer:</span> {state.attempt.userAnswer}</div>
                                                </div>
                                                <div className="flex items-center gap-2 p-2 rounded-md bg-green-500/10 text-green-700 text-sm">
                                                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                                                    <div><span className="font-semibold">Correct Answer:</span> {state.attempt.correctAnswer}</div>
                                                </div>
                                            </div>

                                            {state.remediationChapter ? (
                                                <div className="mt-4 p-4 bg-background rounded-lg border space-y-4">
                                                     <h4 className="font-semibold flex items-center gap-2 text-primary"><BrainCircuit size={18}/> Remediation Chapter: {state.remediationChapter.title}</h4>
                                                     {/* Assuming content is a stringified JSON array */}
                                                     <div className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
                                                        {(() => {
                                                            try {
                                                                const parsedContent = JSON.parse(state.remediationChapter.content);
                                                                if (Array.isArray(parsedContent)) {
                                                                    return parsedContent.map((block, idx) => (
                                                                        block.type === 'text' ? <p key={idx} className="mb-4">{block.content}</p> : null
                                                                    ));
                                                                }
                                                            } catch (e) { console.error("Error parsing remediation content", e); }
                                                            return <p>{state.remediationChapter.content}</p>; // Fallback
                                                        })()}
                                                    </div>
                                                     <Button size="sm" onClick={() => {
                                                         toast({ title: 'Concept Mastered!', description: 'This topic has been cleared from your workout.'});
                                                         setWeakestLinks(prev => ({...prev, [topic]: prev[topic].filter(l => l.attempt.id !== state.attempt.id)}));
                                                         deleteDoc(doc(db, 'quizAttempts', state.attempt.id));
                                                     }}>
                                                        I Understand Now, Mark as Mastered
                                                    </Button>
                                                </div>
                                            ) : state.explanation ? (
                                                <div className="space-y-4 pt-4">
                                                    {state.explanation.explanation && (
                                                        <div className="p-4 bg-background rounded-lg border">
                                                            <h4 className="font-semibold flex items-center gap-2 mb-2"><Wand2 size={16}/> AI Explanation</h4>
                                                            <AudioPlayer textToPlay={state.explanation.explanation} />
                                                            <p className="text-muted-foreground text-sm">{state.explanation.explanation}</p>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="p-4 bg-background rounded-lg border">
                                                        <h4 className="font-semibold flex items-center gap-2 mb-2"><BrainCircuit size={16}/> Try Again: New Question</h4>
                                                        <p className="font-semibold mb-4 text-sm">{state.explanation.practiceQuestion.question}</p>
                                                        <RadioGroup 
                                                            value={state.practiceAnswer} 
                                                            onValueChange={(val) => setPracticeAnswer(topic, state.attempt.id, val)}
                                                        >
                                                            <div className="space-y-2">
                                                                {state.explanation.practiceQuestion.options.map((option, i) => {
                                                                    return(
                                                                         <Label key={`${state.attempt.id}-${i}`} htmlFor={`pq-${state.attempt.id}-${i}`} className="flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer text-sm">
                                                                            <RadioGroupItem value={option} id={`pq-${state.attempt.id}-${i}`} />
                                                                            <span>{option}</span>
                                                                        </Label>
                                                                    )
                                                                })}
                                                            </div>
                                                        </RadioGroup>
                                                        <Button size="sm" className="mt-4" onClick={() => handleCheckPracticeAnswer(topic, state.attempt.id, state.practiceAnswer!)} disabled={!state.practiceAnswer || state.isExplanationLoading}>
                                                            {state.isExplanationLoading ? "Checking..." : "Check Answer"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button size="sm" className="mt-4" onClick={() => handleGetExplanation(topic, state.attempt.id)} disabled={state.isExplanationLoading}>
                                                    {state.isExplanationLoading ? "Thinking..." : "Explain with AI & Give Me a New Question"}
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                               </div>
                            </AccordionContent>
                         </AccordionItem>
                    ))}
                </Accordion>
              ) : (
                <Card className="text-center p-12">
                    <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">No Weak Links!</h3>
                    <p className="text-muted-foreground mt-2">
                        Great job! We haven't found any incorrect answers yet. Keep up the good work.
                    </p>
                    <Link href="/dashboard/practice-quiz">
                        <Button variant="outline" className="mt-4">Take a Quiz</Button>
                    </Link>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="integrations">
                <Card>
                     <CardHeader>
                        <CardTitle>Connect Your Apps</CardTitle>
                        <CardDescription>Seamlessly integrate with the tools you already use.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {integrations.map((integration) => (
                            <Card key={integration.name}>
                                <CardHeader className="flex flex-row items-center gap-4">
                                     <Image
                                        className="size-12"
                                        src={integration.icon}
                                        alt={`${integration.name}-icon`}
                                        width={48}
                                        height={48}
                                    />
                                    <div>
                                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                                        <CardDescription className="text-xs">{integration.description}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardFooter>
                                    <Button variant="outline" className="w-full" disabled>Coming Soon</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>

        </Tabs>
        <Dialog open={isConceptsOpen} onOpenChange={setIsConceptsOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Key Concepts Hub</DialogTitle>
                    <DialogDescription>
                        Select a course to generate interactive flashcards for its key terms.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="concept-course">Course</Label>
                        <Select value={selectedConceptCourse} onValueChange={setSelectedConceptCourse}>
                            <SelectTrigger id="concept-course">
                                <SelectValue placeholder="Select a course..." />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleGenerateFlashcards} disabled={isFlashcardLoading || !selectedConceptCourse} className="w-full">
                        {isFlashcardLoading ? 'Generating...' : 'Generate Flashcards'}
                    </Button>
                    
                    <div className="mt-6">
                        {isFlashcardLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <p className="animate-pulse">Brewing flashcards...</p>
                            </div>
                        ) : flashcards.length > 0 ? (
                            <div className="space-y-4">
                                <div className="text-center text-sm text-muted-foreground">
                                    Card {currentFlashcardIndex + 1} of {flashcards.length}
                                </div>
                                <div
                                    className="relative w-full h-64 cursor-pointer"
                                    onClick={() => setIsFlipped(!isFlipped)}
                                >
                                    <AnimatePresence>
                                        <motion.div
                                            key={isFlipped ? 'back' : 'front'}
                                            initial={{ rotateY: isFlipped ? 180 : 0 }}
                                            animate={{ rotateY: 0 }}
                                            exit={{ rotateY: isFlipped ? 0 : -180 }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute w-full h-full p-6 flex items-center justify-center text-center rounded-lg border bg-card text-card-foreground shadow-sm"
                                            style={{ backfaceVisibility: 'hidden' }}
                                        >
                                            <p className="text-xl font-semibold">
                                                {isFlipped ? flashcards[currentFlashcardIndex].back : flashcards[currentFlashcardIndex].front}
                                            </p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                                <div className="flex justify-center items-center gap-4">
                                    <Button variant="outline" size="icon" onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(prev => Math.max(0, prev - 1))}} disabled={currentFlashcardIndex === 0}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={() => setIsFlipped(!isFlipped)}>
                                        <RefreshCw className="mr-2 h-4 w-4"/> Flip Card
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(prev => Math.min(flashcards.length - 1, prev + 1))}} disabled={currentFlashcardIndex === flashcards.length - 1}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
                                <p>Select a course and generate flashcards to start studying.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  )
}

export default DashboardClientPage;

    
    

    