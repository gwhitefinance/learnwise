
'use client';

import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mic, MicOff, Video, VideoOff, Minimize2, Maximize2, PhoneOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CallContext, CallParticipant } from '@/context/CallContext';
import { cn } from '@/lib/utils';
import Draggable from 'react-draggable';

const ParticipantVideo = ({ participant }: { participant: CallParticipant }) => (
    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
        <Avatar className="h-20 w-20">
            <AvatarImage src={participant.photoURL} />
            <AvatarFallback>{participant.displayName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {participant.displayName}
        </div>
    </div>
);

export default function CallView() {
    const {
        isInCall,
        isMuted,
        isCameraOff,
        isMinimized,
        participants,
        toggleMute,
        toggleCamera,
        endCall,
        toggleMinimize
    } = useContext(CallContext);
    
    const nodeRef = React.useRef(null);

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
                                {participants.map(p => (
                                    <ParticipantVideo key={p.uid} participant={p} />
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
