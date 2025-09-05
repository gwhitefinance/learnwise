
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, Check, Menu, X, Star, Zap, BarChart, Clock, Code, Bot } from 'lucide-react';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const features = [
  {
    icon: <Bot />,
    title: "AI-Powered Roadmaps",
    description: "Get a clear, step-by-step study plan for any course. Our AI creates a customized roadmap to keep you on track.",
  },
  {
    icon: <Code />,
    title: "Interactive Practice Quizzes",
    description: "Test your knowledge with customized quizzes. Solidify your understanding and identify areas that need more attention.",
  },
  {
    icon: <BarChart />,
    title: "24/7 AI Study Assistant",
    description: "Our AI chat is available anytime to provide instant explanations, summaries, and answers.",
  },
  {
    icon: <Clock />,
    title: "Progress Tracking",
    description: "Visualize your progress and stay motivated with our analytics dashboard.",
  },
];

const testimonials = [
  {
    name: 'Sarah L.',
    role: 'University Student',
    quote:
      "LearnWise has been a game-changer for my studies. The AI roadmaps helped me organize my learning for my toughest classes, and the practice quizzes are perfect for exam prep. I've seen a real improvement in my grades!",
    avatar: 'https://i.pravatar.cc/150?u=sarah',
  },
  {
    name: 'David C.',
    role: 'Software Development Bootcamp',
    quote:
      "The AI assistant is incredible for getting quick, accurate answers without having to sift through forums. It's accelerated my learning curve significantly.",
    avatar: 'https://i.pravatar.cc/150?u=david',
  },
  {
    name: 'Maria P.',
    role: 'Lifelong Learner',
    quote:
      "I love taking online courses, and LearnWise makes the experience so much more structured. I can finally keep track of my progress and feel confident that I'm actually retaining the information.",
    avatar: 'https://i.pravatar.cc/150?u=maria',
  },
];

const faqs = [
    {
        question: "What is LearnWise?",
        answer: "LearnWise is an AI-powered learning platform designed to help students and lifelong learners study more effectively. We provide tools like personalized study roadmaps, AI-generated quizzes, and a 24/7 AI assistant to make learning more structured, efficient, and engaging."
    },
    {
        question: "Who is LearnWise for?",
        answer: "LearnWise is for anyone who wants to learn something new or improve their study habits. This includes university and college students, high school students, professionals pursuing new skills, bootcamp students, and anyone engaged in self-study or online courses."
    },
    {
        question: "How does the AI create a study roadmap?",
        answer: "Our AI analyzes the course name and description you provide. It breaks down the subject into key concepts and logical modules, then arranges them into a structured timeline with achievable goals and milestones. It's designed to give you a clear path from start to finish."
    },
    {
        question: "Is my data secure?",
        answer: "We take data privacy and security very seriously. All your data is encrypted and stored securely. We do not share your personal information or study materials with third parties. Please refer to our Privacy Policy for more details."
    }
];

