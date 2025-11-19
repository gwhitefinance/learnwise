
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, BrainCircuit, List, Target } from 'lucide-react';
import Loading from './loading';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type KeyConcept = {
    term: string;
    definition: string;
};

type StudyPlanStep = {
    step: string;
    description: string;
};

type StudyGuide = {
    id: string;
    userId: string;
    courseId: string;
    title: string;
    summary: string;
    keyConcepts: KeyConcept[];
    studyPlan: StudyPlanStep[];
    createdAt: any;
};

export default function StudyGuidePage() {
    const params = useParams();
    const router = useRouter();
    const { guideId } = params;
    const [user, authLoading] = useAuthState(auth);
    const [guide, setGuide] = useState<StudyGuide | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) return;
        
        if (!user && !authLoading) {
            router.push('/login');
            return;
        }

        const fetchGuide = async () => {
            if (typeof guideId !== 'string') return;
            
            const docRef = doc(db, 'studyGuides', guideId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists() && docSnap.data().userId === user.uid) {
                setGuide({ id: docSnap.id, ...docSnap.data() } as StudyGuide);
            } else {
                router.push('/dashboard/courses'); // Or a 404 page
            }
            setLoading(false);
        };
        
        fetchGuide();
    }, [user, authLoading, guideId, router]);
    
    if (loading || authLoading) {
        return <Loading />;
    }

    if (!guide) {
        return <div>Study guide not found.</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
            <Button variant="ghost" onClick={() => router.push(`/dashboard/courses/${guide.courseId}`)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
            </Button>

            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">{guide.title}</h1>
                <p className="text-muted-foreground">{guide.summary}</p>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BrainCircuit /> Key Concepts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {guide.keyConcepts.map((concept, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger>{concept.term}</AccordionTrigger>
                                    <AccordionContent>
                                        {concept.definition}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><List /> Study Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {guide.studyPlan.map((step, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold">{index + 1}</div>
                                <div>
                                    <h4 className="font-semibold">{step.step}</h4>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

```