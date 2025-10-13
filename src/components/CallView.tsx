

'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mic, MicOff, Video, VideoOff, Minimize2, Maximize2, PhoneOff, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CallContext, CallParticipant } from '@/context/CallContext';
import { cn } from '@/lib/utils';
import Draggable from 'react-draggable';

const ParticipantVideo = ({ participant, isLocalUser, videoRef, isCameraOn, onRing }: { participant: CallParticipant, isLocalUser: boolean, videoRef?: React.RefObject<HTMLVideoElement>, isCameraOn?: boolean, onRing?: (uid: string) => void }) => (
    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center border">
        {isLocalUser ? (
             <div className="w-full h-full bg-black flex items-center justify-center">
                <video ref={videoRef} className={cn("w-full h-full object-cover", !isCameraOn && "hidden")} autoPlay muted playsInline />
                 {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <User className="h-20 w-20 text-muted-foreground" />
                    </div>
                )}
             </div>
        ) : (
             <Avatar className="h-20 w-20">
                <AvatarImage src={participant.photoURL} />
                <AvatarFallback>{participant.displayName?.[0]}</AvatarFallback>
            </Avatar>
        )}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
            {participant.displayName} {isLocalUser && "(You)"}
        </div>
        {participant.status && participant.status !== 'Online' && !isLocalUser && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <p className="text-white font-semibold animate-pulse">{participant.status}...</p>
            </div>
        )}
        {!isLocalUser && participant.status === 'Online' && onRing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button onClick={() => onRing(participant.uid)} size="lg" className="rounded-full h-16 w-16 bg-green-500 hover:bg-green-600">
                    <Phone className="h-8 w-8" />
                </Button>
            </div>
        )}
    </div>
);


export default function CallView() {
    const {
        isInCall,
        isMuted,
        isCameraOff,
        isMinimized,
        participants,
        localParticipant,
        toggleMute,
        toggleCamera,
        endCall,
        toggleMinimize,
        ringParticipant,
    } = useContext(CallContext);
    
    const nodeRef = React.useRef(null);
    const videoRef = useRef<HTMLVideoElement>(null);

     useEffect(() => {
        if (isInCall && !isCameraOff) {
            const getCameraStream = async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: !isMuted });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    toggleCamera(); 
                }
            };
            getCameraStream();
        } else if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }, [isInCall, isCameraOff, toggleCamera, isMuted]);

    return (
        <AnimatePresence>
            {isInCall && (
                <Draggable nodeRef={nodeRef} handle=".drag-handle" disabled={!isMinimized}>
                    <motion.div
                        ref={nodeRef}
                        initial={isMinimized ? { opacity: 0, scale: 0.8, y: 50, x: 50 } : { opacity: 0 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className={cn(
                            "fixed z-[100] bg-background/80 backdrop-blur-lg border rounded-2xl shadow-2xl flex flex-col",
                            isMinimized 
                                ? "bottom-4 right-4 w-80 h-auto cursor-grab" 
                                : "inset-4"
                        )}
                    >
                        <div className={cn("flex-1 p-4 flex flex-col", isMinimized ? 'min-h-[10rem]' : '')}>
                            <div className={cn("flex justify-between items-center mb-4 drag-handle", isMinimized && "cursor-grab")}>
                                <h3 className="font-semibold">{isMinimized ? 'Ongoing Call' : 'Learning Squad Call'}</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMinimize}>
                                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                                </Button>
                            </div>

                            <div className={cn(
                                "flex-1 grid gap-4",
                                isMinimized ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            )}>
                                {localParticipant && <ParticipantVideo participant={localParticipant} isLocalUser={true} videoRef={videoRef} isCameraOn={!isCameraOff} />}
                                {participants.map(p => (
                                    <ParticipantVideo key={p.uid} participant={p} isLocalUser={false} onRing={ringParticipant} />
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-background/50 border-t flex justify-center gap-4">
                            <Button variant={isMuted ? 'secondary' : 'default'} size="icon" onClick={toggleMute} className="rounded-full h-12 w-12">
                                {isMuted ? <MicOff /> : <Mic />}
                            </Button>
                            <Button variant={isCameraOff ? 'secondary' : 'default'} size="icon" onClick={toggleCamera} className="rounded-full h-12 w-12">
                                {isCameraOff ? <VideoOff /> : <Video />}
                            </Button>
                            <Button variant="destructive" size="icon" onClick={endCall} className="rounded-full h-12 w-12">
                                <PhoneOff />
                            </Button>
                        </div>
                    </motion.div>
                </Draggable>
            )}
        </AnimatePresence>
    );
}
