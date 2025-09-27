
'use server';

import { addXp as addXpAdmin } from './firebase-admin';

// All AI flow imports are centralized here
import { generateQuiz } from '@/ai/flows/quiz-flow';
import { generateExplanation } from '@/ai/flows/quiz-explanation-flow';
import { generateCourseFromUrl } from '@/ai/flows/course-from-url-flow';
import { generateSummary } from '@/ai/flows/note-summary-flow';
import { generateFlashcardsFromNote } from '@/ai/flows/note-to-flashcard-flow';
import { generateQuizFromNote } from '@/ai/flows/note-to-quiz-flow';
import { generateMiniCourse } from '@/ai/flows/mini-course-flow';
import { generateQuizFromModule } from '@/ai/flows/module-quiz-flow';
import { generateFlashcardsFromModule } from '@/ai/flows/module-flashcard-flow';
import { generateTutoringSession } from '@/ai/flows/image-tutoring-flow';
import { generateAudio } from '@/ai/flows/text-to-speech-flow';
import { studyPlannerFlow } from '@/ai/flows/study-planner-flow';
import { generateChatTitle } from '@/ai/flows/chat-title-flow';
import { generateRoadmap } from '@/ai/flows/roadmap-flow';
import { generateTutorResponse } from '@/ai/flows/tutor-chat-flow';
import { generateOnboardingCourse } from '@/ai/flows/onboarding-course-flow';
import { generateChapterContent } from '@/ai/flows/chapter-content-flow';
import { analyzeImage } from '@/ai/flows/image-analysis-flow';
import { generateNoteFromChat } from '@/ai/flows/chat-to-note-flow';
import { generateMidtermExam } from '@/ai/flows/midterm-exam-flow';


// Re-exporting all AI functions as Server Actions
export { 
    generateQuiz as generateQuizAction,
    generateExplanation,
    generateCourseFromUrl,
    generateSummary,
    generateFlashcardsFromNote,
    generateQuizFromNote,
    generateMiniCourse,
    generateQuizFromModule,
    generateFlashcardsFromModule,
    generateTutoringSession,
    generateAudio,
    studyPlannerFlow,
    generateChatTitle,
    generateRoadmap,
    generateTutorResponse,
    generateOnboardingCourse,
    generateChapterContent,
    analyzeImage,
    generateNoteFromChat,
    generateMidtermExam
};

export async function addXp(userId: string, xp: number) {
    try {
        const result = await addXpAdmin(userId, xp);
        return result;
    } catch(e) {
        console.error("Action error adding XP:", e);
        // This will be caught by the client-side try/catch block
        throw new Error("Failed to update XP on the server.");
    }
}
