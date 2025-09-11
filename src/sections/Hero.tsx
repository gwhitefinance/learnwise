
'use client';

import { ArrowRight, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import Link from "next/link";

const SplineScene = dynamic(() => import('@/components/ui/spline-scene'), { ssr: false });

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <div className="container mx-auto px-4">
        <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden border-none">
          <div className="flex h-full">
            {/* Left content */}
            <div className="relative flex-1 p-8 z-10 flex flex-col justify-center overflow-hidden">
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Your Personal AI-Powered Study Suite
              </h1>
              <p className="mt-4 text-neutral-300 max-w-lg">
                LearnWise transforms your notes and course materials into personalized study plans, quizzes, and flashcards. Stop cramming, start learning smarter.
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
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Free to get started</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span>Works with any subject</span>
                </div>
              </div>
            </div>

            {/* Right content */}
            <div className="flex-1 relative">
              <SplineScene
                scene="https://prod.spline.design/UbM7F-HZcyTbZ4y3/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
