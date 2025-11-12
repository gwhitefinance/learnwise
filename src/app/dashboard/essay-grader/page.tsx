
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Underline, List, ListOrdered, Undo, Redo, X, Printer, ImageIcon, Link as LinkIcon, Minus, Plus, Sparkles as SparklesIcon, Pen, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateEssay, generateEssayGrade } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type GradeResult = {
    overallScore: number;
    feedback: {
        criteria: string;
        score: number;
    }[];
    suggestions: {
        title: string;
        originalText: string;
        suggestedRewrite: string;
    }[];
};


const EditorToolbar = ({ onCommand }: { onCommand: (command: string, value?: string) => void; }) => {
    
    return (
    <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 text-gray-600">
        <Button variant="ghost" size="sm">Insert</Button>
        <Button variant="ghost" size="sm" onClick={() => window.print()}>Print</Button>
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        <Button variant="ghost" size="icon" onClick={() => onCommand('decreaseFontSize')} className="w-8 h-8"><Minus size={16} /></Button>
        <Input type="text" defaultValue="16" className="w-10 h-8 text-center p-0 border-gray-300 bg-transparent" onBlur={(e) => onCommand('fontSize', e.target.value)}/>
        <Button variant="ghost" size="icon" onClick={() => onCommand('increaseFontSize')} className="w-8 h-8"><Plus size={16} /></Button>
        <select onChange={(e) => onCommand('fontName', e.target.value)} className="flex items-center gap-1 px-2 py-1.5 rounded bg-transparent text-sm border-none focus:ring-0 appearance-none hover:bg-gray-100 w-24">
            <option>Arial</option>
            <option>Georgia</option>
            <option>Poppins</option>
        </select>
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        <Button variant="ghost" size="icon" onClick={() => onCommand('bold')} className="w-8 h-8"><Bold size={16} /></Button>
        <Button variant="ghost" size="icon" onClick={() => onCommand('italic')} className="w-8 h-8"><Italic size={16} /></Button>
        <Button variant="ghost" size="icon" onClick={() => onCommand('underline')} className="w-8 h-8"><Underline size={16} /></Button>
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        <Button variant="ghost" size="icon" onClick={() => onCommand('insertUnorderedList')} className="w-8 h-8"><List size={16} /></Button>
        <Button variant="ghost" size="icon" onClick={() => onCommand('insertOrderedList')} className="w-8 h-8"><ListOrdered size={16} /></Button>
    </div>
)};

