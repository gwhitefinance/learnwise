
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const integrationTools = [
    {
        name: "Google Classroom",
        description: "Sync your roster, assignments, and grades seamlessly.",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Google_Classroom_Logo.svg/2048px-Google_Classroom_Logo.svg.png",
        href: "#"
    },
    {
        name: "Microsoft Teams",
        description: "Integrate Tutorin's tools directly into your Teams channels.",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/2203px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png",
        href: "#"
    },
    {
        name: "Canvas",
        description: "Connect with Canvas LMS for gradebook synchronization.",
        icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/canvas-lms-logo-icon.png",
        href: "#"
    },
    {
        name: "Schoology",
        description: "Import rosters and export grades to your Schoology courses.",
        icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/schoology-logo-icon.png",
        href: "#"
    },
     {
        name: "Single Sign-On (SSO)",
        description: "Allow students and faculty to log in with their district credentials.",
        icon: "https://uxwing.com/wp-content/themes/uxwing/download/internet-network-technology/sso-single-sign-on-icon.png",
        href: "#"
    },
     {
        name: "Zoom",
        description: "Launch and record study sessions directly within Tutorin.",
        icon: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/zoom-icon.png",
        href: "#"
    }
];

export default function IntegrationsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Integration & Sync</h1>
                <p className="text-muted-foreground">Connect Tutorin with the tools you use every day.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrationTools.map(tool => (
                    <Card key={tool.name} className="flex flex-col hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Image src={tool.icon} alt={`${tool.name} logo`} width={40} height={40} className="rounded-md" />
                                <CardTitle>{tool.name}</CardTitle>
                            </div>
                            <CardDescription className="mt-2">{tool.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto">
                            <Link href={tool.href} className="w-full">
                                <Button variant="outline" className="w-full" disabled>
                                    Coming Soon <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
