
'use client';

import React, { createContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { studyPlannerFlow, generateSpeechFlow, generateProblemSolvingSession } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, query, where } from 'firebase/firestore';

export type CallParticipant = {
    uid: string;
    displayName: string;
    photoURL?: string;
    status?: 'Ringing' | 'In Call' | 'Online';
};

interface Message {
  role: 'user' | 'ai';
  content: string;
}

type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  startTime: string;
  type: 'Test' | 'Homework' | 'Quiz' | 'Event' | 'Project';
  description: string;
};

type Course = {
    id: string;
    name: string;
    description: string;
};

export type ProblemSolvingSession = {
    exampleProblem: string;
    stepByStepSolution: string[];
    practiceProblem: {
        question: string;
        answer: string;
    };
};

interface CallContextType {
  isInCall: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isMinimized: boolean;
  participants: CallParticipant[];
  localParticipant: CallParticipant | null;
  incomingCall: CallParticipant | null;
  isTutorinListening: boolean;
  isTutorinSpeaking: boolean;
  tutorScreenContent: ProblemSolvingSession | null;
  showTutorScreen: boolean;
  startCall: (participants: CallParticipant[]) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleMinimize: () => void;
  ringParticipant: (uid: string) => void;
  answerCall: () => void;
  declineCall: () => void;
  setShowTutorScreen: (show: boolean) => void;
}

