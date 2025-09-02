
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, getDate } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';

type EventType = 'Test' | 'Homework' | 'Quiz' | 'Event';

type Event = {
  id: string;
  date: Date;
  title: string;
  time: string;
  color: string;
  type: EventType;
};

const colors = [
    { value: 'bg-red-200 dark:bg-red-900/40 border-red-400 text-red-800 dark:text-red-200', name: 'Red' },
    { value: 'bg-yellow-200 dark:bg-yellow-900/40 border-yellow-400 text-yellow-800 dark:text-yellow-200', name: 'Yellow' },
    { value: 'bg-green-200 dark:bg-green-900/40 border-green-400 text-green-800 dark:text-green-200', name: 'Green' },
    { value: 'bg-blue-200 dark:bg-blue-900/40 border-blue-400 text-blue-800 dark:text-blue-200', name: 'Blue' },
    { value: 'bg-purple-200 dark:bg-purple-900/40 border-purple-400 text-purple-800 dark:text-purple-200', name: 'Purple' },
    { value: 'bg-indigo-200 dark:bg-indigo-900/40 border-indigo-400 text-indigo-800 dark:text-indigo-200', name: 'Indigo' },
];

const initialEvents: Event[] = [];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isAddEventOpen, setAddEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState<Date | undefined>(undefined);
  const [newEventTime, setNewEventTime] = useState('12:00');
  const [newEventColor, setNewEventColor] = useState(colors[3].value);
  const [newEventTye, setNewEventType] = useState<EventType>('Event');


  const startDay = startOfWeek(startOfMonth(currentDate));
  const endDay = endOfWeek(endOfMonth(currentDate));
  const calendarDays = eachDayOfInterval({ start: startDay, end: endDay });

  const handleAddEvent = () => {
    if (!newEventTitle || !newEventDate) return;
    const newEvent: Event = {
      id: crypto.randomUUID(),
      date: newEventDate,
      title: newEventTitle,
      time: newEventTime,
      color: newEventColor,
      type: newEventTye,
    };
    setEvents([...events, newEvent].sort((a, b) => a.time.localeCompare(b.time)));
    setNewEventTitle('');
    setNewEventDate(undefined);
    setNewEventTime('12:00');
    setNewEventColor(colors[3].value);
    setNewEventType('Event');
    setAddEventOpen(false);
  };
  
  const openAddDialogForDate = (date: Date) => {
    setNewEventDate(date);
    setAddEventOpen(true);
  }

  const DayCell = ({ day }: { day: Date }) => {
    const dayEvents = events.filter(e => format(e.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
    const isCurrentMonth = isSameMonth(day, currentDate);
    const isCurrentToday = isToday(day);

    return (
      <div 
        className={`h-36 p-2 flex flex-col border-b border-r ${isCurrentMonth ? '' : 'bg-muted/50'} hover:bg-muted/80 transition-colors duration-200 cursor-pointer`}
        onClick={() => openAddDialogForDate(day)}
      >
        <span className={`self-start flex items-center justify-center h-6 w-6 text-sm rounded-full ${isCurrentToday ? 'bg-primary text-primary-foreground' : ''} ${!isCurrentMonth ? 'text-muted-foreground' : ''}`}>
          {getDate(day)}
        </span>
        <div className="flex-1 overflow-y-auto mt-1 space-y-1 no-scrollbar">
          {dayEvents.map(event => (
            <div key={event.id} className={cn('text-xs p-1.5 rounded-md truncate border', event.color)}>
              <span className="font-semibold">{`[${event.type}]`} {event.time}</span> - {event.title}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold w-32 text-center">{format(currentDate, 'MMMM yyyy')}</span>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
           <Dialog open={isAddEventOpen} onOpenChange={setAddEventOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} placeholder="e.g., Math Homework" />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={newEventTye} onValueChange={(v) => setNewEventType(v as EventType)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Event">Event</SelectItem>
                            <SelectItem value="Test">Test</SelectItem>
                            <SelectItem value="Homework">Homework</SelectItem>
                            <SelectItem value="Quiz">Quiz</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <DatePicker date={newEventDate} setDate={setNewEventDate} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="time">Time</Label>
                        <Input id="time" type="time" value={newEventTime} onChange={(e) => setNewEventTime(e.target.value)} />
                    </div>
                </div>
                <div className="grid gap-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {colors.map(color => (
                        <button 
                            key={color.name}
                            onClick={() => setNewEventColor(color.value)}
                            className={cn('w-8 h-8 rounded-full border-2 transition-all', newEventColor === color.value ? 'border-primary scale-110' : 'border-transparent', color.value.split(' ')[0])}
                        >
                           <span className="sr-only">{color.name}</span>
                        </button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setAddEventOpen(false)}>Cancel</Button>
                <Button onClick={handleAddEvent}>Add Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <Card className="flex-1">
        <CardContent className="p-0 h-full">
          <div className="grid grid-cols-7 h-full">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium p-2 border-b border-r text-muted-foreground">{day}</div>
            ))}
            {calendarDays.map(day => (
              <DayCell key={day.toString()} day={day} />
            ))}
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
