
'use server';

// All AI flow imports are centralized here
import { generateQuiz } from '@/ai/flows/quiz-flow';
import { generateExplanation } from '@/ai/flows/quiz-explanation-flow';
import { generateCourseFromUrl } from '@/ai/flows/course-from-url-flow';
import { generateFlashcardsFromNote } from '@/ai/flows/note-to-flashcard-flow';
import { generateQuizFromNote } from '@/ai/flows/note-to-quiz-flow';
import { generateMiniCourse } from '@/ai/flows/mini-course-flow';
import { generateQuizFromModule } from '@/ai/flows/module-quiz-flow';
import { generateFlashcardsFromModule } from '@/ai/flows/module-flashcard-flow';
import { generateTutoringSession } from '@/ai/flows/image-tutoring-flow';
import { studyPlannerFlow } from '@/ai/flows/study-planner-flow';
import { generateChatTitle } from '@/ai/flows/chat-title-flow';
import { generateRoadmap } from '@/ai/flows/roadmap-flow';
import { generateTutorResponse } from '@/ai/flows/tutor-chat-flow';
import { generateOnboardingCourse } from '@/ai/flows/onboarding-course-flow';
import { generateChapterContent } from '@/ai/flows/chapter-content-flow';
import { analyzeImage } from '@/ai/flows/image-analysis-flow';
import { generateNoteFromChat } from '@/ai/flows/chat-to-note-flow';
import { generateMidtermExam } from '@/ai/flows/midterm-exam-flow';
import { generateModuleContent } from '@/ai/flows/module-content-flow';
import { generatePodcastEpisode } from '@/ai/flows/podcast-flow';
import { startVideoGeneration } from '@/ai/flows/video-flow';
import { checkVideoOperation as checkVideoOperationFlow } from '@/ai/flows/video-flow';
import { generateSatQuestion } from '@/ai/flows/sat-question-flow';
import { generateInitialCourseAndRoadmap } from '@/ai/flows/initial-course-flow';
import { generateAudio } from '@/ai/flows/text-to-speech-flow';
import { generateMindfulnessExercise } from '@/ai/flows/mindfulness-flow';
import { generateConceptExplanation } from '@/ai/flows/concept-explanation-flow';
import { generateSatStudySessionAction } from '@/ai/flows/sat-study-session-flow';
import { generateFeedbackFlow as generateFeedbackAction } from '@/ai/flows/sat-feedback-flow';
import { generateHint } from '@/ai/flows/quiz-hint-flow';
import { enhanceExtracurricular } from '@/ai/flows/extracurricular-enhancer-flow';
import { generateCollegeDescription } from '@/ai/flows/college-description-flow';
import { generateCollegeChecklist } from '@/ai/flows/college-checklist-flow';
import { generateEssayFeedback } from '@/ai/flows/essay-coach-flow';
import { generateDailyFocus } from '@/ai/flows/daily-focus-flow';
import { generateTextTutoringSession } from '@/ai/flows/text-tutoring-flow';
import { enhanceDrawing } from '@/ai/flows/enhance-drawing-flow';


// This action was mistakenly removed in a previous step.
// It is not directly used by any UI component, but it's better to have a central place for AI actions.
async function generateSummary(input: { noteContent: string; }): Promise<{ summary: string; }> {
  // A real implementation would call an AI flow here.
  // For now, we'll return a simple summary.
  return { summary: `This is a summary of: ${input.noteContent.substring(0, 100)}...` };
}

export async function checkVideoOperation(operation: any) {
    return checkVideoOperationFlow(operation);
}

// Re-exporting all AI functions as Server Actions
export { 
    generateQuiz as generateQuizAction,
    generateExplanation,
    generateCourseFromUrl,
    generateFlashcardsFromNote,
    generateQuizFromNote,
    generateMiniCourse,
    generateQuizFromModule,
    generateFlashcardsFromModule,
    generateTutoringSession,
    studyPlannerFlow,
    generateChatTitle,
    generateRoadmap,
    generateTutorResponse,
    generateOnboardingCourse,
    generateChapterContent,
    analyzeImage,
    generateNoteFromChat,
    generateSummary,
    generateMidtermExam,
    generateModuleContent,
    generatePodcastEpisode,
    startVideoGeneration as generateVideo,
    generateSatQuestion,
    generateInitialCourseAndRoadmap,
    generateAudio,
    generateMindfulnessExercise,
    generateConceptExplanation,
    generateSatStudySessionAction,
    generateFeedbackAction,
    generateHint,
    enhanceExtracurricular,
    generateCollegeDescription,
    generateCollegeChecklist,
    generateEssayFeedback,
    generateDailyFocus,
    generateTextTutoringSession,
    enhanceDrawing,
};
