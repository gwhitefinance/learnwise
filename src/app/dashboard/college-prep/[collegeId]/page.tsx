
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { getCollegeDetails } from '../actions';
import { notFound } from 'next/navigation';
import Loading from './loading';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, ExternalLink, GraduationCap, Percent, School, BarChart, Trophy, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { generateCollegeDescription } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

type CollegeDetails = {
    id: number;
    'school.name': string;
    'school.city': string;
    'school.state': string;
    'school.school_url': string;
    'latest.student.size': number | null;
    'latest.admissions.admission_rate.overall': number | null;
    'latest.admissions.sat_scores.average.overall': number | null;
    'latest.admissions.act_scores.midpoint.cumulative': number | null;
    'latest.cost.tuition.in_state': number | null;
    'latest.cost.tuition.out_of_state': number | null;
};

const StatCard = ({ title, value, icon }: { title: string; value: string | number | null; icon: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value ?? 'N/A'}</div>
        </CardContent>
    </Card>
);

const ChanceIndicator = ({ label, userStat, collegeStat, higherIsBetter = true }: { label: string, userStat: number | null, collegeStat: number | null, higherIsBetter?: boolean }) => {
    let comparison: 'Below' | 'On Par' | 'Above' | 'N/A' = 'N/A';

    if (userStat !== null && collegeStat !== null) {
        const difference = userStat - collegeStat;
        let threshold = 0.05 * collegeStat; // 5% threshold

        if (Math.abs(difference) <= threshold) {
            comparison = 'On Par';
        } else if (difference > 0) {
            comparison = higherIsBetter ? 'Above' : 'Below';
        } else {
            comparison = higherIsBetter ? 'Below' : 'Above';
        }
    }


    const colors = {
        'Above': 'text-green-500',
        'On Par': 'text-yellow-500',
        'Below': 'text-red-500',
        'N/A': 'text-muted-foreground',
    };

    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-bold">{userStat ?? 'N/A'}{collegeStat !== null ? ` vs ${collegeStat}`: ''}</span>
                <span className={cn("font-semibold", colors[comparison])}>{comparison}</span>
            </div>
        </div>
    );
};


