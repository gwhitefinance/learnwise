
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCollegeDetails } from '../actions';
import { notFound } from 'next/navigation';
import Loading from './loading';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, ExternalLink, GraduationCap, Percent, School } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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

export default function CollegeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { collegeId } = params;
    const [college, setCollege] = useState<CollegeDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof collegeId !== 'string') return;
        
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
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                    title="Acceptance Rate"
                    value={formatPercentage(college['latest.admissions.admission_rate.overall'])}
                    icon={<Percent className="h-4 w-4 text-muted-foreground" />}
                />
                 <StatCard 
                    title="Avg. SAT Score"
                    value={college['latest.admissions.sat_scores.average.overall']}
                    icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
                />
                 <StatCard 
                    title="In-State Tuition"
                    value={formatCurrency(college['latest.cost.tuition.in_state'])}
                    icon={<School className="h-4 w-4 text-muted-foreground" />}
                />
                 <StatCard 
                    title="Out-of-State Tuition"
                    value={formatCurrency(college['latest.cost.tuition.out_of_state'])}
                    icon={<School className="h-4 w-4 text-muted-foreground" />}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <a href={`https://${college['school.school_url']}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">School Website <ExternalLink className="ml-2 h-4 w-4" /></Button>
                    </a>
                     <a href={`https://${college['school.school_url']}/admissions`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">Admissions Page <ExternalLink className="ml-2 h-4 w-4" /></Button>
                    </a>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>About {college['school.name']}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-muted-foreground">Detailed description coming soon. For now, you can visit the school's website for more information.</p>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-1">
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
                </div>
            </div>
        </div>
    );
}

