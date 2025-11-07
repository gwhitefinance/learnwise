
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardClientPage from './DashboardClientPage';
import { Button } from '@/components/ui/button';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Upload } from 'lucide-react';


const Header = () => {
    const [user] = useAuthState(auth);
    return (
        <header className="flex justify-end items-center p-4 gap-2">
            <Button variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                <Upload className="h-4 w-4 mr-2"/>
                Upgrade
            </Button>
            <Button variant="outline">Feedback</Button>
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                {user?.displayName?.charAt(0) || 'G'}
            </div>
        </header>
    )
}

/**
 * A wrapper for the dashboard that handles the initial welcome popup and tour trigger.
 */
export default function DashboardPageWrapper() {
  return (
    <div className="p-8">
        <Header />
        <DashboardClientPage />
    </div>
  );
};
