
'use client';

import React, { createContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { studyPlannerFlow } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

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
  startCall: (participants: CallParticipant[]) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleMinimize: () => void;
  toggleTutorinListening: () => void;
  ringParticipant: (uid: string) => void;
  answerCall: () => void;
  declineCall: () => void;
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
  startCall: () => {},
  endCall: () => {},
  toggleMute: () => {},
  toggleCamera: () => {},
  toggleMinimize: () => {},
  toggleTutorinListening: () => {},
  ringParticipant: () => {},
  answerCall: () => {},
  declineCall: () => {},
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
  
  // New state for conversational AI
  const [isTutorinListening, setIsTutorinListening] = useState(false);
  const [isTutorinSpeaking, setIsTutorinSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const recognitionRef = useRef<any>(null);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsTutorinSpeaking(true);
    utterance.onend = () => setIsTutorinSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

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
    if (recognitionRef.current) recognitionRef.current.stop();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
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
    if (!transcript.trim()) return;

    const userMessage: Message = { role: 'user', content: transcript };
    const newHistory = [...conversationHistory, userMessage];
    setConversationHistory(newHistory);

    try {
        const response = await studyPlannerFlow({
            userName: user?.displayName?.split(' ')[0],
            history: newHistory,
        });
        const aiMessage: Message = { role: 'ai', content: response };
        setConversationHistory([...newHistory, aiMessage]);
        speak(response);
    } catch (error) {
        console.error("AI chat error in call:", error);
        const errorMessage = "Sorry, I had trouble understanding that. Could you say it again?";
        setConversationHistory(newHistory); // Revert history
        speak(errorMessage);
    }
  };


  const toggleTutorinListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isTutorinListening) {
      recognitionRef.current.stop();
    } else {
      if (isTutorinSpeaking) {
        window.speechSynthesis.cancel();
      }
      recognitionRef.current.start();
    }
  }, [isTutorinListening, isTutorinSpeaking]);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
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
      setIsTutorinListening(false);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processUserSpeech(transcript);
    };
    
    recognitionRef.current = recognition;

  }, [isInCall, participants, user, toast, speak]);

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
      startCall,
      endCall,
      toggleMute,
      toggleCamera,
      toggleMinimize,
      toggleTutorinListening,
      ringParticipant,
      answerCall,
      declineCall,
    }}>
      {children}
    </CallContext.Provider>
  );
};
