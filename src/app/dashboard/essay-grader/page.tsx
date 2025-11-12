
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Underline, List, ListOrdered, Undo, Redo, X, Printer, ImageIcon, Link as LinkIcon, Minus, Plus, Sparkles as SparklesIcon, Pen
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateEssay } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


const EditorToolbar = ({ onCommand }: { onCommand: (command: string, value?: string) => void; }) => {
    
    return (
    <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 text-gray-600">
        <Button variant="ghost" size="sm">New</Button>
        <Button variant="ghost" size="sm">Insert</Button>
        <Button variant="ghost" size="sm">Print</Button>
        <div className="h-6 w-px bg-gray-300 mx-1"></div>
        <Button variant="ghost" size="icon" onClick={() => onCommand('decreaseFontSize')} className="w-8 h-8"><Minus size={16} /></Button>
        <Input type="text" defaultValue="16" className="w-10 h-8 text-center p-0 border-gray-300 bg-transparent" onBlur={(e) => onCommand('fontSize', e.target.value)}/>
        <Button variant="ghost" size="icon" onClick={() => onCommand('increaseFontSize')} className="w-8 h-8"><Plus size={16} /></Button>
        <select onChange={(e) => onCommand('fontName', e.target.value)} className="flex items-center gap-1 px-2 py-1.5 rounded bg-transparent text-sm border-none focus:ring-0 appearance-none hover:bg-gray-100 w-24">
            <option>Poppins</option>
            <option>Arial</option>
            <option>Georgia</option>
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

const GradingSidebar = () => {
    const [selectedRubric, setSelectedRubric] = useState<string | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

    return (
        <aside className="w-96 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col p-6">
            <div className="flex justify-end mb-4">
                <Link href="/dashboard/notes/new">
                    <Button variant="ghost">Close</Button>
                </Link>
            </div>
            <div className="text-center">
                <h2 className="text-xl font-bold">Essay Grading</h2>
                <p className="text-sm text-muted-foreground mt-1">Grade your paper and automatically see suggestions and feedback from Spark.E!</p>
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
                 <Button className="w-full" size="lg">Grade Paper</Button>
            </div>
        </aside>
    );
};

export default function EssayGraderPage() {
    const editorRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [generationParams, setGenerationParams] = useState({
        topic: '',
        gradeLevel: '',
        rubric: ''
    });

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
            <GradingSidebar />
        </div>
    );
}

// Dummy Pen icon for placeholder
const PenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    </svg>
);