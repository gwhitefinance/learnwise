'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Integrations = () => {
  return (
    <section id="integrations" className="py-20 md:py-32">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-primary font-semibold text-lg mb-2">
              Integrations
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
              Works with your existing tools
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Connect LearnWise with the apps you already use, like Google
              Drive, Notion, and more. Upload documents, sync notes, and keep
              your learning workflow seamless.
            </p>
            <Link href="/dashboard">
              <Button variant="outline">
                See all integrations <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
          <div>
            <Image
              src="https://picsum.photos/600/400"
              alt="Integrations"
              width={600}
              height={400}
              className="rounded-xl shadow-lg"
              data-ai-hint="app logos"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integrations;
