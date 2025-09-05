'use client';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CallToAction = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6">
            Ready to revolutionize your learning?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Join thousands of students who are learning smarter, not harder, with
            LearnWise.
          </p>
          <Link href="/dashboard">
            <Button size="lg">
              Start Learning Now <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
