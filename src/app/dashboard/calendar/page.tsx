
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, getDay, isSameMonth, isToday, getDate } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';

type Event = {
  id: string;
  date: Date;
  title: string;
  type: 'Study' | 'HW' | 'Test';
};

const eventColors: Record<Event['type'], string> = {
  Study: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
  HW: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
  Test: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
};

const initialEvents: Event[] = [];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isAddEventOpen, setAddEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState<Date | undefined>(undefined);
  const [newEventType, setNewEventType] = useState<Event['type']>('Study');

  const startDay = startOfWeek(startOfMonth(currentDate));
  const endDay = endOfWeek(endOfMonth(currentDate));
  const calendarDays = eachDayOfInterval({ start: startDay, end: endDay });

  const handleAddEvent = () => {
    if (!newEventTitle || !newEventDate) return;
    const newEvent: Event = {
      id: crypto.randomUUID(),
      date: newEventDate,
      title: newEventTitle,
      type: newEventType,
    };
    setEvents([...events, newEvent]);
    setNewEventTitle('');
    setNewEventDate(undefined);
    setNewEventType('Study');
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
        className={`h-32 p-2 flex flex-col border-b border-r ${isCurrentMonth ? '' : 'bg-muted/50'}`}
        onClick={() => openAddDialogForDate(day)}
      >
        <span className={`self-start flex items-center justify-center h-6 w-6 text-sm rounded-full ${isCurrentToday ? 'bg-primary text-primary-foreground' : ''} ${!isCurrentMonth ? 'text-muted-foreground' : ''}`}>
          {getDate(day)}
        </span>
        <div className="flex-1 overflow-y-auto mt-1 space-y-1">
          {dayEvents.map(event => (
            <div key={event.id} className={`text-xs p-1 rounded-md truncate ${eventColors[event.type]}`}>
              {event.type}: {event.title}
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
                    <Label htmlFor="date">Date</Label>
                    <DatePicker date={newEventDate} setDate={setNewEventDate} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={newEventType} onValueChange={(value) => setNewEventType(value as Event['type'])}>
                      <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Study">Study</SelectItem>
                          <SelectItem value="HW">HW</SelectItem>
                          <SelectItem value="Test">Test</SelectItem>
                      </SelectContent>
                  </Select>
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

