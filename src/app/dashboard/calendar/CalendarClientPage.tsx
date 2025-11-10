

"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Clock,
  MapPin,
  Users,
  Calendar as CalendarIcon,
  Pause,
  Sparkles,
  X,
  Upload,
  Trash,
  Bell,
  BellRing,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc, onSnapshot, orderBy } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { format, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, getDay, isToday, isEqual, addMonths, subMonths, eachWeekOfInterval, addDays, getWeek, addWeeks, subWeeks, startOfDay } from 'date-fns';
import AIBuddy from "@/components/ai-buddy";


type Event = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  day: number;
  description: string;
  location: string;
  attendees: string[];
  organizer: string;
  type: 'Test' | 'Homework' | 'Quiz' | 'Event' | 'Project';
  date: string;
  reminderMinutes: number;
  userId?: string;
};

type Reminder = {
  id: string;
  fireTime: number;
  title: string;
  timeoutId: NodeJS.Timeout;
}

type EventTypes = Record<'Test' | 'Homework' | 'Quiz' | 'Project' | 'Event', string>;


const defaultEventTypes: EventTypes = {
    'Test': 'bg-red-500',
    'Homework': 'bg-blue-500',
    'Quiz': 'bg-yellow-500',
    'Project': 'bg-purple-500',
    'Event': 'bg-green-500',
};

const classicalPlaylist = [
    "https://cdn.pixabay.com/audio/2024/05/25/audio_24944d1835.mp3", // Emotional Cinematic Music
    "https://cdn.pixabay.com/audio/2024/05/09/audio_2ef13b0649.mp3", // Cinematic Epic
    "https://cdn.pixabay.com/audio/2023/10/11/audio_a2f2670758.mp3", // Hans Zimmer Style
    "https://cdn.pixabay.com/audio/2022/11/17/audio_88f002b12e.mp3", // Inspiring Cinematic
    "https://cdn.pixabay.com/audio/2024/02/08/audio_17316a1c89.mp3", // The Last Piano
];

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px">
        <path fill="#4285F4" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FFC107" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.556,44,28.718,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
);


