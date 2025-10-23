
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
import AIBuddy from '@/components/ai-buddy';

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
        const threshold = label === 'SAT' ? 50 : 10;
        
        if (Math.abs(difference) <= threshold) {
            comparison = 'On Par';
        } else if (difference > threshold) {
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
                <span className="font-bold">{userStat ?? 'N/A'} vs {collegeStat ?? 'N/A'}</span>
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

    useEffect(() => {
        if (typeof collegeId !== 'string') return;
        
        const storedSatScore = localStorage.getItem('satScore');
        if (storedSatScore) {
            setUserSatScore(parseInt(storedSatScore, 10));
        }
        
        // This is a simplified version of the logic from the previous page
        const savedActivitiesData = localStorage.getItem('savedExtracurriculars');
        if (savedActivitiesData && storedSatScore) {
            const savedActivities = JSON.parse(savedActivitiesData);
            const totalActivityStrength = savedActivities.reduce((sum: number, activity: { strength: number }) => sum + activity.strength, 0);
            const averageActivityStrength = savedActivities.length > 0 ? totalActivityStrength / savedActivities.length : 0;
            const satPercentage = ((parseInt(storedSatScore, 10) - 400) / (1600 - 400)) * 100;
            const combinedStrength = (averageActivityStrength * 0.5) + (satPercentage * 0.5);
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
    
     const admissionChance = useMemo(() => {
        if (!college || userAppStrength === null) return { category: 'N/A', description: 'Enter your profile details to see your chances.' };

        const acceptanceRate = college['latest.admissions.admission_rate.overall'];
        if (acceptanceRate === null) return { category: 'N/A', description: 'Admission data not available.' };

        // Define school selectivity tiers
        let schoolTier: 'Highly Selective' | 'Selective' | 'Less Selective';
        if (acceptanceRate <= 0.25) schoolTier = 'Highly Selective';
        else if (acceptanceRate <= 0.50) schoolTier = 'Selective';
        else schoolTier = 'Less Selective';

        // Categorize user's application strength
        let userTier: 'Strong' | 'Competitive' | 'Developing';
        if (userAppStrength >= 75) userTier = 'Strong';
        else if (userAppStrength >= 50) userTier = 'Competitive';
        else userTier = 'Developing';
        
        // Determine admission chance
        if (schoolTier === 'Highly Selective') {
            if (userTier === 'Strong') return { category: 'Target', description: 'Your strong profile makes this a reasonable goal, but admission is still very competitive.' };
            return { category: 'Reach', description: 'Admission is highly competitive. Focus on strengthening every part of your application.' };
        }
        if (schoolTier === 'Selective') {
            if (userTier === 'Strong') return { category: 'Likely', description: 'Your profile is strong for this school, making it a likely admission.' };
            if (userTier === 'Competitive') return { category: 'Target', description: 'Your profile is a good match for this school. A solid application should give you a good chance.' };
            return { category: 'Reach', description: 'This could be a reach. Focus on your essays and recommendations to stand out.' };
        }
        if (schoolTier === 'Less Selective') {
            if (userTier === 'Strong' || userTier === 'Competitive') return { category: 'Likely', description: 'You have a very strong chance of admission with a complete application.' };
            return { category: 'Target', description: 'Your profile is competitive. Ensure your application is well-polished.' };
        }
        
        return { category: 'N/A', description: 'Could not determine admission chance.' };

    }, [college, userAppStrength]);
    
    const chanceColors = {
        'Likely': 'bg-green-500/10 text-green-600 border-green-500/20',
        'Target': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        'Reach': 'bg-red-500/10 text-red-600 border-red-500/20',
        'N/A': 'bg-muted text-muted-foreground border-border'
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
                     <Card className={cn("h-full", chanceColors[admissionChance.category as keyof typeof chanceColors])}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Trophy/> Your Admission Chances</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <p className="text-4xl font-bold">{admissionChance.category}</p>
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
                        <CardContent className="flex items-center gap-4">
                            <AIBuddy className="h-24 w-24 flex-shrink-0" />
                            <p className="text-muted-foreground">Detailed description coming soon. For now, you can visit the school's website for more information, or ask me any questions you have about this college!</p>
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
