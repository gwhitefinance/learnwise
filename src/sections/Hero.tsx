
'use client';

import { ArrowRight, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AIBuddy from "@/components/ai-buddy";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <div className="container mx-auto px-4">
        <Card className="w-full bg-black/[0.96] relative overflow-hidden border-none">
          <div className="flex flex-col lg:flex-row h-full items-center">
            {/* Left content */}
            <div className="relative flex-1 p-8 z-10 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Unlock Your Potential. Learn Anything, Anywhere.
              </h1>
              <p className="mt-4 text-neutral-300 max-w-lg">
                From the classroom to the boardroom, LearnWise is your personal AI tutor. We provide the tools to help you understand complex topics and achieve your goals, no matter your walk of life.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/signup">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 bg-transparent"
                  >
                    Explore Features
                  </Button>
                </a>
              </div>

              <div className="flex items-center gap-8 text-sm text-neutral-400 mt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>Free to get started</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>For work, school, and life</span>
                </div>
              </div>
            </div>

            {/* Right content */}
            <div className="flex-1 w-full h-[300px] lg:h-[500px] flex items-center justify-center">
               <AIBuddy className="w-80 h-80 lg:w-96 lg:h-96" />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