export default function CalendarClientPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const { toast } = useToast();
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  
  const [eventTypes, setEventTypes] = useState<EventTypes>(defaultEventTypes);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // State for AI Buddy customizations
  const [customizations, setCustomizations] = useState<Record<string, string>>({});


  // New/Edit Event Dialog State
  const [isEventDialogOpen, setEventDialogOpen] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: new Date() as Date | undefined,
    startTime: '10:00',
    endTime: '11:00',
    location: 'Remote',
    organizer: 'Self',
    attendees: '',
    type: 'Event' as keyof EventTypes,
    reminderMinutes: 10,
  });

  // Settings dialog
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [tempEventTypes, setTempEventTypes] = useState(eventTypes);

  // Date state
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isDateInitialized, setIsDateInitialized] = useState(false);

  // Google Calendar Integration
  const searchParams = useSearchParams();
  const [isGCalConnected, setIsGCalConnected] = useState(false);

  useEffect(() => {
    setCurrentDate(new Date());
    setIsDateInitialized(true);
  }, []);

   useEffect(() => {
    if (loading) return;
    if (!user) {
        router.push('/signup');
        return;
    };
    
    const fetchEvents = async () => {
        if (!user) return;
        const q = query(
            collection(db, "calendarEvents"), 
            where("userId", "==", user.uid),
            orderBy("date", "asc")
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userEvents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
            setEvents(userEvents);
            userEvents.forEach(scheduleReminder);

            // Show AI popup after 3 seconds if there are no events
            if(userEvents.length === 0) {
                const popupTimer = setTimeout(() => {
                  setShowAIPopup(true)
                }, 3000)
                return () => clearTimeout(popupTimer)
            }
        });
        return unsubscribe;
    };
    
    fetchEvents();

    setIsLoaded(true);
    const storedLearnerType = localStorage.getItem('learnerType');
    if (storedLearnerType) {
        setLearnerType(storedLearnerType);
    }
    
    const savedEventTypes = localStorage.getItem('eventTypes');
    if(savedEventTypes) {
        setEventTypes(JSON.parse(savedEventTypes));
        setTempEventTypes(JSON.parse(savedEventTypes));
    }
    
    const savedCustomizations = localStorage.getItem(`robotCustomizations_${user.uid}`);
    if(savedCustomizations) {
        setCustomizations(JSON.parse(savedCustomizations));
    }

    const gcalConnected = searchParams.get('gcal_connected') === 'true';
    if(gcalConnected) {
        setIsGCalConnected(true);
        localStorage.setItem('gcalConnected', 'true');
        toast({ title: 'Success!', description: 'Google Calendar has been connected.' });
        router.replace('/dashboard/calendar');
    } else {
        const storedGCal = localStorage.getItem('gcalConnected') === 'true';
        setIsGCalConnected(storedGCal);
    }

  }, [user, loading, router, searchParams, toast]);


  const scheduleReminder = (event: Event) => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted' || event.reminderMinutes <= 0) return;

    // Clear any existing reminder for this event
    const existingReminder = reminders.find(r => r.id === event.id);
    if (existingReminder) {
        clearTimeout(existingReminder.timeoutId);
        setReminders(prev => prev.filter(r => r.id !== event.id));
    }

    const eventTime = new Date(`${event.date.split('T')[0]}T${event.startTime}`).getTime();
    const reminderTime = eventTime - event.reminderMinutes * 60 * 1000;
    const now = new Date().getTime();

    if (reminderTime > now) {
      const timeoutId = setTimeout(() => {
        new Notification(`Reminder: ${event.title}`, {
          body: `Starts at ${event.startTime}. Location: ${event.location}`,
          icon: '/logo.png' 
        });
        // Remove reminder once it has fired
        setReminders(prev => prev.filter(r => r.id !== event.id));
      }, reminderTime - now);
      
      const newReminder = { id: event.id, fireTime: reminderTime, title: event.title, timeoutId };
      const updatedReminders = [...reminders.filter(r => r.id !== event.id), newReminder];
      setReminders(updatedReminders);
    }
  };


  useEffect(() => {
    if (showAIPopup) {
      const text = "I see your schedule is open. Want to block out some time to study for one of your courses?";
      let i = 0;
      setTypedText(""); // Clear previous text
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setTypedText((prev) => prev + text.charAt(i))
          i++
        } else {
          clearInterval(typingInterval)
        }
      }, 50)

      return () => clearInterval(typingInterval)
    }
  }, [showAIPopup])

  const [currentView, setCurrentView] = useState("week")
  
  const currentMonthName = format(currentDate, "MMMM yyyy");
  const currentDayName = format(currentDate, "MMMM d");
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
  }

  const handleBackgroundImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearBackgroundImage = () => {
    setBackgroundImage(null);
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate),
    end: endOfWeek(currentDate)
  });

  const monthWeeks = eachWeekOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  }, { weekStartsOn: 0 });

  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 8) // 8 AM to 12 AM

  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 60 // 60px per hour
    const height = (end - start) * 60
    return { top: `${top}px`, height: `${height}px` }
  }

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonthArray = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
  const firstDayOffset = getDay(firstDayOfMonth);
  
  const miniCalendarDays: (number | null)[] = [
    ...Array.from({ length: firstDayOffset }, () => null),
    ...daysInMonthArray.map(day => day.getDate())
  ];


  const togglePlay = () => {
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            if (!audioRef.current.src) {
                const randomSong = classicalPlaylist[Math.floor(Math.random() * classicalPlaylist.length)];
                audioRef.current.src = randomSong;
            }
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }
  }

    const resetEventForm = () => {
        setEventForm({
            title: '',
            description: '',
            date: new Date(),
            startTime: '10:00',
            endTime: '11:00',
            location: 'Remote',
            organizer: 'Self',
            attendees: '',
            type: 'Event',
            reminderMinutes: 10,
        });
        setEditingEvent(null);
    }
    
    const handleOpenCreateDialog = () => {
        resetEventForm();
        setEventDialogOpen(true);
    };

    const handleOpenEditDialog = (event: Event) => {
        setSelectedEvent(null);
        setEditingEvent(event);
        setEventForm({
            title: event.title,
            description: event.description,
            date: new Date(event.date),
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            organizer: event.organizer,
            attendees: event.attendees.join(', '),
            type: event.type,
            reminderMinutes: event.reminderMinutes,
        });
        setEventDialogOpen(true);
    }

    const handleSaveEvent = async () => {
        if (!eventForm.title || !eventForm.date || !user) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please provide a title and a date.",
            });
            return;
        }

        setIsSavingEvent(true);
        
        const eventData = {
            title: eventForm.title,
            description: eventForm.description,
            date: eventForm.date.toISOString(),
            startTime: eventForm.startTime,
            endTime: eventForm.endTime,
            day: eventForm.date.getDay(),
            type: eventForm.type,
            color: eventTypes[eventForm.type],
            location: eventForm.location,
            organizer: eventForm.organizer,
            attendees: eventForm.attendees.split(',').map(s => s.trim()).filter(Boolean),
            reminderMinutes: eventForm.reminderMinutes,
            userId: user.uid,
        };
        
        if (editingEvent) {
             try {
                const eventRef = doc(db, "calendarEvents", editingEvent.id);
                await updateDoc(eventRef, eventData);
                scheduleReminder({ ...editingEvent, ...eventData });
                toast({ title: "Event Updated!", description: `${eventData.title} has been updated.` });
            } catch (error) {
                console.error("Error updating event:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not update event." });
            }
        } else {
            try {
                const docRef = await addDoc(collection(db, "calendarEvents"), eventData);
                scheduleReminder({ id: docRef.id, ...eventData });
                toast({ title: "Event Created!", description: `${eventData.title} has been added to your calendar.` });
            } catch (error) {
                console.error("Error adding event: ", error);
                toast({ variant: "destructive", title: "Error", description: "Could not add event. Please try again." });
            }
        }

        setEventDialogOpen(false);
        resetEventForm();
        setIsSavingEvent(false);
    };
  
    const handleDeleteEvent = async (eventId: string) => {
        try {
            await deleteDoc(doc(db, "calendarEvents", eventId));
            setEvents(prev => prev.filter(event => event.id !== eventId));
            toast({ title: "Event deleted" });
            setSelectedEvent(null);
        } catch (error) {
            console.error("Error deleting event: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not delete event." });
        }
    };
    
    const handleSaveSettings = () => {
        setEventTypes(tempEventTypes);
        localStorage.setItem('eventTypes', JSON.stringify(tempEventTypes));
        toast({ title: "Settings Saved", description: "Your event colors have been updated." });
        setSettingsOpen(false);
    };

    const handleColorChange = (type: keyof EventTypes, colorClass: string) => {
        setTempEventTypes(prev => ({ ...prev, [type]: colorClass }));
    };

    const handleConnectGCal = () => {
        router.push('/api/auth/google/connect');
    };
    
    const colorOptions = [
        { name: 'Red', class: 'bg-red-500' },
        { name: 'Blue', class: 'bg-blue-500' },
        { name: 'Green', class: 'bg-green-500' },
        { name: 'Yellow', class: 'bg-yellow-500' },
        { name: 'Purple', class: 'bg-purple-500' },
        { name: 'Pink', class: 'bg-pink-500' },
        { name: 'Indigo', class: 'bg-indigo-500' },
        { name: 'Teal', class: 'bg-teal-500' },
    ];

  const textClass = backgroundImage ? "text-white" : "";
  const textMutedClass = backgroundImage ? "text-white/70" : "text-muted-foreground";
  const borderClass = backgroundImage ? "border-white/20" : "border-border";
  const bgClass = backgroundImage ? "bg-white/10 backdrop-blur-sm" : "bg-card";
  const placeholderClass = backgroundImage ? "placeholder:text-white/70" : "placeholder:text-muted-foreground";
  
  const handleAiPlan = () => {
      setShowAIPopup(false);
      setEventForm(prev => ({...prev, title: 'Study Session'}));
      setEventDialogOpen(true);
  }

  const handlePrev = () => {
    if (currentView === 'month') {
        setCurrentDate(subMonths(currentDate, 1));
    } else if (currentView === 'week') {
        setCurrentDate(subWeeks(currentDate, 1));
    } else {
        setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNext = () => {
      if (currentView === 'month') {
          setCurrentDate(addMonths(currentDate, 1));
      } else if (currentView === 'week') {
          setCurrentDate(addWeeks(currentDate, 1));
      } else {
          setCurrentDate(addDays(currentDate, 1));
      }
  };


  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden bg-white")}>
      <audio ref={audioRef} loop />

      {backgroundImage && (
        <Image
            src={backgroundImage}
            alt="Custom background"
            fill
            className="object-cover z-0"
        />
      )}

      <main className="relative h-screen w-full flex bg-white">
        <div
          className={`w-64 h-full ${bgClass} p-4 shadow-xl border-r ${borderClass} opacity-0 ${isLoaded ? "animate-fade-in" : ""} flex flex-col justify-between`}
          style={{ animationDelay: "0.4s" }}
        >
          <div>
            <Dialog open={isEventDialogOpen} onOpenChange={setEventDialogOpen}>
              <DialogTrigger asChild>
                <button
                    onClick={handleOpenCreateDialog}
                    className="mb-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-white w-full"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create</span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="event-title">Title</Label>
                    <Input id="event-title" value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} placeholder="e.g. Midterm Study Session" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-desc">Description</Label>
                    <Textarea id="event-desc" value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} placeholder="e.g. Review chapters 3-5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="grid gap-2">
                        <Label htmlFor="event-date">Date</Label>
                        <DatePicker date={eventForm.date} setDate={(d) => setEventForm({...eventForm, date: d})} />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="event-type">Event Type</Label>
                         <Select onValueChange={(value: keyof EventTypes) => setEventForm({...eventForm, type: value})} value={eventForm.type}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.keys(eventTypes).map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="event-start-time">Start Time</Label>
                            <Input id="event-start-time" type="time" value={eventForm.startTime} onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="event-end-time">End Time</Label>
                            <Input id="event-end-time" type="time" value={eventForm.endTime} onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})} />
                        </div>
                    </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event-reminder">Reminder</Label>
                     <Select onValueChange={(value) => setEventForm({...eventForm, reminderMinutes: Number(value)})} value={String(eventForm.reminderMinutes)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select reminder time" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">No reminder</SelectItem>
                            <SelectItem value="5">5 minutes before</SelectItem>
                            <SelectItem value="10">10 minutes before</SelectItem>
                            <SelectItem value="30">30 minutes before</SelectItem>
                            <SelectItem value="60">1 hour before</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                  <Button onClick={handleSaveEvent} disabled={isSavingEvent}>
                    {isSavingEvent ? "Saving..." : "Save Event"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${textClass} font-medium`}>{currentMonthName}</h3>
                <div className="flex gap-1">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 rounded-full hover:bg-white/20">
                    <ChevronLeft className={`h-4 w-4 ${textClass}`} />
                  </button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 rounded-full hover:bg-white/20">
                    <ChevronRight className={`h-4 w-4 ${textClass}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className={`text-xs ${textMutedClass} font-medium py-1`}>
                    {day}
                  </div>
                ))}

                {isDateInitialized && miniCalendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                      day && isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)) ? "bg-blue-500 text-white" : `${textClass} hover:bg-white/20`
                    } ${!day ? "invisible" : ""}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className={`${textClass} font-medium mb-3`}>Event Types</h3>
              <div className="space-y-2">
                {Object.entries(eventTypes).map(([type, colorClass]) => (
                  <div key={type} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${colorClass}`}></div>
                    <span className={`${textClass} text-sm`}>{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`flex-1 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          <div className={`flex items-center justify-between p-4 border-b ${borderClass}`}>
            <div className="flex items-center gap-4">
              <Button onClick={() => setCurrentDate(new Date())} variant="outline" className={`px-4 py-2 ${textClass} rounded-md`}>Today</Button>
              <div className="flex">
                <button onClick={handlePrev} className={`p-2 ${textClass} hover:bg-white/10 rounded-l-md`}>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={handleNext} className={`p-2 ${textClass} hover:bg-white/10 rounded-r-md`}>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <h2 className={`text-xl font-semibold ${textClass}`}>{currentView === 'month' ? currentMonthName : currentDayName}</h2>
            </div>

            <div className={`flex items-center gap-2 rounded-md p-1 ${bgClass}`}>
              <button
                onClick={() => setCurrentView("day")}
                className={`px-3 py-1 rounded ${currentView === "day" ? "bg-white/20" : ""} ${textClass} text-sm`}
              >
                Day
              </button>
              <button
                onClick={() => setCurrentView("week")}
                className={`px-3 py-1 rounded ${currentView === "week" ? "bg-white/20" : ""} ${textClass} text-sm`}
              >
                Week
              </button>
              <button
                onClick={() => setCurrentView("month")}
                className={`px-3 py-1 rounded ${currentView === "month" ? "bg-white/20" : ""} ${textClass} text-sm`}
              >
                Month
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
              <div className={`${bgClass} h-full`}>
              {currentView === 'day' && (
                  <div className="grid grid-cols-[auto,1fr]">
                      <div className={`${textMutedClass}`}>
                          {timeSlots.map((time, i) => (
                              <div key={i} className={`h-16 border-b ${borderClass} pr-2 text-right text-xs flex items-center justify-end`}>
                                  {time > 12 ? `${time - 12} PM` : `${time === 12 ? '12 PM' : `${time} AM`}`}
                              </div>
                          ))}
                      </div>
                      <div className={`border-l ${borderClass} relative`}>
                          {timeSlots.map((_, timeIndex) => (
                              <div key={timeIndex} className={`h-16 border-b ${borderClass}`}></div>
                          ))}
                          {events
                              .filter((event) => new Date(event.date).toDateString() === currentDate.toDateString())
                              .map((event, i) => {
                                  const eventStyle = calculateEventStyle(event.startTime, event.endTime);
                                  return (
                                      <div
                                          key={i}
                                          className={`absolute ${eventTypes[event.type]} rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg`}
                                          style={{ ...eventStyle, left: "4px", right: "4px" }}
                                          onClick={() => handleEventClick(event)}
                                      >
                                          <div className="font-medium">{event.title}</div>
                                          <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                                      </div>
                                  )
                              })}
                      </div>
                  </div>
              )}

              {currentView === 'week' && (
                  <div className="grid grid-cols-8">
                      <div className={`${textMutedClass} text-xs`}>
                          {timeSlots.map((time, i) => (
                              <div key={i} className={`h-16 border-b ${borderClass} pr-2 text-right flex items-center justify-end`}>
                                  {time > 12 ? `${time - 12} PM` : `${time === 12 ? '12 PM' : `${time} AM`}`}
                              </div>
                          ))}
                      </div>
                      {isDateInitialized && weekDays.map((day, dayIndex) => (
                           <div key={dayIndex} className={`border-l ${borderClass} relative`}>
                               <div className={`p-2 text-center border-b ${borderClass}`}>
                                  <div className={`text-xs ${textMutedClass} font-medium`}>{format(day, 'EEE')}</div>
                                  <div className={`text-lg font-medium mt-1 ${textClass} ${isToday(day) ? "bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}>
                                      {format(day, 'd')}
                                  </div>
                              </div>
                              <div className="relative">
                                  {timeSlots.map((_, timeIndex) => (
                                      <div key={timeIndex} className={`h-16 border-b ${borderClass}`}></div>
                                  ))}
                                  {events
                                      .filter((event) => new Date(event.date).toDateString() === day.toDateString())
                                      .map((event, i) => {
                                          const eventStyle = calculateEventStyle(event.startTime, event.endTime);
                                          return (
                                              <div
                                                  key={i}
                                                  className={`absolute ${eventTypes[event.type]} rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg`}
                                                  style={{ ...eventStyle, left: "4px", right: "4px" }}
                                                  onClick={() => handleEventClick(event)}
                                              >
                                                  <div className="font-medium">{event.title}</div>
                                                  <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                                              </div>
                                          )
                                      })}
                              </div>
                          </div>
                      ))}
                  </div>
              )}
              
              {currentView === 'month' && (
                  <div className="flex flex-col h-full">
                      <div className={`grid grid-cols-7 border-b ${borderClass}`}>
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                              <div key={dayName} className={`p-2 text-center text-sm font-semibold ${textClass}`}>{dayName}</div>
                          ))}
                      </div>
                      <div className="grid grid-cols-7 flex-1">
                          {isDateInitialized && Array.from({ length: getDay(startOfMonth(currentDate)) }).map((_, i) => (
                              <div key={`empty-${i}`} className={`border-r border-b ${borderClass}`}></div>
                          ))}
                          {isDateInitialized && daysInMonthArray.map((day) => (
                               <div key={day.toString()} className={`relative p-2 border-r border-b ${borderClass} min-h-[120px]`}>
                                  <div className={`text-sm font-medium ${isToday(day) ? `bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center` : textClass}`}>{format(day, 'd')}</div>
                                  <div className="mt-1 space-y-1">
                                      {events.filter(e => isEqual(startOfDay(new Date(e.date)), startOfDay(day))).map(event => (
                                          <div key={event.id} className={`${eventTypes[event.type]} text-white text-xs rounded p-1 truncate cursor-pointer`} onClick={() => handleEventClick(event)}>
                                              {event.title}
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          ))}
                           {isDateInitialized && Array.from({ length: 6 - getDay(endOfMonth(currentDate)) }).map((_, i) => (
                              <div key={`empty-end-${i}`} className={`border-r border-b ${borderClass}`}></div>
                          ))}
                      </div>
                  </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
        {showAIPopup && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-8 right-8 z-20"
          >
            <div className="w-[400px] relative bg-card/80 backdrop-blur-lg p-4 rounded-2xl shadow-xl border border-border/30 text-card-foreground">
              <button
                onClick={() => setShowAIPopup(false)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-20 h-20">
                   <AIBuddy
                        className="w-20 h-20"
                        color={customizations.color}
                        hat={customizations.hat}
                        shirt={customizations.shirt}
                        shoes={customizations.shoes}
                    />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Need help focusing?</p>
                  <p className="text-sm text-muted-foreground">{typedText}</p>
                   <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAiPlan}
                    >
                      Yes, let's plan
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAIPopup(false)}
                    >
                      No thanks
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
             onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(`${eventTypes[selectedEvent.type]}`, "p-6 rounded-lg shadow-xl max-w-md w-full mx-4 text-white")}
            >
              <h3 className="text-2xl font-bold mb-4 flex justify-between items-center">
                {selectedEvent.title}
                {reminders.find(r => r.id === selectedEvent.id) ? 
                    <BellRing className="h-5 w-5 text-yellow-300" /> : 
                    <Bell className="h-5 w-5 text-white/70" />
                }
              </h3>
              <div className="space-y-3">
                <p className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  {`${selectedEvent.startTime} - ${selectedEvent.endTime}`}
                </p>
                <p className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  {selectedEvent.location}
                </p>
                <p className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  {`${format(new Date(selectedEvent.date), "EEEE, MMMM d, yyyy")}`}
                </p>
                <p className="flex items-start">
                  <Users className="mr-2 h-5 w-5 mt-1" />
                  <span>
                    <strong>Attendees:</strong>
                    <br />
                    {selectedEvent.attendees.join(", ") || "No attendees"}
                  </span>
                </p>
                <p>
                  <strong>Organizer:</strong> {selectedEvent.organizer}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
                 <p className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Reminder set for {selectedEvent.reminderMinutes} minutes before.
                </p>
              </div>
               <div className="mt-6 flex justify-between">
                <div>
                  <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white" onClick={() => handleOpenEditDialog(selectedEvent)}>
                      <Edit className="mr-2 h-4 w-4"/> Edit
                  </Button>
                  <Button
                      variant="ghost"
                      className="text-white hover:bg-white/20 hover:text-white"
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                  >
                      <Trash className="mr-2 h-4 w-4"/> Delete
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

      </main>
    </div>
  )
}
