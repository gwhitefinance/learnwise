'use client';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-24 text-center">
      <div className="container relative">
        <div className="bg-primary/80 w-80 h-80 rounded-full absolute -top-20 -left-20 blur-3xl opacity-50"></div>
        <div className="bg-primary/80 w-80 h-80 rounded-full absolute -bottom-20 -right-20 blur-3xl opacity-50"></div>
        <div className="relative">
          <div className="bg-primary/20 text-primary font-medium text-sm py-1.5 px-3 rounded-full inline-block mb-4">
            Personalized AI Learning Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Unlock Your Full Learning Potential with AI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            LearnWise creates personalized study plans, generates practice
            quizzes, and provides instant answers to your questions. Study
            smarter, not harder.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">
                Get Started Free <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
