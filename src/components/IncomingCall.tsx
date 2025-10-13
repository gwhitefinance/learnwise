

'use client';

import { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, User } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { CallContext } from '@/context/CallContext';

export default function IncomingCall() {
    const { incomingCall, answerCall, declineCall } = useContext(CallContext);

    return (
        <AnimatePresence>
            {incomingCall && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-4 right-4 z-[200] w-full max-w-sm"
                >
                    <div className="bg-background/80 backdrop-blur-md border rounded-xl shadow-lg p-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={incomingCall.photoURL} />
                                <AvatarFallback>{incomingCall.displayName?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold">{incomingCall.displayName}</p>
                                <p className="text-sm text-muted-foreground animate-pulse">Incoming call...</p>
                            </div>
                            <div className="flex gap-2">
                                 <Button size="icon" className="rounded-full h-12 w-12 bg-red-500 hover:bg-red-600" onClick={declineCall}>
                                    <PhoneOff className="h-6 w-6"/>
                                </Button>
                                <Button size="icon" className="rounded-full h-12 w-12 bg-green-500 hover:bg-green-600" onClick={answerCall}>
                                    <Phone className="h-6 w-6"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
