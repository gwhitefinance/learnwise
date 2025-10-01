
'use client';

import CallToAction from '@/sections/CallToAction';
import Faqs from '@/sections/Faqs';
import Footer from '@/sections/Footer';
import Navbar from '@/sections/Navbar';
import HowItWorks from '@/sections/HowItWorks';
import { ArrowRight, Star, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AIBuddy from '@/components/ai-buddy';
import PersonalizedTutor from '@/sections/PersonalizedTutor';

const Hero = () => (
  <section className="relative py-20 lg:py-28 text-white text-center overflow-hidden">
    <div className="container mx-auto px-4 relative z-10">
      {/* Floating Icons */}
      <motion.div
        className="absolute top-[15%] left-[10%]"
        animate={{ y: [-10, 10], x: [-5, 5], rotate: [-8, 8] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <Image
          src="https://png.pngtree.com/png-vector/20240619/ourmid/pngtree-documents-folder-3d-icon-png-image_12797525.png"
          alt="3D folder icon"
          width={96}
          height={96}
          data-ai-hint="folder documents"
        />
      </motion.div>
      <motion.div
        className="absolute top-[20%] right-[12%]"
        animate={{ y: [15, -15], x: [5, -5], rotate: [5, -5] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <Image
          src="https://cdn3d.iconscout.com/3d/premium/thumb/online-test-time-3d-icon-png-download-3337507.png"
          alt="Lightbulb idea"
          width={80}
          height={80}
          data-ai-hint="quiz checklist"
        />
      </motion.div>
      <motion.div
        className="absolute bottom-[25%] left-[20%]"
        animate={{ y: [-5, 5], x: [-8, 8], rotate: [10, -10] }}
        transition={{
          duration: 9,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <Image
          src="https://png.pngtree.com/png-clipart/20230823/original/pngtree-school-supplies-3d-icon-of-stacked-books-picture-image_8255959.png"
          alt="3D Calendar Icon"
          width={112}
          height={112}
          data-ai-hint="notes organization"
        />
      </motion.div>
      <motion.div
        className="absolute bottom-[15%] right-[25%]"
        animate={{ y: [10, -10], x: [8, -8], rotate: [-3, 3] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <Image
          src="https://uxwing.com/wp-content/themes/uxwing/download/education-school/study-notes-icon.png"
          alt="Sticky notes"
          width={96}
          height={96}
          data-ai-hint="calendar schedule"
        />
      </motion.div>

      <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
        Master <br /> <span className="text-blue-400">your notes</span>
      </h1>
      <p className="mt-6 text-lg md:text-xl text-white/70 max-w-xl mx-auto">
        Turn class notes into <span className="text-blue-400">quizzes</span>,<br /> <span className="text-blue-400">flashcards</span>, and <span className="text-blue-400">smart study plans</span><br /> instantly.
      </p>

      <div className="flex justify-center mt-4 mb-8">
        <div style={{ width: '250px', height: '250px' }}>
            <AIBuddy />
        </div>
      </div>

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

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
        <div className="bg-black/80 rounded-2xl">
            <Link href="/signup">
            <Button
                size="lg"
                className="w-full sm:w-auto bg-blue-500 text-white hover:bg-blue-600 rounded-2xl text-lg h-14 border-b-4 border-black/30 transform active:translate-y-px"
            >
                Start Now
            </Button>
            </Link>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <div className="bg-gray-400 rounded-2xl">
                <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-white border-white/20 text-black hover:text-black hover:bg-gray-100 rounded-2xl text-lg h-14 border-b-4 border-black/20 transform active:translate-y-px"
                >
                    More Info
                </Button>
            </div>
          </DialogTrigger>
           <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    <div className="flex flex-col items-center text-center">
                        <BrainCircuit className="h-12 w-12 text-blue-400 mb-4" />
                        <h2 className="text-3xl font-bold mb-4">What's LearnWise?</h2>
                    </div>
                </DialogTitle>
                <DialogDescription className="sr-only">
                    LearnWise is an AI-powered tutor that helps you study smarter by turning your notes into quizzes, flashcards, and personalized study plans.
                </DialogDescription>
            </DialogHeader>
            <p className="text-muted-foreground mb-8 text-base text-center">
                We built LearnWise to make studying effortless and truly effective. It is an AI powered tutor that learns how you learn, helping you focus on the topics you need most. Whether it is quizzes, flashcards, or personalized study plans, LearnWise helps you study smarter, not harder.
            </p>
            <div className="flex flex-col items-center">
                 <Link href="/signup">
                    <Button
                        size="lg"
                        className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-full text-lg h-14"
                    >
                        Start for Free
                    </Button>
                </Link>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </section>
);

export default function Home() {
  return (
    <main className="bg-background text-white dark-grid">
      <Navbar />
      <Hero />
      <HowItWorks />
      <PersonalizedTutor />
      <Faqs />
      <CallToAction />
      <Footer />
    </main>
  );
}
