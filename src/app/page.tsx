'use client';

import CallToAction from '@/sections/CallToAction';
import Faqs from '@/sections/Faqs';
import Footer from '@/sections/Footer';
import Navbar from '@/sections/Navbar';
import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const Hero = () => (
  <section className="relative py-32 lg:py-48 text-white text-center overflow-hidden">
    <div className="container mx-auto px-4 relative z-10">
      {/* Floating Icons */}
      <motion.div
        className="absolute top-[15%] left-[10%] w-24 h-24 opacity-50"
        animate={{ y: [-10, 10], x: [-5, 5], rotate: [-8, 8] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <Image
          src="https://img.favpng.com/8/20/19/paper-plane-logo-desktop-wallpaper-image-png-favpng-CdeFvC3u6Gg5vj1vAgvWpTJjA.jpg"
          alt="Flying paper plane"
          width={96}
          height={96}
          data-ai-hint="paper plane"
        />
      </motion.div>
      <motion.div
        className="absolute top-[20%] right-[12%] w-20 h-20 opacity-50"
        animate={{ y: [15, -15], x: [5, -5], rotate: [5, -5] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <Image
          src="https://img.favpng.com/8/20/19/paper-plane-logo-desktop-wallpaper-image-png-favpng-CdeFvC3u6Gg5vj1vAgvWpTJjA.jpg"
          alt="Flying paper plane"
          width={80}
          height={80}
          data-ai-hint="paper plane"
        />
      </motion.div>
      <motion.div
        className="absolute bottom-[25%] left-[20%] w-28 h-28 opacity-50"
        animate={{ y: [-5, 5], x: [-8, 8], rotate: [10, -10] }}
        transition={{
          duration: 9,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <Image
          src="https://img.favpng.com/8/20/19/paper-plane-logo-desktop-wallpaper-image-png-favpng-CdeFvC3u6Gg5vj1vAgvWpTJjA.jpg"
          alt="Flying paper plane"
          width={112}
          height={112}
          data-ai-hint="paper plane"
        />
      </motion.div>
      <motion.div
        className="absolute bottom-[15%] right-[25%] w-24 h-24 opacity-50"
        animate={{ y: [10, -10], x: [8, -8], rotate: [-3, 3] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <Image
          src="https://img.favpng.com/8/20/19/paper-plane-logo-desktop-wallpaper-image-png-favpng-CdeFvC3u6Gg5vj1vAgvWpTJjA.jpg"
          alt="Flying paper plane"
          width={96}
          height={96}
          data-ai-hint="paper plane"
        />
      </motion.div>

      <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
        Master <span className="text-blue-400">your notes</span>
      </h1>
      <p className="mt-6 text-lg md:text-xl text-white/70 max-w-xl mx-auto">
        Turn class notes into quizzes, flashcards, and smart study plans
        instantly.
      </p>
      <div className="flex justify-center items-center gap-4 mt-8">
        <div className="flex -space-x-4">
          <Image
            className="inline-block h-10 w-10 rounded-full ring-2 ring-background"
            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            alt="User 1"
            width={40}
            height={40}
          />
          <Image
            className="inline-block h-10 w-10 rounded-full ring-2 ring-background"
            src="https://i.pravatar.cc/150?u=a042581f4e29026705d"
            alt="User 2"
            width={40}
            height={40}
          />
           <Image
            className="inline-block h-10 w-10 rounded-full ring-2 ring-background"
            src="https://i.pravatar.cc/150?u=a042581f4e29026706d"
            alt="User 3"
            width={40}
            height={40}
          />
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-background text-sm font-bold">
            25k+
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
          <p className="text-sm text-white/70">from 25k+ happy learners</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Link href="/signup">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-blue-500 text-white hover:bg-blue-600 rounded-full text-base"
          >
            Start Now
          </Button>
        </Link>
        <Link href="#features">
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full text-base"
          >
            More Info
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default function Home() {
  return (
    <main className="bg-background text-white dark-grid">
      <Navbar />
      <Hero />
      {/* Other sections can be added here */}
      <Faqs />
      <CallToAction />
      <Footer />
    </main>
  );
}
