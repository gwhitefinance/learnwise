
'use server';

import { db } from './firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
    courseContext?: string;
    titleGenerated?: boolean;
    userId?: string;
    isPublic?: boolean;
}

interface FirestoreChatSession {
    title: string;
    messages: Message[];
    timestamp: Timestamp;
    courseContext?: string;
    titleGenerated?: boolean;
    userId?: string;
    isPublic?: boolean;
}


export async function getPublicChatSession(sessionId: string): Promise<ChatSession | null> {
    if (!db || !Object.keys(db).length) {
        console.warn('Firebase Admin SDK not initialized.');
        return null;
    }
    try {
        const docRef = db.collection('chatSessions').doc(sessionId);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data() as FirestoreChatSession;
            if (data.isPublic) {
                return {
                    id: docSnap.id,
                    ...data,
                    timestamp: data.timestamp.toMillis(),
                };
            }
        }
        return null;
    } catch (error) {
        console.error("Error fetching public chat session:", error);
        return null;
    }
}
