
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

    const remoteParticipants = callParticipants
        .filter(p => p.uid !== user.uid)
        .map(p => ({ ...p, status: 'Online' as const }));

    setParticipants(remoteParticipants);
    
    setIsInCall(true);
    setIsMinimized(false);
    setIsCameraOff(false); // Default to camera on when starting a call
    setIsMuted(false);

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
    setIsCameraOff(prev => {
        // If turning camera off, also stop the tracks.
        if (!prev === true) {
            // This logic will be inside the CallView component where videoRef exists.
            // For now, we just toggle the state.
        }
        return !prev;
    });
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