export default function CollegeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { collegeId } = params;
    const [college, setCollege] = useState<CollegeDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [userSatScore, setUserSatScore] = useState<number | null>(null);
    const [userAppStrength, setUserAppStrength] = useState<number | null>(null);
    const [userState, setUserState] = useState<string | null>(null);
    const [description, setDescription] = useState<string | null>(null);
    const [isDescriptionLoading, setIsDescriptionLoading] = useState(true);

    useEffect(() => {
        if (typeof collegeId !== 'string') return;
        
        const storedSatScore = localStorage.getItem('satScore');
        if (storedSatScore) {
            setUserSatScore(parseInt(storedSatScore, 10));
        }

        const storedUserState = localStorage.getItem('userState');
        if (storedUserState) {
            setUserState(storedUserState);
        }
        
        const savedActivitiesData = localStorage.getItem('savedExtracurriculars');
        if (savedActivitiesData) {
            const savedActivities = JSON.parse(savedActivitiesData);
            const totalActivityStrength = savedActivities.reduce((sum: number, activity: { strength: number }) => sum + activity.strength, 0);
            const averageActivityStrength = savedActivities.length > 0 ? totalActivityStrength / savedActivities.length : 0;
            const satScore = localStorage.getItem('satScore');
            const satPercentage = satScore ? ((parseInt(satScore, 10) - 400) / (1600 - 400)) * 100 : 0;
            const weightedGpa = localStorage.getItem('weightedGpa');
            const gpaValue = weightedGpa ? parseFloat(weightedGpa) : 0;
            const gpaPercentage = !isNaN(gpaValue) ? Math.min(100, (gpaValue / 5.0) * 100) : 0;
            const transcriptCourses = localStorage.getItem('transcriptCourses');
            const courses = transcriptCourses ? JSON.parse(transcriptCourses) : [];
            const apCourses = courses.filter((c: any) => c.type === 'AP').length;
            const honorsCourses = courses.filter((c: any) => c.type === 'Honors').length;
            const totalCourses = courses.length > 0 ? courses.length : 1;
            const rigorScore = Math.min(100, ((apCourses * 2 + honorsCourses) / (totalCourses * 2)) * 100);
            const combinedStrength = (satPercentage * 0.35) + (gpaPercentage * 0.30) + (rigorScore * 0.20) + (averageActivityStrength * 0.15);
            setUserAppStrength(Math.round(Math.max(0, Math.min(100, combinedStrength))));
        }

        const fetchDetails = async () => {
            setLoading(true);
            const details = await getCollegeDetails(collegeId);
            if (!details) {
                notFound();
            } else {
                setCollege(details);
            }
            setLoading(false);
        };
        
        fetchDetails();
    }, [collegeId]);

    useEffect(() => {
        if (college) {
            setIsDescriptionLoading(true);
            generateCollegeDescription({ collegeName: college['school.name'] })
                .then(result => {
                    setDescription(result.description);
                })
                .catch(err => {
                    console.error("Failed to generate description:", err);
                    setDescription("Could not load description for this college.");
                })
                .finally(() => {
                    setIsDescriptionLoading(false);
                });
        }
    }, [college]);
    
     const admissionChance = useMemo(() => {
        if (!college || userAppStrength === null || userSatScore === null) {
            return { percentage: null, description: 'Enter your profile details to see your chances.' };
        }

        const baseAcceptanceRate = college['latest.admissions.admission_rate.overall'] ?? 0.5;
        const avgSat = college['latest.admissions.sat_scores.average.overall'] ?? 1200;
        
        // 1. SAT Score Factor
        const satDifference = userSatScore - avgSat;
        let satFactor = 0;
        // More impactful factor based on SAT difference
        if (satDifference > 0) {
            satFactor = Math.min(0.25, (satDifference / 200)); // Cap bonus
        } else {
            satFactor = Math.max(-0.35, (satDifference / 150)); // Cap penalty
        }


        // 2. App Strength Factor
        let expectedAppStrength = 50; 
        if (baseAcceptanceRate <= 0.15) expectedAppStrength = 85; // Highly Selective
        else if (baseAcceptanceRate <= 0.35) expectedAppStrength = 70; // Selective
        else if (baseAcceptanceRate <= 0.60) expectedAppStrength = 55; // Moderately Selective

        const appStrengthDifference = (userAppStrength - expectedAppStrength);
        const appStrengthFactor = Math.max(-0.2, Math.min(0.2, appStrengthDifference / 100));
        
        // 3. In-State Factor
        const isInState = userState && college['school.state'] === userState;
        // For simplicity, we assume public schools benefit more from in-state applicants.
        // A more complex model could check school type. This is a reasonable approximation.
        const inStateBonus = isInState ? Math.min(baseAcceptanceRate * 0.5, 0.15) : 0; // Up to 15% bonus, but no more than 50% of original rate

        let calculatedChance = baseAcceptanceRate + satFactor + appStrengthFactor + inStateBonus;
        calculatedChance = Math.max(0.01, Math.min(0.99, calculatedChance));

        const percentage = Math.round(calculatedChance * 100);
        
        let description = "This is an estimate based on your profile and school data.";
        if (percentage >= 75) description = "You have a strong profile for this school. Keep up the great work!";
        else if (percentage >= 40) description = "You're a competitive applicant. Focus on your essays and recommendations to stand out.";
        else if (percentage >= 15) description = "This is a reach, but possible. Focus on strengthening every part of your application.";
        else description = "This is a significant reach. Consider building up your profile or exploring other options.";


        return { percentage, description };

    }, [college, userAppStrength, userSatScore, userState]);
    
    const getChanceColor = (percentage: number | null) => {
        if (percentage === null) return 'bg-muted text-muted-foreground border-border';
        if (percentage >= 75) return 'bg-green-500/10 text-green-600 border-green-500/20';
        if (percentage >= 40) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
        return 'bg-red-500/10 text-red-600 border-red-500/20';
    }


    if (loading) {
        return <Loading />;
    }

    if (!college) {
        return notFound();
    }
    
    const formatCurrency = (value: number | null) => {
        if (value === null) return 'N/A';
        return `$${value.toLocaleString()}`;
    };

    const formatPercentage = (value: number | null) => {
        if (value === null) return 'N/A';
        return `${(value * 100).toFixed(1)}%`;
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
            <Button variant="ghost" onClick={() => router.push('/dashboard/college-prep')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to College Search
            </Button>
            
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">{college['school.name']}</h1>
                <p className="text-xl text-muted-foreground">{college['school.city']}, {college['school.state']}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2">
                     <Card className={cn("h-full", getChanceColor(admissionChance.percentage))}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Trophy/> Your Admission Chances</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <p className="text-6xl font-bold">{admissionChance.percentage !== null ? `${admissionChance.percentage}%` : 'N/A'}</p>
                                <p className="text-sm text-muted-foreground mt-1">{admissionChance.description}</p>
                            </div>
                             <div className="space-y-2 pt-4 border-t">
                                <ChanceIndicator label="SAT" userStat={userSatScore} collegeStat={college['latest.admissions.sat_scores.average.overall']} />
                                <ChanceIndicator label="App Strength" userStat={userAppStrength} collegeStat={null} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart/> Key Stats</CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Acceptance Rate</span>
                            <span className="font-bold">{formatPercentage(college['latest.admissions.admission_rate.overall'])}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Avg. SAT Score</span>
                            <span className="font-bold">{college['latest.admissions.sat_scores.average.overall'] ?? 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">In-State Tuition</span>
                            <span className="font-bold">{formatCurrency(college['latest.cost.tuition.in_state'])}</span>
                        </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Out-of-State Tuition</span>
                            <span className="font-bold">{formatCurrency(college['latest.cost.tuition.out_of_state'])}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>About {college['school.name']}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isDescriptionLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            ) : (
                                <p className="text-muted-foreground">{description}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>At a Glance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Student Population</span>
                                <span className="font-bold">{college['latest.student.size']?.toLocaleString() ?? 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Avg. ACT Score</span>
                                <span className="font-bold">{college['latest.admissions.act_scores.midpoint.cumulative'] ?? 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Quick Links</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <a href={`https://${college['school.school_url']}`} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="w-full justify-start">School Website <ExternalLink className="ml-auto h-4 w-4" /></Button>
                            </a>
                             <a href={`https://${college['school.school_url']}/admissions`} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="w-full justify-start">Admissions Page <ExternalLink className="ml-auto h-4 w-4" /></Button>
                            </a>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
