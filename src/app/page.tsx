
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, Lightbulb, GitMerge } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-2 font-bold text-xl">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span>LearnWise</span>
        </Link>
        <nav className="flex items-center gap-4">
           <Link href="/dashboard">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/dashboard">
            <Button>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
              Unlock Your Learning Potential with AI
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground">
              LearnWise creates personalized study plans, generates practice quizzes, and provides instant answers to your questions. Study smarter, not harder.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg">Start Learning Now</Button>
              </Link>
               <Link href="/dashboard/courses">
                <Button size="lg" variant="outline">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="bg-muted py-20 md:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Succeed</h2>
                    <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                        Our platform is packed with features designed to help you master any subject with confidence.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                               <GitMerge className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="mt-4">AI-Powered Roadmaps</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Get a clear, step-by-step study plan for any course, complete with goals and milestones to keep you on track.</p>
                        </CardContent>
                    </Card>
                     <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                               <Lightbulb className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="mt-4">Practice Quizzes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Test your knowledge with customized quizzes on any topic, at any difficulty level.</p>
                        </CardContent>
                    </Card>
                     <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                               <BrainCircuit className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="mt-4">AI Study Assistant</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Have a question? Our AI chat is available 24/7 to provide instant explanations and answers.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
        
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">A Personalized Learning Journey</h2>
              <p className="text-muted-foreground mt-4">
                No two students learn the same way. That's why LearnWise adapts to you. By analyzing your learning style, we provide tailored content and recommendations to help you learn more effectively. Stop following generic study guides and start a journey that's designed for you.
              </p>
               <div className="mt-6">
                <Link href="/dashboard">
                  <Button>Discover Your Learner Type</Button>
                </Link>
              </div>
            </div>
            <div>
              <Image
                src="https://picsum.photos/600/400"
                alt="Personalized learning"
                width={600}
                height={400}
                className="rounded-lg object-cover shadow-lg"
                data-ai-hint="student studying online"
              />
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-muted border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} LearnWise. All rights reserved.</p>
           <div className="flex gap-4">
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
