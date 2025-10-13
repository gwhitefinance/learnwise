
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
  startCall: (participants: CallParticipant[]) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleMinimize: () => void;
  ringParticipant: (uid: string) => void;
}

export const CallContext = createContext<CallContextType>({
  isInCall: false,
  isMuted: false,
  isCameraOff: true,
  isMinimized: false,
  participants: [],
  localParticipant: null,
  startCall: () => {},
  endCall: () => {},
  toggleMute: () => {},
  toggleCamera: () => {},
  toggleMinimize: () => {},
  ringParticipant: () => {},
});

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const [user] = useAuthState(auth);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<CallParticipant | null>(null);

  const startCall = useCallback((callParticipants: CallParticipant[]) => {
    if (!user) return;
    
    setLocalParticipant({
        uid: user.uid,
        displayName: user.displayName || 'You',
        photoURL: user.photoURL || undefined,
        status: 'In Call',
    });

    const remoteParticipants = callParticipants
        .filter(p => p.uid !== user.uid)
        .map(p => ({ ...p, status: 'Online' as const }));

    setParticipants(remoteParticipants);
    
    setIsInCall(true);
    setIsMinimized(false);
    setIsCameraOff(false);
    setIsMuted(false);

  }, [user]);

  const ringParticipant = useCallback((uid: string) => {
    setParticipants(prev => prev.map(p => p.uid === uid ? { ...p, status: 'Ringing' } : p));
    
    setTimeout(() => {
      setParticipants(prev => prev.map(p => p.uid === uid ? { ...p, status: 'In Call' } : p));
    }, 2000); // Simulate connection time
  }, []);

  const endCall = useCallback(() => {
    setIsInCall(false);
    setParticipants([]);
    setLocalParticipant(null);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    setIsCameraOff(prev => !prev);
  }, []);

  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  return (
    <CallContext.Provider value={{
      isInCall,
      isMuted,
      isCameraOff,
      isMinimized,
      participants,
      localParticipant,
      startCall,
      endCall,
      toggleMute,
      toggleCamera,
      toggleMinimize,
      ringParticipant
    }}>
      {children}
    </CallContext.Provider>
  );
};