export const CallContext = createContext<CallContextType>({
  isInCall: false,
  isMuted: false,
  isCameraOff: true,
  isMinimized: false,
  participants: [],
  localParticipant: null,
  incomingCall: null,
  isTutorinListening: false,
  isTutorinSpeaking: false,
  tutorScreenContent: null,
  showTutorScreen: false,
  startCall: () => {},
  endCall: () => {},
  toggleMute: () => {},
  toggleCamera: () => {},
  toggleMinimize: () => {},
  ringParticipant: () => {},
  answerCall: () => {},
  declineCall: () => {},
  setShowTutorScreen: () => {},
});

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const [user] = useAuthState(auth);
  const { toast } = useToast();

  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<CallParticipant | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallParticipant | null>(null);
  
  const [isTutorinListening, setIsTutorinListening] = useState(false);
  const [isTutorinSpeaking, setIsTutorinSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // New state for the Tutor Screen
  const [tutorScreenContent, setTutorScreenContent] = useState<ProblemSolvingSession | null>(null);
  const [showTutorScreen, setShowTutorScreen] = useState(false);

  const speak = useCallback(async (text: string) => {
    if (!text) return;
    setIsTutorinSpeaking(true);
    try {
        const { audioUrl } = await generateSpeechFlow({ text });
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audioRef.current = audio;
            audio.play();
            audio.onended = () => {
                setIsTutorinSpeaking(false);
            };
        } else {
             setIsTutorinSpeaking(false);
        }
    } catch (error) {
        console.error("Error generating or playing speech:", error);
        toast({ variant: 'destructive', title: 'Could not play audio response.' });
        setIsTutorinSpeaking(false);
    }
  }, [toast]);


  const startCall = useCallback((callParticipants: CallParticipant[]) => {
    if (!user) return;
    
    setLocalParticipant({
        uid: user.uid,
        displayName: user.displayName || 'You',
        photoURL: user.photoURL || undefined,
        status: 'In Call',
    });

    const isTutorinInCall = callParticipants.some(p => p.uid === 'tutorin-ai');

    const remoteParticipants = callParticipants
        .filter(p => p.uid !== user.uid)
        .map(p => ({ ...p, status: p.uid === 'tutorin-ai' ? 'In Call' : 'Online' }));

    setParticipants(remoteParticipants);
    
    setIsInCall(true);
    setIsMinimized(false);
    setIsCameraOff(false);
    setIsMuted(false);

    if (isTutorinInCall) {
        const initialGreeting = `Hello, ${user.displayName?.split(' ')[0] || 'there'}! Let's start Tutorin'.`;
        const initialMessages = [{ role: 'ai', content: initialGreeting }];
        setConversationHistory(initialMessages);
        speak(initialGreeting);
    }
  }, [user, speak]);

  const ringParticipant = useCallback((uid: string) => {
    setParticipants(prev => prev.map(p => p.uid === uid ? { ...p, status: 'Ringing' } : p));
    
    if (localParticipant) {
         window.dispatchEvent(new CustomEvent('incoming-call-simulation', {
            detail: { caller: localParticipant, recipientId: uid }
        }));
    }
  }, [localParticipant]);

  const endCall = useCallback(() => {
    setIsInCall(false);
    setParticipants([]);
    setLocalParticipant(null);
    setShowTutorScreen(false);
    setTutorScreenContent(null);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
    }
    setIsTutorinSpeaking(false);
  }, []);
  
  const answerCall = () => {
    if (!incomingCall || !user) return;
    
    setIsInCall(true);
    setParticipants(prev => {
        if (prev.some(p => p.uid === incomingCall.uid)) {
            return prev.map(p => p.uid === incomingCall.uid ? {...p, status: 'In Call'} : p);
        }
        return [...prev, {...incomingCall, status: 'In Call'}];
    }); 
    setLocalParticipant({
        uid: user.uid,
        displayName: user.displayName || 'You',
        photoURL: user.photoURL || undefined,
        status: 'In Call'
    });
    setIncomingCall(null);
  };
  
  const declineCall = () => {
      setIncomingCall(null);
  };

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    setIsCameraOff(prev => !prev);
  }, []);


  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);
  
  const processUserSpeech = async (transcript: string) => {
    if (!transcript.trim() || !user) return;

    const userMessage: Message = { role: 'user', content: transcript };
    const newHistory = [...conversationHistory, userMessage];
    setConversationHistory(newHistory);

    try {
        const qCourses = query(collection(db, "courses"), where("userId", "==", user.uid));
        const coursesSnapshot = await getDocs(qCourses);
        const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        
        const qEvents = query(collection(db, "calendarEvents"), where("userId", "==", user.uid));
        const eventsSnapshot = await getDocs(qEvents);
        const calendarEvents = eventsSnapshot.docs.map(doc => doc.data() as CalendarEvent);

        const learnerType = localStorage.getItem('learnerType');
        const aiBuddyName = localStorage.getItem('aiBuddyName');
        
        const response = await studyPlannerFlow({
            userName: user?.displayName?.split(' ')[0],
            aiBuddyName: aiBuddyName || undefined,
            history: newHistory,
            allCourses: courses,
            calendarEvents,
            learnerType: learnerType || undefined,
        });

        if (response.tool_code && response.tool_code.includes('startProblemSolving')) {
            const topicMatch = response.tool_code.match(/topic='([^']+)'/);
            if (topicMatch) {
                const topic = topicMatch[1];
                const problemSession = await generateProblemSolvingSession({ topic });
                setTutorScreenContent(problemSession);
                setShowTutorScreen(true);
            }
        }
        
        if (response.response) {
            const aiMessage: Message = { role: 'ai', content: response.response };
            setConversationHistory([...newHistory, aiMessage]);
            speak(response.response);
        }

    } catch (error) {
        console.error("AI chat error in call:", error);
        const errorMessage = "Sorry, I had trouble understanding that. Could you say it again?";
        setConversationHistory(newHistory); // Revert history
        speak(errorMessage);
    }
  };
  
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if(isInCall && participants.some(p => p.uid === 'tutorin-ai')) {
          toast({ variant: 'destructive', title: 'Voice input not supported in this browser.' });
      }
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsTutorinListening(true);
    recognition.onend = () => setIsTutorinListening(false);
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast({ variant: 'destructive', title: 'Voice recognition error.' });
      }
      setIsTutorinListening(false);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processUserSpeech(transcript);
    };
    
    recognitionRef.current = recognition;

  }, [isInCall, participants, user, toast, processUserSpeech]);
  
  useEffect(() => {
      if (isInCall && !isMuted && !isTutorinSpeaking && !isTutorinListening) {
          const startListeningTimeout = setTimeout(() => {
            recognitionRef.current?.start();
          }, 500); 
          return () => clearTimeout(startListeningTimeout);
      } else if ((isMuted || isTutorinSpeaking || isTutorinListening) && recognitionRef.current?.recognizing) {
          recognitionRef.current.stop();
      }
  }, [isInCall, isMuted, isTutorinSpeaking, isTutorinListening]);


  useEffect(() => {
    const handleIncomingCall = (event: any) => {
        if (!user || event.detail.caller.uid === user.uid || event.detail.recipientId !== user.uid) {
            return;
        }

        if (!isInCall) {
           setIncomingCall(event.detail.caller);
        }
    };
    window.addEventListener('incoming-call-simulation', handleIncomingCall);
    return () => window.removeEventListener('incoming-call-simulation', handleIncomingCall);
  }, [isInCall, user]);

  return (
    <CallContext.Provider value={{
      isInCall,
      isMuted,
      isCameraOff,
      isMinimized,
      participants,
      localParticipant,
      incomingCall,
      isTutorinListening,
      isTutorinSpeaking,
      tutorScreenContent,
      showTutorScreen,
      startCall,
      endCall,
      toggleMute,
      toggleCamera,
      toggleMinimize,
      ringParticipant,
      answerCall,
      declineCall,
      setShowTutorScreen,
    }}>
      {children}
    </CallContext.Provider>
  );
};
