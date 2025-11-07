

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import {
  Plus,
  LayoutGrid,
  GraduationCap,
  Upload,
  Bookmark,
  Settings,
  FileText,
  Lightbulb,
  MessageSquare,
  Gamepad2,
  Copy,
  Headphones,
  ChevronDown,
  Play,
  Flame,
  Calendar,
  FilePenLine,
  Mic,
  ChevronRight,
} from 'lucide-react';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import AIBuddy from '@/components/ai-buddy';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import Loading from './loading';
import DashboardClientPage from './DashboardClientPage';

const DashboardPage = () => {
    return (
        <div className="h-full">
            <DashboardClientPage />
        </div>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<Loading/>}>
            <DashboardPage />
        </Suspense>
    );
}
