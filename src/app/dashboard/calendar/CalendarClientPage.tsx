
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Calendar as CalendarIcon,
  X,
  Trash,
  Edit,
  Bell,
  BellRing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isEqual, addMonths, subMonths, getWeek, addDays, subDays, startOfDay, addWeeks, subWeeks } from 'date-fns';
import Loading from "./loading";


type Event = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: 'Test' | 'Homework' | 'Quiz' | 'Event' | 'Project';
  date: string; // ISO string
  userId?: string;
  description: string;
  location: string;
  attendees: string[];
  organizer: string;
  reminderMinutes: number;
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


export default function CalendarClientPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const { toast } = useToast();
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  
  const [isEventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: new Date() as Date | undefined,
    startTime: '10:00',
    endTime: '11:00',
    location: '',
    attendees: '',
    type: 'Event' as keyof EventTypes,
    reminderMinutes: 10,
  });

  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>("month");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
        router.push('/signup');
        return;
    };
    
    const q = query(
        collection(db, "calendarEvents"), 
        where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userEvents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
        setEvents(userEvents);
    });
    return () => unsubscribe();
  }, [user, loading, router]);


  const scheduleReminder = (event: Event) => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted' || event.reminderMinutes <= 0) return;

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
        setReminders(prev => prev.filter(r => r.id !== event.id));
      }, reminderTime - now);
      
      const newReminder = { id: event.id, fireTime: reminderTime, title: event.title, timeoutId };
      setReminders(prev => [...prev.filter(r => r.id !== event.id), newReminder]);
    }
  };
  
  const resetEventForm = () => {
    setEventForm({
        title: '',
        description: '',
        date: new Date(),
        startTime: '10:00',
        endTime: '11:00',
        location: 'Remote',
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
          attendees: event.attendees?.join(', ') || '',
          type: event.type,
          reminderMinutes: event.reminderMinutes,
      });
      setEventDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title || !eventForm.date || !user) {
        toast({ variant: "destructive", title: "Missing Information" });
        return;
    }
    
    const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date.toISOString(),
        startTime: eventForm.startTime,
        endTime: eventForm.endTime,
        type: eventForm.type,
        location: eventForm.location,
        attendees: eventForm.attendees.split(',').map(s => s.trim()).filter(Boolean),
        reminderMinutes: eventForm.reminderMinutes,
        userId: user.uid,
    };
    
    try {
        if (editingEvent) {
            const eventRef = doc(db, "calendarEvents", editingEvent.id);
            await updateDoc(eventRef, eventData);
            scheduleReminder({ ...editingEvent, ...eventData });
            toast({ title: "Event Updated!" });
        } else {
            const docRef = await addDoc(collection(db, "calendarEvents"), eventData);
            scheduleReminder({ id: docRef.id, ...eventData });
            toast({ title: "Event Created!" });
        }
    } catch (error) {
        console.error("Error saving event:", error);
        toast({ variant: "destructive", title: "Error saving event." });
    }
    setEventDialogOpen(false);
    resetEventForm();
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    try {
        await deleteDoc(doc(db, "calendarEvents", eventId));
        toast({ title: "Event deleted" });
        setSelectedEvent(null);
    } catch (error) {
        toast({ variant: "destructive", title: "Could not delete event." });
    }
  };

  const handlePrev = () => {
    if (currentView === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (currentView === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (currentView === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (currentView === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };
  
  const daysInMonth = useMemo(() => eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentDate)),
      end: endOfWeek(endOfMonth(currentDate)),
  }), [currentDate]);

  const weekDays = useMemo(() => eachDayOfInterval({
    start: startOfWeek(currentDate),
    end: endOfWeek(currentDate),
  }), [currentDate]);

  const timeSlots = useMemo(() => Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`), []);
  
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleOpenCreateDialog}><Plus className="mr-2 h-4 w-4" />Create</Button>
          <Button onClick={() => setCurrentDate(new Date())} variant="outline">Today</Button>
          <div className="flex items-center gap-1 rounded-md bg-muted p-1">
            <Button onClick={handlePrev} variant="ghost" size="icon"><ChevronLeft className="h-4 w-4"/></Button>
            <Button onClick={handleNext} variant="ghost" size="icon"><ChevronRight className="h-4 w-4"/></Button>
          </div>
          <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
        </div>
        <div className="flex items-center gap-2 rounded-md bg-muted p-1">
            {['day', 'week', 'month'].map((view) => (
                <Button key={view} onClick={() => setCurrentView(view as any)} size="sm" variant={currentView === view ? 'secondary' : 'ghost'}>
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                </Button>
            ))}
        </div>
      </header>

      <div className="flex flex-1 overflow-auto">
      {currentView === 'month' && (
        <div className="grid flex-1 grid-cols-7 grid-rows-6">
            <div className="col-span-7 grid grid-cols-7 border-b">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">{day}</div>
                ))}
            </div>
            {daysInMonth.map((day) => (
                <div key={day.toString()} className="relative border-r border-b p-2">
                    <time dateTime={day.toISOString()} className={cn("text-sm", isToday(day) && "flex h-6 w-6 items-center justify-center rounded-full bg-primary font-semibold text-white")}>
                      {format(day, 'd')}
                    </time>
                    <div className="mt-1 space-y-1">
                        {events.filter(e => isEqual(startOfDay(new Date(e.date)), startOfDay(day))).map(event => (
                            <div key={event.id} className={cn(`${defaultEventTypes[event.type]}`, "text-white text-xs rounded p-1 truncate cursor-pointer")} onClick={() => setSelectedEvent(event)}>
                                {event.title}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      )}

      {currentView === 'week' && (
         <div className="flex flex-1">
            <div className="w-20 text-center text-sm text-muted-foreground">
                <div className="h-20 border-b flex items-end justify-center pb-2">GMT-05</div>
                {timeSlots.map(time => (
                    <div key={time} className="h-24 border-b flex justify-center items-start pt-1">
                        <span>{time.split(':')[0] % 12 === 0 ? 12 : time.split(':')[0] % 12} {parseInt(time.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span>
                    </div>
                ))}
            </div>
            <div className="grid flex-1 grid-cols-7">
                {weekDays.map(day => (
                    <div key={day.toString()} className="border-r">
                        <div className="h-20 border-b text-center p-2">
                            <p className="text-xs text-muted-foreground">{format(day, 'EEE').toUpperCase()}</p>
                            <p className={cn("text-2xl font-bold", isToday(day) && "text-primary")}>{format(day, 'd')}</p>
                        </div>
                         <div className="relative">
                            {timeSlots.map(time => (
                                <div key={time} className="h-24 border-b" />
                            ))}
                            {/* Render events for this day */}
                            {events
                                .filter(e => isEqual(startOfDay(new Date(e.date)), startOfDay(day)))
                                .map(event => {
                                    const startHour = parseInt(event.startTime.split(':')[0]);
                                    const startMinute = parseInt(event.startTime.split(':')[1]);
                                    const endHour = parseInt(event.endTime.split(':')[0]);
                                    const endMinute = parseInt(event.endTime.split(':')[1]);

                                    const top = (startHour + startMinute / 60) * 6; // 6rem per hour (h-24)
                                    const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * 6;

                                    return (
                                        <div
                                            key={event.id}
                                            onClick={() => setSelectedEvent(event)}
                                            style={{ top: `${top}rem`, height: `${height}rem`}}
                                            className={cn("absolute left-2 right-2 p-2 rounded-lg text-white text-xs cursor-pointer", defaultEventTypes[event.type])}
                                        >
                                            <p className="font-semibold">{event.title}</p>
                                            <p>{event.startTime} - {event.endTime}</p>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {currentView === 'day' && (
          <div className="grid flex-1 grid-cols-1 grid-rows-1">
              {/* Day view implementation needed */}
          </div>
      )}
      </div>
      
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
              className={cn(defaultEventTypes[selectedEvent.type], "p-6 rounded-lg shadow-xl max-w-md w-full mx-4 text-white")}
            >
              <h3 className="text-2xl font-bold mb-4 flex justify-between items-center">
                {selectedEvent.title}
                {reminders.find(r => r.id === selectedEvent.id) ? 
                    <BellRing className="h-5 w-5 text-yellow-300" /> : 
                    <Bell className="h-5 w-5 text-white/70" />
                }
              </h3>
              <div className="space-y-3">
                <p className="flex items-center"><Clock className="mr-2 h-5 w-5" />{`${selectedEvent.startTime} - ${selectedEvent.endTime}`}</p>
                <p className="flex items-center"><CalendarIcon className="mr-2 h-5 w-5" />{`${format(new Date(selectedEvent.date), "EEEE, MMMM d, yyyy")}`}</p>
                <p className="flex items-start"><Users className="mr-2 h-5 w-5 mt-1" /><span><strong>Attendees:</strong><br />{selectedEvent.attendees?.join(", ") || "No attendees"}</span></p>
                <p><strong>Description:</strong> {selectedEvent.description}</p>
              </div>
               <div className="mt-6 flex justify-between">
                <div>
                  <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white" onClick={() => handleOpenEditDialog(selectedEvent)}>
                      <Edit className="mr-2 h-4 w-4"/> Edit
                  </Button>
                  <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white" onClick={() => handleDeleteEvent(selectedEvent.id)}>
                      <Trash className="mr-2 h-4 w-4"/> Delete
                  </Button>
                </div>
                <Button variant="outline" className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100" onClick={() => setSelectedEvent(null)}>Close</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Dialog open={isEventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label htmlFor="event-title">Title</Label><Input id="event-title" value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} /></div>
            <div className="grid gap-2"><Label htmlFor="event-desc">Description</Label><Textarea id="event-desc" value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label htmlFor="event-date">Date</Label><DatePicker date={eventForm.date} setDate={(d) => setEventForm({...eventForm, date: d})} /></div>
                <div className="grid gap-2"><Label htmlFor="event-type">Event Type</Label><Select onValueChange={(value: keyof EventTypes) => setEventForm({...eventForm, type: value})} value={eventForm.type}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(defaultEventTypes).map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label htmlFor="event-start-time">Start Time</Label><Input id="event-start-time" type="time" value={eventForm.startTime} onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})} /></div>
                <div className="grid gap-2"><Label htmlFor="event-end-time">End Time</Label><Input id="event-end-time" type="time" value={eventForm.endTime} onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})} /></div>
            </div>
             <div className="grid gap-2"><Label htmlFor="event-reminder">Reminder</Label><Select onValueChange={(value) => setEventForm({...eventForm, reminderMinutes: Number(value)})} value={String(eventForm.reminderMinutes)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">No reminder</SelectItem><SelectItem value="5">5 minutes before</SelectItem><SelectItem value="10">10 minutes before</SelectItem><SelectItem value="30">30 minutes before</SelectItem><SelectItem value="60">1 hour before</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
            <Button onClick={handleSaveEvent}>Save Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