const GradingSidebar = ({ onGrade, isGrading }: { onGrade: (rubric: string, level: string) => void, isGrading: boolean }) => {
    const [selectedRubric, setSelectedRubric] = useState<string>('Standard Essay Rubric');
    const [selectedLevel, setSelectedLevel] = useState<string>('High School');

    const handleGradeClick = () => {
        onGrade(selectedRubric, selectedLevel);
    };

    return (
        <aside className="w-96 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col p-6">
            <div className="text-center">
                <h2 className="text-xl font-bold">Essay Grading</h2>
                <p className="text-sm text-muted-foreground mt-1">Grade your paper and automatically see suggestions and feedback from Taz!</p>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold">Step 1: Select a Rubric</h3>
                <p className="text-sm text-muted-foreground mb-4">This is the rubric that will be used to grade your paper</p>
                <div className="grid grid-cols-3 gap-2">
                    {['Research Paper', 'Argumentative Paper', 'Informative Paper'].map(rubric => (
                        <Button 
                            key={rubric} 
                            variant={selectedRubric === rubric ? "default" : "outline"} 
                            className="h-auto text-xs py-2 whitespace-normal"
                            onClick={() => setSelectedRubric(rubric)}
                        >
                            {rubric} Rubric
                        </Button>
                    ))}
                </div>
                 <div className="flex items-center gap-2 my-4">
                    <div className="flex-grow border-t"></div>
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-grow border-t"></div>
                </div>
                <Button variant="outline" className="w-full">Custom Rubric</Button>
            </div>

             <div className="mt-8">
                <h3 className="text-lg font-semibold">Step 2: Select a Skill Level</h3>
                <p className="text-sm text-muted-foreground mb-4">The skill level you want your paper to be graded at, this will determine how rigorous the grading and critiques are.</p>
                <div className="grid grid-cols-3 gap-2">
                    {['Post-Grad', 'High School', 'College'].map(level => (
                        <Button 
                            key={level} 
                            variant={selectedLevel === level ? "default" : "outline"}
                            onClick={() => setSelectedLevel(level)}
                        >
                            {level}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="mt-auto">
                 <Button className="w-full" size="lg" onClick={handleGradeClick} disabled={isGrading}>
                    {isGrading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Grade Paper
                 </Button>
            </div>
        </aside>
    );
};

export default function EssayGraderPage() {
    const editorRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGrading, setIsGrading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [generationParams, setGenerationParams] = useState({
        topic: '',
        gradeLevel: '',
        rubric: ''
    });
    const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);

    const handleCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleGenerateEssay = async () => {
        if (!generationParams.topic || !generationParams.gradeLevel) {
            toast({ variant: 'destructive', title: 'Please fill out all required fields.' });
            return;
        }

        setIsGenerating(true);
        setIsDialogOpen(false);
        toast({ title: 'Generating your essay...', description: 'This may take a moment.' });
        try {
            const result = await generateEssay(generationParams);
            if (editorRef.current) {
                // Using innerHTML to preserve paragraphs
                editorRef.current.innerHTML = result.essay.replace(/\n/g, '<br>');
            }
        } catch (error) {
            console.error("Essay generation failed:", error);
            toast({ variant: 'destructive', title: 'Generation Failed' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGradePaper = async (rubric: string, level: string) => {
        const essayContent = editorRef.current?.innerText || '';
        if (!essayContent.trim()) {
            toast({ variant: 'destructive', title: 'Cannot grade an empty essay.' });
            return;
        }
        setIsGrading(true);
        try {
            const result = await generateEssayGrade({
                essay: essayContent,
                rubric: rubric,
                gradeLevel: level,
            });
            setGradeResult(result);
        } catch(error) {
            console.error("Grading failed:", error);
            toast({ variant: 'destructive', title: 'Grading Failed', description: 'Could not get a grade for this essay.' });
        } finally {
            setIsGrading(false);
        }
    };
    
    if (gradeResult) {
        return (
            <div className="flex h-screen overflow-hidden bg-gray-50">
                 <main className="flex-1 flex flex-col p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold">Results</h2>
                            <p className="text-muted-foreground">Here are the results from your essay grading!</p>
                        </div>
                         <Button onClick={() => setGradeResult(null)}>
                            <RefreshCw className="mr-2 h-4 w-4"/> Regrade
                        </Button>
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Overall Score</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center">
                                <div className="relative w-40 h-40">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path
                                            className="text-muted"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        />
                                        <path
                                            className="text-primary"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeDasharray={`${gradeResult.overallScore}, 100`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            strokeLinecap="round"
                                            transform="rotate(-90 18 18)"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
                                        {gradeResult.overallScore}%
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                         <Card className="lg:col-span-2">
                             <CardHeader>
                                <CardTitle>Feedback from Taz</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {gradeResult.feedback.map(item => (
                                    <div key={item.criteria}>
                                        <div className="flex justify-between items-center text-sm">
                                            <p className="font-medium">{item.criteria}</p>
                                            <p className="text-muted-foreground">{item.score}%</p>
                                        </div>
                                        <Progress value={item.score} className="h-2 mt-1" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </main>
                 <aside className="w-96 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-xl font-bold">Suggestions</h2>
                         <Button variant="ghost" onClick={() => setGradeResult(null)}><X className="h-4 w-4 mr-2"/> Close</Button>
                    </div>
                    <div className="space-y-6">
                        {gradeResult.suggestions.map(suggestion => (
                            <div key={suggestion.title}>
                                <h4 className="font-semibold text-primary">{suggestion.title}</h4>
                                <div className="mt-2 p-3 bg-red-500/10 rounded-lg text-sm">
                                    <p className="line-through text-red-700/80">{suggestion.originalText}</p>
                                </div>
                                <div className="mt-2 p-3 bg-green-500/10 rounded-lg text-sm">
                                    <p className="font-semibold text-green-800">Suggested Rewrite:</p>
                                    <p className="text-green-700/90">{suggestion.suggestedRewrite}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
             <main className="flex-1 flex flex-col p-6 overflow-y-auto">
                <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col">
                    <EditorToolbar onCommand={handleCommand} />
                    <div className="p-2">
                         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                 <Button variant="ghost" size="sm">
                                    <SparklesIcon className="mr-2 h-4 w-4" /> Start with an AI generation
                                </Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Generate an Essay</DialogTitle>
                                    <DialogDescription>Let AI kickstart your writing process. Just provide a few details.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="topic">What would you like your essay to be about?</Label>
                                        <Input id="topic" value={generationParams.topic} onChange={e => setGenerationParams(p => ({...p, topic: e.target.value}))}/>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="gradeLevel">What grade level should this be for?</Label>
                                        <Input id="gradeLevel" value={generationParams.gradeLevel} onChange={e => setGenerationParams(p => ({...p, gradeLevel: e.target.value}))} placeholder="e.g., 'High School', 'College Freshman'"/>
                                    </div>
                                     <div className="grid gap-2">
                                        <Label htmlFor="rubric">What rubric should it follow? (Optional)</Label>
                                        <Textarea id="rubric" value={generationParams.rubric} onChange={e => setGenerationParams(p => ({...p, rubric: e.target.value}))} placeholder="e.g., 'Focus on clarity, evidence, and a strong thesis statement.'"/>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleGenerateEssay} disabled={isGenerating}>
                                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                        Generate Essay
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                         <Button variant="ghost" size="sm">
                            <Pen className="mr-2 h-4 w-4" /> Write an Outline
                        </Button>
                    </div>
                     <div 
                         ref={editorRef}
                         contentEditable="true" 
                         className="relative flex-1 p-8 prose prose-lg max-w-none outline-none" 
                         suppressContentEditableWarning={true}
                     >
                     </div>
                </div>
            </main>
            <GradingSidebar onGrade={handleGradePaper} isGrading={isGrading} />
        </div>
    );
}
