
'use client';

import React, { createContext, useState, useCallback, ReactNode } from 'react';

export type CallParticipant = {
    uid: string;
    displayName: string;
    photoURL?: string;
};

interface CallContextType {
  isInCall: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isMinimized: boolean;
  participants: CallParticipant[];
  startCall: (participants: CallParticipant[]) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleMinimize: () => void;
}

export const CallContext = createContext<CallContextType>({
  isInCall: false,
  isMuted: false,
  isCameraOff: false,
  isMinimized: false,
  participants: [],
  startCall: () => {},
  endCall: () => {},
  toggleMute: () => {},
  toggleCamera: () => {},
  toggleMinimize: () => {},
});

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [participants, setParticipants] = useState<CallParticipant[]>([]);

  const startCall = useCallback((callParticipants: CallParticipant[]) => {
    setParticipants(callParticipants);
    setIsInCall(true);
    setIsMinimized(false);
  }, []);

  const endCall = useCallback(() => {
    setIsInCall(false);
    setParticipants([]);
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
      startCall,
      endCall,
      toggleMute,
      toggleCamera,
      toggleMinimize
    }}>
      {children}
    </CallContext.Provider>
  );
};
