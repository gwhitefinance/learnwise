'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardClientPage from './DashboardClientPage';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import AIBuddy from '@/components/ai-buddy';

/**
 * A wrapper for the dashboard that handles the initial welcome popup and tour trigger.
 */
export default function DashboardPageWrapper() {

  return <DashboardClientPage />;
};