const trustedByLogos = [
  { src: 'https://tailwindui.com/img/logos/158x48/statamic-logo-white.svg', alt: 'Statamic' },
  { src: 'https://tailwindui.com/img/logos/158x48/transistor-logo-white.svg', alt: 'Transistor' },
  { src: 'https://tailwindui.com/img/logos/158x48/reform-logo-white.svg', alt: 'Reform' },
  { src: 'https://tailwindui.com/img/logos/158x48/savvycal-logo-white.svg', alt: 'SavvyCal' },
  { src: 'https://tailwindui.com/img/logos/158x48/tuple-logo-white.svg', alt: 'Tuple' },
];

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="bg-background text-foreground dark:bg-neutral-950">
      <div className="absolute top-0 -z-10 h-full w-full bg-white dark:bg-neutral-950">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(109,40,217,0.2)] opacity-50 blur-[80px]"></div>
      </div>
       <header className="absolute inset-x-0 top-0 z-50">
        <nav className="container mx-auto flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2 font-bold text-xl">
              <BrainCircuit className="h-8 w-auto text-primary" />
              <span className="text-foreground dark:text-white">LearnWise</span>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-muted-foreground"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            <Link href="#features" className="text-sm font-semibold leading-6 text-foreground dark:text-gray-300 hover:text-primary">Features</Link>
            <Link href="#pricing" className="text-sm font-semibold leading-6 text-foreground dark:text-gray-300 hover:text-primary">Pricing</Link>
            <Link href="#testimonials" className="text-sm font-semibold leading-6 text-foreground dark:text-gray-300 hover:text-primary">Testimonials</Link>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-x-6 items-center">
            <Link href="/dashboard" className="text-sm font-semibold leading-6 text-foreground dark:text-gray-300 hover:text-primary">
              Log in
            </Link>
             <Link href="/dashboard">
                <Button>Get for free</Button>
            </Link>
          </div>
        </nav>
        {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background dark:bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
            <div className="flex items-center justify-between">
                <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2 font-bold text-xl">
                    <BrainCircuit className="h-8 w-auto text-primary" />
                    <span className="text-foreground dark:text-white">LearnWise</span>
                </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/25">
                <div className="space-y-2 py-6">
                   <Link href="#features" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground dark:text-white hover:bg-muted dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                   <Link href="#pricing" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground dark:text-white hover:bg-muted dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                   <Link href="#testimonials" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground dark:text-white hover:bg-muted dark:hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Testimonials</Link>
                </div>
                <div className="py-6">
                    <Link
                        href="/dashboard"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-foreground dark:text-white hover:bg-muted dark:hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Log in
                    </Link>
                    <Link
                        href="/dashboard"
                        className="mt-4 block"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Button className="w-full">Get for free</Button>
                    </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </header>

      <main className="relative isolate overflow-hidden">
        {/* Hero */}
        <section className="container mx-auto px-6 lg:px-8 pt-32 pb-24 sm:pt-40 sm:pb-32 text-center">
            <div className="mx-auto max-w-4xl">
                 <div className="mb-8 flex justify-center">
                    <div className="relative rounded-full px-4 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-border">
                        The #1 AI-Powered Learning Platform. <Link href="#pricing" className="font-semibold text-primary ml-1">Get started for free <span aria-hidden="true">&rarr;</span></Link>
                    </div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground dark:text-white sm:text-6xl">
                    Master Any Subject with Your AI Study Partner
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    LearnWise creates personalized study plans, generates practice quizzes, and provides instant answers to your questions. Study smarter, not harder.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link href="/dashboard">
                        <Button size="lg">Get for free <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </Link>
                </div>
            </div>
             <div className="relative mt-16 flow-root sm:mt-24">
                <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <Image
                    src="https://picsum.photos/1200/600"
                    alt="App screenshot"
                    width={2432}
                    height={1442}
                    className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
                    data-ai-hint="app dashboard"
                />
                </div>
            </div>
        </section>

        {/* Logo cloud */}
        <div className="py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                 <div className="mx-auto max-w-2xl lg:max-w-none text-center">
                    <h2 className="text-lg font-semibold leading-8 text-muted-foreground">
                    Trusted by students from top universities
                    </h2>
                    <div className="mx-auto mt-10 grid grid-cols-2 items-center gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
                    {trustedByLogos.map((logo) => (
                        <Image
                        key={logo.alt}
                        className="col-span-1 max-h-12 w-full object-contain dark:invert"
                        src={logo.src.replace("-white", "-gray-400")}
                        alt={logo.alt}
                        width={158}
                        height={48}
                        />
                    ))}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Features */}
        <section id="features" className="container mx-auto px-6 lg:px-8 py-24 sm:py-32">
             <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-base font-semibold leading-7 text-primary">Features</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground dark:text-white sm:text-4xl">Everything you need to succeed</p>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">LearnWise provides a comprehensive suite of tools to supercharge your study sessions.</p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                {features.map((feature) => (
                    <div key={feature.title} className="relative pl-16">
                    <dt className="text-base font-semibold leading-7 text-foreground dark:text-white">
                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <div className="text-primary-foreground">{feature.icon}</div>
                        </div>
                        {feature.title}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-muted-foreground">{feature.description}</dd>
                    </div>
                ))}
                </dl>
            </div>
        </section>

        {/* Feature Highlight */}
        <section className="container mx-auto px-6 lg:px-8 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-16 items-center lg:grid-cols-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground dark:text-white sm:text-4xl">Personalize Your Learning Journey</h2>
                        <p className="mt-6 text-lg leading-8 text-muted-foreground">
                            Take control of your education. LearnWise adapts to your unique learning style, helping you grasp concepts faster and retain information longer.
                        </p>
                        <ul className="mt-8 space-y-4 text-muted-foreground">
                            <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-primary" />
                                <span>Tailored content for visual, auditory, and kinesthetic learners.</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-primary" />
                                <span>Adjustable difficulty for quizzes and practice problems.</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <Check className="h-5 w-5 text-primary" />
                                <span>Focus on your specific courses and subjects.</span>
                            </li>
                        </ul>
                    </div>
                     <Image
                        src="https://picsum.photos/600/500"
                        alt="Personalization illustration"
                        width={600}
                        height={500}
                        className="rounded-xl shadow-xl ring-1 ring-border"
                        data-ai-hint="learning path"
                     />
                </div>
            </div>
        </section>


        {/* Pricing */}
        <section id="pricing" className="container mx-auto px-6 lg:px-8 py-24 sm:py-32">
            <div className="mx-auto max-w-4xl text-center">
                <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
                <p className="mt-2 text-4xl font-bold tracking-tight text-foreground dark:text-white sm:text-5xl">
                    Plans that grow with you
                </p>
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground">
                Choose the plan that best fits your learning needs. All plans start with a 7-day free trial.
            </p>
            <div className="mt-16 flex justify-center">
                <div className="flex items-center gap-4">
                    <Label htmlFor="pricing-toggle" className="text-muted-foreground">Monthly</Label>
                    <Switch id="pricing-toggle" checked={isYearly} onCheckedChange={setIsYearly}/>
                    <Label htmlFor="pricing-toggle">
                        Yearly <span className="text-primary font-semibold ml-2">(-20%)</span>
                    </Label>
                </div>
            </div>

            <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl">Hobby</CardTitle>
                        <CardDescription>A great start for casual learners and to explore our core features.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight">${isYearly ? "8" : "10"}</span>
                            <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
                        </div>
                         <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />5 Courses</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />20 Quiz Generations / mo</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Standard AI Chat</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                         <Button asChild variant="outline" className="w-full">
                            <Link href="/dashboard">Choose plan</Link>
                         </Button>
                    </CardFooter>
                </Card>
                 <Card className="flex flex-col border-2 border-primary">
                    <CardHeader>
                        <div className="flex justify-between">
                            <CardTitle className="text-xl">Pro</CardTitle>
                            <div className="text-xs font-semibold py-1 px-3 bg-primary text-primary-foreground rounded-full">Most Popular</div>
                        </div>
                        <CardDescription>For dedicated students who want to unlock their full potential.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight">${isYearly ? "16" : "20"}</span>
                            <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
                        </div>
                         <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Unlimited Courses</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Unlimited Quiz Generations</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Advanced AI Chat with course context</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Priority Support</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                         <Button asChild className="w-full">
                            <Link href="/dashboard">Choose plan</Link>
                         </Button>
                    </CardFooter>
                </Card>
                 <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl">Team</CardTitle>
                        <CardDescription>Perfect for study groups, classrooms, and tutoring centers.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="flex items-baseline gap-x-1">
                             <span className="text-4xl font-bold tracking-tight">${isYearly ? "60" : "75"}</span>
                            <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
                        </div>
                         <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Up to 10 users</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />All Pro features</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Collaborative tools & dashboard</li>
                        </ul>
                    </CardContent>
                     <CardFooter>
                         <Button asChild variant="outline" className="w-full">
                            <Link href="/dashboard">Choose plan</Link>
                         </Button>
                    </CardFooter>
                </Card>
            </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="container mx-auto px-6 lg:px-8 py-24 sm:py-32">
             <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground dark:text-white sm:text-4xl">What Our Users Are Saying</h2>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                We've helped thousands of students achieve their academic goals.
                </p>
            </div>
            <div className="mx-auto mt-16 flow-root sm:mt-24">
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
                    {testimonials.map((testimonial, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                 <div className="flex space-x-1 mb-4">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)}
                                </div>
                                <p className="text-muted-foreground">"{testimonial.quote}"</p>
                            </CardContent>
                            <CardHeader className="flex-row gap-4 items-center pt-0">
                                <Image
                                    className="w-12 h-12 rounded-full"
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    width={48}
                                    height={48}
                                />
                                 <div>
                                    <p className="font-semibold text-foreground dark:text-white">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
        
        {/* FAQs */}
        <section className="container mx-auto px-6 lg:px-8 py-24 sm:py-32">
             <div className="mx-auto max-w-4xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground dark:text-white sm:text-4xl">Frequently Asked Questions</h2>
            </div>
            <div className="mx-auto mt-16 max-w-4xl">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border-b">
                            <AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pt-2">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 lg:px-8 py-24 sm:py-32">
            <div className="relative isolate overflow-hidden bg-primary/10 dark:bg-primary/20 px-6 pt-16 shadow-2xl rounded-2xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
                 <div className="absolute -top-4 -z-10 h-full w-full bg-background/50 dark:bg-neutral-950/50">
                    <div className="gradient-background"></div>
                </div>
                <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground dark:text-white sm:text-4xl">
                        Ready to supercharge your learning?
                    </h2>
                     <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Join LearnWise today and start your journey towards academic excellence. Your free trial is just a click away.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                        <Link href="/dashboard">
                            <Button size="lg">Get for free</Button>
                        </Link>
                    </div>
                </div>
                 <div className="relative mt-16 h-80 lg:mt-8">
                    <Image
                        className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
                        src="https://picsum.photos/1200/601"
                        alt="App screenshot"
                        width={1824}
                        height={1080}
                        data-ai-hint="app dashboard"
                    />
                </div>
            </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
            <div className="flex justify-center space-x-6 md:order-2">
                <p className="text-center text-xs leading-5 text-muted-foreground">
                    &copy; {new Date().getFullYear()} LearnWise. All rights reserved.
                </p>
            </div>
             <div className="mt-8 md:order-1 md:mt-0">
                <Link href="/" className="-m-1.5 p-1.5 flex items-center justify-center gap-2 font-bold text-xl">
                    <BrainCircuit className="h-8 w-auto text-primary" />
                    <span className="text-foreground dark:text-white">LearnWise</span>
                </Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
