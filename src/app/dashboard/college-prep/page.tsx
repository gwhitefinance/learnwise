
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Heart, Search, Filter, ArrowRight, MoreHorizontal, Check, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Loading from './loading';
import { allUSColleges } from '@/lib/colleges';
import Link from 'next/link';

type College = {
    id: string;
    name: string;
    location: string;
    isFavorited: boolean;
};

const mockChecklist = [
    { id: '1', task: 'Draft personal statement', completed: true },
    { id: '2', task: 'Request teacher recommendations', completed: true },
    { id: '3', task: 'Complete FAFSA', completed: false },
    { id: '4', task: 'Research 5 new scholarships', completed: false },
];

export default function CollegePrepPage() {
    const [gradeLevel, setGradeLevel] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [favoritedColleges, setFavoritedColleges] = useState<College[]>([
        { id: '133658', name: 'University of Florida', location: 'Gainesville, FL', isFavorited: true },
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<College[]>([]);

    useEffect(() => {
        const storedGrade = localStorage.getItem('onboardingGradeLevel');
        setGradeLevel(storedGrade);
        setLoading(false);
    }, []);
    
    useEffect(() => {
        if (searchTerm.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = allUSColleges
            .filter(college => college.name.toLowerCase().includes(lowerCaseSearchTerm))
            .slice(0, 10) // Limit to top 10 results for performance
            .map(college => ({
                ...college,
                isFavorited: favoritedColleges.some(fav => fav.id === college.id),
            }));
        
        setSearchResults(filtered);

    }, [searchTerm, favoritedColleges]);
    
    const toggleFavorite = (college: College) => {
        setFavoritedColleges(prev => {
            const isFavorited = prev.some(fav => fav.id === college.id);
            if (isFavorited) {
                return prev.filter(fav => fav.id !== college.id);
            } else {
                return [...prev, { ...college, isFavorited: true }];
            }
        });
         setSearchResults(prev => prev.map(res => res.id === college.id ? {...res, isFavorited: !res.isFavorited} : res));
    };

    if (loading) {
        return <Loading />; 
    }

    if (!loading && gradeLevel !== 'High School') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle>Feature Not Available</CardTitle>
                        <CardDescription>
                            The College Prep Hub is exclusively available for high school students.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/dashboard')}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">College Prep Hub</h1>
                <p className="text-muted-foreground">Your mission control for college applications.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>My Colleges</CardTitle>
                            <CardDescription>Search for schools and manage your favorites.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input 
                                        placeholder="Search colleges by name..." 
                                        className="w-full pl-10 pr-4 py-2 h-10 rounded-md border bg-background" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filters</Button>
                            </div>
                            
                            {searchResults.length > 0 && (
                                <div className="border rounded-lg max-h-60 overflow-y-auto mb-4">
                                    {searchResults.map(college => (
                                        <Link key={college.id} href={`/dashboard/college-prep/${college.id}`} className="block">
                                            <div className="flex items-center justify-between p-3 border-b hover:bg-muted">
                                                <div>
                                                    <p className="font-semibold">{college.name}</p>
                                                    <p className="text-xs text-muted-foreground">{college.location}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); toggleFavorite(college);}}>
                                                    <Heart className={cn("h-4 w-4", college.isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                                                </Button>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <h4 className="font-semibold text-lg mb-2">Favorites</h4>
                            <div className="space-y-3">
                                {favoritedColleges.length > 0 ? favoritedColleges.map(college => (
                                    <Link key={college.id} href={`/dashboard/college-prep/${college.id}`} className="block">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80">
                                            <div>
                                                <p className="font-semibold">{college.name}</p>
                                                <p className="text-xs text-muted-foreground">{college.location}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); toggleFavorite(college); }}>
                                                    <Heart className={cn("h-4 w-4", "fill-red-500 text-red-500")} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4"/></Button>
                                            </div>
                                        </div>
                                    </Link>
                                )) : (
                                    <div className="text-sm text-center text-muted-foreground p-4">Your favorited colleges will appear here.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Admissions Tracker</CardTitle>
                             <CardDescription>Visualize your application progress for each college.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-3 rounded-lg bg-muted p-3">
                                    <h4 className="font-semibold text-sm">Not Started</h4>
                                    <div className="p-3 rounded-md bg-background border">
                                        <p className="font-semibold text-sm">University of Miami</p>
                                        <p className="text-xs text-muted-foreground">Regular Decision</p>
                                    </div>
                                </div>
                                 <div className="space-y-3 rounded-lg bg-muted p-3">
                                    <h4 className="font-semibold text-sm">In Progress</h4>
                                     <div className="p-3 rounded-md bg-background border">
                                        <p className="font-semibold text-sm">University of Central Florida</p>
                                        <p className="text-xs text-muted-foreground">EA Application</p>
                                    </div>
                                </div>
                                 <div className="space-y-3 rounded-lg bg-muted p-3">
                                    <h4 className="font-semibold text-sm">Submitted</h4>
                                    <div className="p-3 rounded-md bg-background border">
                                        <p className="font-semibold text-sm">University of Florida</p>
                                        <p className="text-xs text-muted-foreground">Regular Decision</p>
                                    </div>
                                     <div className="p-3 rounded-md bg-background border">
                                        <p className="font-semibold text-sm">Florida State University</p>
                                        <p className="text-xs text-muted-foreground">Rolling Admission</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Checklist</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-3">
                                {mockChecklist.map(item => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className={cn("h-6 w-6 rounded-full flex items-center justify-center border-2", item.completed ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground")}>
                                            {item.completed && <Check className="h-4 w-4"/>}
                                        </div>
                                        <span className={cn("flex-1", item.completed && "line-through text-muted-foreground")}>{item.task}</span>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" className="w-full mt-2"><Plus className="h-4 w-4 mr-2"/> Add Task</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-purple-500/10 border-purple-500/20">
                         <CardHeader>
                            <CardTitle className="text-purple-700 flex items-center gap-2"><GraduationCap /> AI College Coach</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground mb-4">Get personalized advice for essays, extracurriculars, and improving your admission chances.</p>
                           <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                                Chat with Coach <ArrowRight className="h-4 w-4 ml-2"/>
                           </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
