
'use client';

import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export type CallParticipant = {
    uid: string;
    displayName: string;
    photoURL?: string;
    status?: 'Ringing' | 'In Call' | 'Online';
};

interface CallContextType {
  isInCall: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isMinimized: boolean;
  participants: CallParticipant[];
  localParticipant: CallParticipant | null;
  incomingCall: CallParticipant | null;
  startCall: (participants: CallParticipant[]) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleMinimize: () => void;
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
  startCall: () => {},
  endCall: () => {},
  toggleMute: () => {},
  toggleCamera: () => {},
  toggleMinimize: () => {},
  ringParticipant: () => {},
  answerCall: () => {},
  declineCall: () => {},
});

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const [user] = useAuthState(auth);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<CallParticipant | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallParticipant | null>(null);


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
        .map(p => {
            const isAI = p.uid === 'tutorin-ai';
            return { ...p, status: isAI ? 'In Call' : 'Online' } as CallParticipant;
        });

    setParticipants(remoteParticipants);
    
    setIsInCall(true);
    setIsMinimized(false);
    setIsCameraOff(false); // Default to camera on when starting a call
    setIsMuted(false);

    if (isTutorinInCall && 'speechSynthesis' in window) {
      const greeting = `Hello, ${user.displayName?.split(' ')[0] || 'there'}! Let's start Tutorin'.`;
      const utterance = new SpeechSynthesisUtterance(greeting);
      
      const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.name.includes('Google') && voice.lang.startsWith('en-US'));
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        window.speechSynthesis.speak(utterance);
      };
      
      if(window.speechSynthesis.getVoices().length > 0) {
        setVoice();
      } else {
        window.speechSynthesis.onvoiceschanged = setVoice;
      }
    }

  }, [user]);

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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
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
      startCall,
      endCall,
      toggleMute,
      toggleCamera,
      toggleMinimize,
      ringParticipant,
      answerCall,
      declineCall,
    }}>
      {children}
    </CallContext.Provider>
  );
};
