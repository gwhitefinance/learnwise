
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Event = {
  id: number;
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
};

const classicalPlaylist = [
    "https://cdn.pixabay.com/audio/2024/05/25/audio_24944d1835.mp3", // Emotional Cinematic Music
    "https://cdn.pixabay.com/audio/2024/05/09/audio_2ef13b0649.mp3", // Cinematic Epic
    "https://cdn.pixabay.com/audio/2023/10/11/audio_a2f2670758.mp3", // Hans Zimmer Style
    "https://cdn.pixabay.com/audio/2022/11/17/audio_88f002b12e.mp3", // Inspiring Cinematic
    "https://cdn.pixabay.com/audio/2024/02/08/audio_17316a1c89.mp3", // The Last Piano
];

const eventTypes = {
    'Test': 'bg-red-500',
    'Homework': 'bg-blue-500',
    'Quiz': 'bg-yellow-500',
    'Project': 'bg-purple-500',
    'Event': 'bg-green-500',
};


export default function CalendarPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAIPopup, setShowAIPopup] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [learnerType, setLearnerType] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);


  useEffect(() => {
    setIsLoaded(true)
    const storedLearnerType = localStorage.getItem('learnerType');
    if (storedLearnerType) {
        setLearnerType(storedLearnerType);
    }
    
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
    }


    // Show AI popup after 3 seconds if there are no events
    if(events.length === 0) {
        const popupTimer = setTimeout(() => {
          setShowAIPopup(true)
        }, 3000)
        return () => clearTimeout(popupTimer)
    }
  }, [events.length])

  useEffect(() => {
    if (showAIPopup) {
      const baseText = "I see you don't have many meetings today. ";
      const suggestionText = learnerType
        ? `Shall I help you focus in a ${learnerType.toLowerCase()} way?`
        : "Shall I play some background music to help you get into your Flow State?";
      
      const text = baseText + suggestionText;
      let i = 0;
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
  }, [showAIPopup, learnerType])

  const [currentView, setCurrentView] = useState("week")
  const [currentMonth, setCurrentMonth] = useState("March 2025")
  const [currentDate, setCurrentDate] = useState("March 5")
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

  // Sample calendar days for the week view
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const weekDates = [3, 4, 5, 6, 7, 8, 9]
  const timeSlots = Array.from({ length: 9 }, (_, i) => i + 8) // 8 AM to 4 PM

  // Helper function to calculate event position and height
  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 8) * 80 // 80px per hour
    const height = (end - start) * 80
    return { top: `${top}px`, height: `${height}px` }
  }

  // Sample calendar for mini calendar
  const daysInMonth = 31
  const firstDayOffset = 5 // Friday is the first day of the month in this example
  const miniCalendarDays = Array.from({ length: daysInMonth + firstDayOffset }, (_, i) =>
    i < firstDayOffset ? null : i - firstDayOffset + 1,
  )

  const togglePlay = () => {
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // If not playing and no song is selected yet, pick a random one
            if (!audioRef.current.src) {
                const randomSong = classicalPlaylist[Math.floor(Math.random() * classicalPlaylist.length)];
                audioRef.current.src = randomSong;
            }
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }
  }
  
  const textClass = backgroundImage ? "text-white" : "text-black";
  const textMutedClass = backgroundImage ? "text-white/70" : "text-gray-500";
  const borderClass = backgroundImage ? "border-white/20" : "border-gray-200";
  const bgClass = backgroundImage ? "bg-white/10 backdrop-blur-sm" : "bg-white/50";
  const placeholderClass = backgroundImage ? "placeholder:text-white/70" : "placeholder:text-gray-400";


  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Audio Element */}
      <audio ref={audioRef} loop />

      {/* Background Image */}
      {backgroundImage ? (
        <Image
            src={backgroundImage}
            alt="Custom background"
            fill
            className="object-cover z-0"
        />
      ) : <div className="absolute inset-0 z-0 bg-white"></div>}


      {/* Navigation */}
      <header
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-center px-8 py-6 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${textMutedClass}`} />
            <input
              type="text"
              placeholder="Search"
              className={`rounded-full ${bgClass} pl-10 pr-4 py-2 ${textClass} ${placeholderClass} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-white/30`}
            />
          </div>
          <Settings className={`h-6 w-6 ${textClass} drop-shadow-md`} />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBackgroundImageUpload}
            className="hidden"
            accept="image/*"
          />
          <button onClick={triggerFileUpload} className={`p-2 rounded-full hover:bg-white/20 ${textClass}`}>
            <Upload className="h-5 w-5" />
          </button>
           {backgroundImage && (
                <button onClick={clearBackgroundImage} className={`p-2 rounded-full hover:bg-white/20 ${textClass}`}>
                    <Trash className="h-5 w-5" />
                </button>
            )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative h-screen w-full pt-20 flex">
        {/* Sidebar */}
        <div
          className={`w-64 h-full ${bgClass} p-4 shadow-xl border-r ${borderClass} rounded-tr-3xl opacity-0 ${isLoaded ? "animate-fade-in" : ""} flex flex-col justify-between`}
          style={{ animationDelay: "0.4s" }}
        >
          <div>
            <button className="mb-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-white w-full">
              <Plus className="h-5 w-5" />
              <span>Create</span>
            </button>

            {/* Mini Calendar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${textClass} font-medium`}>{currentMonth}</h3>
                <div className="flex gap-1">
                  <button className="p-1 rounded-full hover:bg-white/20">
                    <ChevronLeft className={`h-4 w-4 ${textClass}`} />
                  </button>
                  <button className="p-1 rounded-full hover:bg-white/20">
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

                {miniCalendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                      day === 5 ? "bg-blue-500 text-white" : `${textClass} hover:bg-white/20`
                    } ${!day ? "invisible" : ""}`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Event Type Legend */}
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

          {/* New position for the big plus button */}
          <button className="mt-6 flex items-center justify-center gap-2 rounded-full bg-blue-500 p-4 text-white w-14 h-14 self-start">
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Calendar View */}
        <div
          className={`flex-1 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          {/* Calendar Controls */}
          <div className={`flex items-center justify-between p-4 border-b ${borderClass}`}>
            <div className="flex items-center gap-4">
              <Button variant="outline" className={`px-4 py-2 ${textClass} rounded-md`}>Today</Button>
              <div className="flex">
                <button className={`p-2 ${textClass} hover:bg-white/10 rounded-l-md`}>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className={`p-2 ${textClass} hover:bg-white/10 rounded-r-md`}>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <h2 className={`text-xl font-semibold ${textClass}`}>{currentDate}</h2>
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

          {/* Week View */}
          <div className="flex-1 overflow-auto p-4">
            <div className={`${bgClass} rounded-xl border ${borderClass} shadow-xl h-full`}>
              {/* Week Header */}
              <div className={`grid grid-cols-8 border-b ${borderClass}`}>
                <div className={`p-2 text-center ${textMutedClass} text-xs`}></div>
                {weekDays.map((day, i) => (
                  <div key={i} className={`p-2 text-center border-l ${borderClass}`}>
                    <div className={`text-xs ${textMutedClass} font-medium`}>{day}</div>
                    <div
                      className={`text-lg font-medium mt-1 ${textClass} ${weekDates[i] === 5 ? "bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}`}
                    >
                      {weekDates[i]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <div className="grid grid-cols-8">
                {/* Time Labels */}
                <div className={`${textMutedClass}`}>
                  {timeSlots.map((time, i) => (
                    <div key={i} className={`h-20 border-b ${borderClass} pr-2 text-right text-xs flex items-center justify-end`}>
                      {time > 12 ? `${time - 12} PM` : `${time} AM`}
                    </div>
                  ))}
                </div>

                {/* Days Columns */}
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div key={dayIndex} className={`border-l ${borderClass} relative`}>
                    {timeSlots.map((_, timeIndex) => (
                      <div key={timeIndex} className={`h-20 border-b ${borderClass}`}></div>
                    ))}

                    {/* Events */}
                    {events
                      .filter((event) => event.day === dayIndex + 1)
                      .map((event, i) => {
                        const eventStyle = calculateEventStyle(event.startTime, event.endTime)
                        return (
                          <div
                            key={i}
                            className={`absolute ${event.color} rounded-md p-2 text-white text-xs shadow-md cursor-pointer transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg`}
                            style={{
                              ...eventStyle,
                              left: "4px",
                              right: "4px",
                            }}
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="opacity-80 text-[10px] mt-1">{`${event.startTime} - ${event.endTime}`}</div>
                          </div>
                        )
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Popup */}
        <AnimatePresence>
        {showAIPopup && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-8 right-8 z-20"
          >
            <div className="w-[450px] relative bg-gradient-to-br from-blue-400/30 via-blue-500/30 to-blue-600/30 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-blue-300/30 text-white">
              <button
                onClick={() => setShowAIPopup(false)}
                className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-blue-300" />
                </div>
                <div className="min-h-[80px]">
                  <p className="text-base font-light">{typedText}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={togglePlay}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowAIPopup(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors font-medium"
                >
                  No
                </button>
              </div>
              {isPlaying && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-white text-sm hover:bg-white/20 transition-colors"
                    onClick={togglePlay}
                  >
                    <Pause className="h-4 w-4" />
                    <span>Pause Music</span>
                  </button>
                </div>
              )}
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
              className={cn(`${selectedEvent.color}`, "p-6 rounded-lg shadow-xl max-w-md w-full mx-4")}
            >
              <h3 className="text-2xl font-bold mb-4 text-white">{selectedEvent.title}</h3>
              <div className="space-y-3 text-white">
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
                  {`${weekDays[selectedEvent.day - 1]}, ${weekDates[selectedEvent.day - 1]} ${currentMonth}`}
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
              </div>
              <div className="mt-6 flex justify-end">
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

    