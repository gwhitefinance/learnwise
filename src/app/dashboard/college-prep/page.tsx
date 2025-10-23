
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Heart, Search, Filter, ArrowRight, MoreHorizontal, Check, Plus, Loader2, Sparkles, Save, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Loading from './loading';
import Link from 'next/link';
import { searchColleges } from './actions';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { enhanceExtracurricular } from '@/lib/actions';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allUSStates } from '@/lib/states';


type College = {
    id: number;
    'school.name': string;
    'school.city': string;
    'school.state': string;
};

type FavoriteCollege = College & {
    isFavorited: boolean;
};

type EnhancedActivity = {
    enhancedDescription: string;
    strength: number;
};

type SavedActivity = {
    id: string;
    title: string;
    description: string;
    strength: number;
};


export default function CollegePrepPage() {
    const [gradeLevel, setGradeLevel] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [favoritedColleges, setFavoritedColleges] = useState<FavoriteCollege[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<College[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Extracurricular state
    const [activityInput, setActivityInput] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [enhancedActivity, setEnhancedActivity] = useState<EnhancedActivity | null>(null);
    const [activityTitle, setActivityTitle] = useState('');
    const [savedActivities, setSavedActivities] = useState<SavedActivity[]>([]);
    
    // Academic Profile State
    const [satScore, setSatScore] = useState(1200);
    const [weightedGpa, setWeightedGpa] = useState('');
    const [unweightedGpa, setUnweightedGpa] = useState('');
    const [courses, setCourses] = useState([]);
    const [userState, setUserState] = useState('');


    const applicationStrength = useMemo(() => {
        const satWeight = 0.35;
        const gpaWeight = 0.30;
        const rigorWeight = 0.20;
        const extracurricularWeight = 0.15;
    
        // SAT score percentage (scaled from 400-1600 range to 0-100)
        const satPercentage = Math.max(0, ((satScore - 400) / (1600 - 400)) * 100);
        
        // GPA percentage (using weighted GPA, assuming a 5.0 scale is a strong benchmark)
        const gpaValue = parseFloat(weightedGpa);
        const gpaPercentage = !isNaN(gpaValue) ? Math.min(100, (gpaValue / 5.0) * 100) : 0;
    
        // Course rigor score (AP courses are weighted more heavily)
        const apCourses = courses.filter((c: any) => c.type === 'AP').length;
        const honorsCourses = courses.filter((c: any) => c.type === 'Honors').length;
        const totalCourses = courses.length > 0 ? courses.length : 1; // Avoid division by zero
        // Score is based on proportion of advanced courses. APs count as 2 points, Honors as 1. Max possible score is if all are APs.
        const rigorScore = Math.min(100, ((apCourses * 2 + honorsCourses) / (totalCourses * 2)) * 100);

        // Extracurricular score (average of all saved activity strengths)
        const totalActivityStrength = savedActivities.reduce((sum, activity) => sum + activity.strength, 0);
        const averageActivityStrength = savedActivities.length > 0 ? totalActivityStrength / savedActivities.length : 0;
    
        // Combine scores based on their weights
        const combinedStrength = 
            (satPercentage * satWeight) + 
            (gpaPercentage * gpaWeight) + 
            (rigorScore * rigorWeight) + 
            (averageActivityStrength * extracurricularWeight);
        
        // Ensure the final score is between 0 and 100
        return Math.round(Math.max(0, Math.min(100, combinedStrength)));
    }, [savedActivities, satScore, weightedGpa, courses]);


    useEffect(() => {
        const storedGrade = localStorage.getItem('onboardingGradeLevel');
        setGradeLevel(storedGrade);
        
        const savedFavorites = localStorage.getItem('favoritedColleges');
        if (savedFavorites) {
            setFavoritedColleges(JSON.parse(savedFavorites));
        }
        
        const savedActivitiesData = localStorage.getItem('savedExtracurriculars');
        if (savedActivitiesData) {
            setSavedActivities(JSON.parse(savedActivitiesData));
        }
        
        const storedSatScore = localStorage.getItem('satScore');
        if (storedSatScore) {
            setSatScore(parseInt(storedSatScore, 10));
        }
        
        const storedWeightedGpa = localStorage.getItem('weightedGpa');
        if(storedWeightedGpa) setWeightedGpa(storedWeightedGpa);
        const storedUnweightedGpa = localStorage.getItem('unweightedGpa');
        if(storedUnweightedGpa) setUnweightedGpa(storedUnweightedGpa);
        
        const storedCourses = localStorage.getItem('transcriptCourses');
        if (storedCourses) {
            setCourses(JSON.parse(storedCourses));
        }

        const storedUserState = localStorage.getItem('userState');
        if (storedUserState) {
            setUserState(storedUserState);
        }

        setLoading(false);
    }, []);
    
    useEffect(() => {
        localStorage.setItem('favoritedColleges', JSON.stringify(favoritedColleges));
    }, [favoritedColleges]);

     useEffect(() => {
        // This effect ensures that whenever savedActivities state changes, it is persisted to localStorage.
        if (savedActivities.length > 0 || localStorage.getItem('savedExtracurriculars')) {
            localStorage.setItem('savedExtracurriculars', JSON.stringify(savedActivities));
        }
    }, [savedActivities]);

    useEffect(() => {
        if (searchTerm.trim().length < 3) {
            setSearchResults([]);
            return;
        }

        const handleSearch = async () => {
            setIsSearching(true);
            const results = await searchColleges(searchTerm);
            setSearchResults(results);
            setIsSearching(false);
        };
        
        const debounce = setTimeout(() => {
            handleSearch();
        }, 300);

        return () => clearTimeout(debounce);

    }, [searchTerm]);
    
    const toggleFavorite = (college: College) => {
        setFavoritedColleges(prev => {
            const isFavorited = prev.some(fav => fav.id === college.id);
            if (isFavorited) {
                return prev.filter(fav => fav.id !== college.id);
            } else {
                return [...prev, { ...college, isFavorited: true }];
            }
        });
    };
    
    const handleEnhanceActivity = async () => {
        if (!activityInput.trim()) return;
        setIsEnhancing(true);
        setEnhancedActivity(null);
        setActivityTitle('');
        try {
            const result = await enhanceExtracurricular({ activityDescription: activityInput });
            setEnhancedActivity(result);
        } catch (error) {
            console.error("Failed to enhance activity:", error);
        } finally {
            setIsEnhancing(false);
        }
    };
    
    const handleSaveActivity = () => {
        if (!enhancedActivity || !activityTitle.trim()) {
            return;
        }
        const newActivity: SavedActivity = {
            id: crypto.randomUUID(),
            title: activityTitle,
            description: enhancedActivity.enhancedDescription,
            strength: enhancedActivity.strength,
        };
        setSavedActivities(prev => [...prev, newActivity]);
        
        // Reset fields after saving
        setEnhancedActivity(null);
        setActivityInput('');
        setActivityTitle('');
    };

    const handleSatScoreChange = (value: number[]) => {
        const newScore = value[0];
        setSatScore(newScore);
        localStorage.setItem('satScore', String(newScore));
    };

    const handleGpaChange = (type: 'weighted' | 'unweighted', value: string) => {
        const sanitizedValue = value.replace(/[^0-9.]/g, '');
        if (type === 'weighted') {
            setWeightedGpa(sanitizedValue);
            localStorage.setItem('weightedGpa', sanitizedValue);
        } else {
            setUnweightedGpa(sanitizedValue);
            localStorage.setItem('unweightedGpa', sanitizedValue);
        }
    }
    
    const handleUserStateChange = (stateAbbreviation: string) => {
        setUserState(stateAbbreviation);
        localStorage.setItem('userState', stateAbbreviation);
    }


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
                                    <Input 
                                        placeholder="Search over 6,000 colleges by name..." 
                                        className="w-full pl-10 pr-4 py-2 h-10 rounded-md border bg-background" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                                </div>
                                <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filters</Button>
                            </div>
                            
                            {searchResults.length > 0 && searchTerm.length >= 3 && (
                                <div className="border rounded-lg max-h-60 overflow-y-auto mb-4">
                                    {searchResults.map(college => (
                                        <div key={college.id} className="flex items-center justify-between p-3 border-b hover:bg-muted">
                                            <Link href={`/dashboard/college-prep/${college.id}`} className="block flex-1">
                                                <div>
                                                    <p className="font-semibold">{college['school.name']}</p>
                                                    <p className="text-xs text-muted-foreground">{college['school.city']}, {college['school.state']}</p>
                                                </div>
                                            </Link>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.preventDefault(); toggleFavorite(college);}}>
                                                <Heart className={cn("h-4 w-4", favoritedColleges.some(fav => fav.id === college.id) ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <h4 className="font-semibold text-lg mb-2">Favorites</h4>
                            <div className="space-y-3">
                                {favoritedColleges.length > 0 ? favoritedColleges.map(college => (
                                    <Link key={college.id} href={`/dashboard/college-prep/${college.id}`} className="block">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80">
                                            <div>
                                                <p className="font-semibold">{college['school.name']}</p>
                                                <p className="text-xs text-muted-foreground">{college['school.city']}, {college['school.state']}</p>
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
                            <CardTitle>Extracurricular Enhancer</CardTitle>
                            <CardDescription>Let AI help you word your activities professionally for college apps.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea 
                                placeholder="Describe an activity, e.g., 'I was the captain of the debate team and we won the state championship.'"
                                value={activityInput}
                                onChange={(e) => setActivityInput(e.target.value)}
                            />
                            <Button onClick={handleEnhanceActivity} disabled={isEnhancing}>
                                {isEnhancing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Enhance with AI
                            </Button>
                            {enhancedActivity && (
                                <div className="pt-4 space-y-4 border-t">
                                    <div>
                                        <h4 className="font-semibold">Suggested Description:</h4>
                                        <p className="text-muted-foreground p-3 bg-muted rounded-lg mt-1">{enhancedActivity.enhancedDescription}</p>
                                    </div>
                                    <div>
                                         <h4 className="font-semibold">Strength Score:</h4>
                                          <div className="flex items-center gap-4">
                                            <Progress value={enhancedActivity.strength} className="w-full"/>
                                            <span className="font-bold text-primary text-lg">{enhancedActivity.strength}%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 border-t pt-4">
                                         <Input 
                                            placeholder="Enter an Activity Title (e.g., 'Debate Team Captain')"
                                            value={activityTitle}
                                            onChange={(e) => setActivityTitle(e.target.value)}
                                        />
                                        <Button onClick={handleSaveActivity} disabled={!activityTitle.trim()}>
                                            <Save className="mr-2 h-4 w-4"/>
                                            Save to Profile
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>My Extracurriculars</CardTitle>
                            <CardDescription>Your saved list of polished activity descriptions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {savedActivities.length > 0 ? (
                                <div className="space-y-4">
                                    {savedActivities.map(activity => (
                                        <div key={activity.id} className="p-4 rounded-lg bg-muted">
                                            <h4 className="font-semibold">{activity.title}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm text-muted-foreground p-4">Your saved activities will show up here.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Academic Profile</CardTitle>
                            <CardDescription>Set your scores and GPA.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div>
                                <label className="font-semibold text-sm">My SAT Score</label>
                                <div className="text-center font-bold text-3xl text-primary my-2">{satScore}</div>
                                <Slider
                                    defaultValue={[satScore]}
                                    max={1600}
                                    min={400}
                                    step={10}
                                    onValueChange={handleSatScoreChange}
                                />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="font-semibold text-sm">Weighted GPA</label>
                                    <Input placeholder="e.g., 4.2" value={weightedGpa} onChange={(e) => handleGpaChange('weighted', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="font-semibold text-sm">Unweighted GPA</label>
                                    <Input placeholder="e.g., 3.8" value={unweightedGpa} onChange={(e) => handleGpaChange('unweighted', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="font-semibold text-sm flex items-center gap-2"><MapPin className="h-4 w-4"/> My Home State</label>
                                <Select value={userState} onValueChange={handleUserStateChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allUSStates.map(state => (
                                            <SelectItem key={state.abbreviation} value={state.abbreviation}>{state.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <Button variant="outline" className="w-full" asChild>
                                <Link href="/dashboard/college-prep/transcript">Manage Transcript</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Strength</CardTitle>
                            <CardDescription>An estimate based on your current profile.</CardDescription>
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
                                        strokeDasharray={`${applicationStrength}, 100`}
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        strokeLinecap="round"
                                        transform="rotate(-90 18 18)"
                                    />
                                </svg>
                                 <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
                                    {applicationStrength}%
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-4 text-center">Based on SAT, GPA, course rigor, and extracurriculars.</p>
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
