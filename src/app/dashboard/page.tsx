
'use client';

import React, { useEffect, useState } from 'react';
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
  const [showWelcome, setShowWelcome] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // This effect runs once as soon as the component mounts.
    const quizCompleted = localStorage.getItem('quizCompleted') === 'true';

    if (quizCompleted) {
      setShowWelcome(true);
      setShowDashboard(false); // Ensure dashboard is hidden initially
    } else {
      // If the quiz wasn't completed, just show the dashboard immediately.
      setShowDashboard(true);
    }
  }, []);

  const handleStartTour = () => {
    // Hide the welcome popup.
    setShowWelcome(false);
    
    // Show the dashboard.
    setShowDashboard(true);

    // Mark that the tour should start so the layout can pick it up.
    localStorage.setItem('startTour', 'true');

    // We can now remove the quiz completion flag as it has served its purpose.
    localStorage.removeItem('quizCompleted');
  };

  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="welcome-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4"
          >
            <div className="relative max-w-sm w-full">
              <div className="bg-card rounded-2xl shadow-2xl p-6 flex flex-col text-center items-center">
                <div className="flex-shrink-0 size-24 rounded-full bg-primary/10 text-primary shadow-lg flex items-center justify-center ring-4 ring-card mb-4">
                  <AIBuddy className="w-20 h-20" />
                </div>
                <h3 className="text-xl font-bold mb-2">Welcome to Tutorin!</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  You're all set up. Let's take a quick tour to see how everything works.
                </p>
                <div className="flex justify-center w-full">
                  <Button size="lg" onClick={handleStartTour} className="w-full">
                    Start Tour
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showDashboard && <DashboardClientPage />}
    </>
  );
};
