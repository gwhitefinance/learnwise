
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, Check, Menu, X, Star } from 'lucide-react';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const features = [
  {
    title: 'AI-Powered Roadmaps',
    description:
      'Get a clear, step-by-step study plan for any course. Our AI analyzes the subject matter and creates a customized roadmap with goals and milestones to keep you on track, ensuring you cover all essential topics efficiently.',
    items: [
      'Personalized learning paths',
      'Milestone tracking and progress visualization',
      'Adaptive recommendations based on your pace',
    ],
    image: 'https://picsum.photos/600/500?v=1',
    image_alt: 'AI-Powered Roadmaps illustration',
    image_hint: 'learning plan'
  },
  {
    title: 'Interactive Practice Quizzes',
    description:
      "Test your knowledge with customized quizzes on any topic, at any difficulty level. Solidify your understanding and identify areas that need more attention with instant feedback and detailed explanations.",
    items: [
      'Multiple question types (MCQ, T/F, Short Answer)',
      'Adjustable difficulty levels (Easy, Medium, Hard)',
      'Instant scoring and answer explanations',
    ],
    image: 'https://picsum.photos/600/500?v=2',
    image_alt: 'Practice Quizzes illustration',
    image_hint: 'quiz exam'
  },
  {
    title: '24/7 AI Study Assistant',
    description:
      "Have a question? Our AI chat is available anytime to provide instant explanations, summaries, and answers. It's like having a personal tutor ready to help whenever you're stuck.",
    items: [
      'Context-aware answers based on your course material',
      'Summarization of long texts and articles',
      'Multi-language support for diverse learners',
    ],
    image: 'https://picsum.photos/600/500?v=3',
    image_alt: 'AI Study Assistant illustration',
    image_hint: 'chatbot assistant'
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
      "As someone learning to code, I have a million questions a day. The AI assistant is incredible for getting quick, accurate answers without having to sift through forums. It's accelerated my learning curve significantly.",
    avatar: 'https://i.pravatar.cc/150?u=david',
  },
  {
    name: 'Maria P.',
    role: 'Lifelong Learner',
    quote:
      "I love taking online courses, and LearnWise makes the experience so much more structured. I can finally keep track of my progress across different subjects and feel confident that I'm actually retaining the information.",
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
        question: "Can I use LearnWise for any subject?",
        answer: "Yes! Our AI is trained on a vast range of topics and can generate study plans and quizzes for almost any subject, from academic disciplines like math and history to practical skills like programming and design."
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

  return (
    <div className="bg-background text-foreground isolate">
       <header className="absolute inset-x-0 top-0 z-50">
        <nav className="container mx-auto flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2 font-bold text-xl">
              <BrainCircuit className="h-8 w-auto text-primary" />
              <span className="text-white">LearnWise</span>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            <Link href="#features" className="text-sm font-semibold leading-6 text-white">Features</Link>
            <Link href="#pricing" className="text-sm font-semibold leading-6 text-white">Pricing</Link>
            <Link href="#testimonials" className="text-sm font-semibold leading-6 text-white">Testimonials</Link>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-x-6 items-center">
            <Link href="/dashboard" className="text-sm font-semibold leading-6 text-white">
              Log in
            </Link>
             <Link href="/dashboard">
                <Button>Get started free <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </nav>
        {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
            <div className="flex items-center justify-between">
                <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2 font-bold text-xl">
                    <BrainCircuit className="h-8 w-auto text-primary" />
                    <span className="text-white">LearnWise</span>
                </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/25">
                <div className="space-y-2 py-6">
                   <Link href="#features" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                   <Link href="#pricing" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                   <Link href="#testimonials" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800" onClick={() => setMobileMenuOpen(false)}>Testimonials</Link>
                </div>
                <div className="py-6">
                    <Link
                        href="/dashboard"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Log in
                    </Link>
                    <Link
                        href="/dashboard"
                        className="mt-4 block"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Button className="w-full">Get started free</Button>
                    </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </header>

      <main className="relative">
        {/* Hero */}
        <div className="relative isolate overflow-hidden pt-14">
            <div className="absolute inset-0 -z-10 bg-gray-900">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                    <div
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#8085ff] to-[#4338ca] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                        style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>
            </div>

          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                 Master Any Subject in Record Time
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                The #1 AI-powered learning platform for students, professionals, and lifelong learners. Stop cramming, start understanding.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                    <Link href="/dashboard">
                        <Button size="lg">Get started free</Button>
                    </Link>
                </div>
            </div>
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
                 <Image
                    src="https://picsum.photos/800/600"
                    alt="App screenshot"
                    width={800}
                    height={600}
                    className="rounded-lg shadow-xl"
                    data-ai-hint="app screenshot"
                  />
            </div>
          </div>
        </div>

        {/* Logo cloud */}
        <div className="bg-gray-900 py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:max-w-none">
                    <h2 className="text-center text-lg font-semibold leading-8 text-white">
                    Trusted by students from top universities
                    </h2>
                    <div className="mx-auto mt-10 grid grid-cols-2 items-center gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
                    {trustedByLogos.map((logo) => (
                        <Image
                        key={logo.alt}
                        className="col-span-1 max-h-12 w-full object-contain"
                        src={logo.src}
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
        <div id="features" className="bg-background py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`flex flex-col-reverse lg:grid lg:grid-cols-2 lg:items-center lg:gap-x-16 ${
                  index !== 0 ? 'mt-24 sm:mt-32' : ''
                }`}
              >
                <div
                  className={`mt-12 lg:mt-0 lg:pr-4 ${
                    index % 2 === 0 ? 'lg:col-start-1' : 'lg:col-start-2'
                  }`}
                >
                  <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{feature.title}</h2>
                  <p className="mt-6 text-lg leading-8 text-muted-foreground">{feature.description}</p>
                  <dl className="mt-10 max-w-xl space-y-4 text-base leading-7 text-muted-foreground lg:max-w-none">
                    {feature.items.map((item) => (
                      <div key={item} className="relative pl-9">
                        <dt className="inline font-semibold text-foreground">
                          <Check className="absolute left-1 top-1 h-5 w-5 text-primary" aria-hidden="true" />
                        </dt>
                        <dd className="inline">{item}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div
                  className={`flex items-start ${
                    index % 2 === 0 ? 'lg:col-start-2' : 'lg:col-start-1 lg:row-start-1'
                  }`}
                >
                  <Image
                    src={feature.image}
                    alt={feature.image_alt}
                    className="rounded-xl shadow-xl ring-1 ring-gray-400/10"
                    width={600}
                    height={500}
                    data-ai-hint={feature.image_hint}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div id="pricing" className="bg-gray-900 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
                <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    Pricing plans for every student
                </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-300">
                Choose the plan that best fits your learning needs. All plans start with a 7-day free trial.
                </p>
                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col justify-between rounded-3xl bg-background p-8 ring-1 ring-gray-200/10 xl:p-10">
                    <div>
                        <div className="flex items-center justify-between gap-x-4">
                            <h3 className="text-lg font-semibold leading-8 text-foreground">Hobby</h3>
                            {/* <p className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-400">Most popular</p> */}
                        </div>
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">A great start for casual learners and to explore our core features.</p>
                        <p className="mt-6 flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight text-foreground">$10</span>
                            <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
                        </p>
                        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />5 Courses</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />20 Quiz Generations / mo</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Standard AI Chat</li>
                        </ul>
                    </div>
                    <Button variant="outline" className="mt-8">Get started</Button>
                </div>

                <div className="flex flex-col justify-between rounded-3xl bg-background p-8 ring-2 ring-primary xl:p-10">
                    <div>
                        <div className="flex items-center justify-between gap-x-4">
                            <h3 className="text-lg font-semibold leading-8 text-foreground">Pro</h3>
                             <p className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">Most popular</p>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">For dedicated students who want to unlock their full potential.</p>
                        <p className="mt-6 flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight text-foreground">$20</span>
                            <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
                        </p>
                        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Unlimited Courses</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Unlimited Quiz Generations</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Advanced AI Chat with course context</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Priority Support</li>
                        </ul>
                    </div>
                    <Button className="mt-8">Get started</Button>
                </div>

                <div className="flex flex-col justify-between rounded-3xl bg-background p-8 ring-1 ring-gray-200/10 xl:p-10">
                    <div>
                        <div className="flex items-center justify-between gap-x-4">
                            <h3 className="text-lg font-semibold leading-8 text-foreground">Team</h3>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">Perfect for study groups, classrooms, and tutoring centers.</p>
                        <p className="mt-6 flex items-baseline gap-x-1">
                            <span className="text-4xl font-bold tracking-tight text-foreground">$75</span>
                            <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
                        </p>
                        <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Up to 10 users</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />All Pro features</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Collaborative tools</li>
                            <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />Admin dashboard</li>
                        </ul>
                    </div>
                     <Button variant="outline" className="mt-8">Get started</Button>
                </div>
                </div>
            </div>
        </div>

        {/* Testimonials */}
        <div id="testimonials" className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                 <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">What Our Users Are Saying</h2>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    We've helped thousands of students achieve their academic goals.
                    </p>
                </div>
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 lg:max-w-none lg:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => (
                    <Card key={testimonial.name} className="flex flex-col">
                        <CardContent className="flex-auto p-6">
                            <div className="flex text-yellow-400 mb-2">
                                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
                            </div>
                            <p className="text-base leading-7 text-muted-foreground">"{testimonial.quote}"</p>
                        </CardContent>
                        <CardHeader className="flex flex-row items-center gap-x-4 p-6 pt-0 mt-auto">
                            <Image
                            className="h-12 w-12 flex-none rounded-full bg-gray-50"
                            src={testimonial.avatar}
                            alt=""
                            width={48}
                            height={48}
                            />
                            <div>
                            <CardTitle className="text-base font-semibold">{testimonial.name}</CardTitle>
                            <CardDescription>{testimonial.role}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
                </div>
            </div>
        </div>
        
        {/* FAQs */}
        <div className="bg-gray-900 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Frequently Asked Questions</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-300">
                    Have questions? We have answers. If you can't find what you're looking for, feel free to contact us.
                    </p>
                </div>
                <div className="mt-16 max-w-4xl mx-auto">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-700 py-4">
                                <AccordionTrigger className="text-white text-left hover:no-underline">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-gray-300 pt-2">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>

        {/* CTA */}
        <div className="bg-background">
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl rounded-3xl sm:px-16">
                    <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Ready to supercharge your learning?
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
                        Join LearnWise today and start your journey towards academic excellence. Your free trial is just a click away.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                         <Link href="/dashboard">
                            <Button size="lg">Get started free</Button>
                        </Link>
                    </div>
                    <div className="absolute inset-x-0 -top-16 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl" aria-hidden="true">
                        <div
                        className="aspect-[1318/752] w-[82.375rem] flex-none bg-gradient-to-r from-[#8085ff] to-[#4338ca] opacity-25"
                        style={{
                            clipPath:
                            'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
                        }}
                        />
                    </div>
                </div>
            </div>
        </div>

      </main>

      <footer className="bg-gray-900" aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
            <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                <div className="space-y-8">
                     <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <BrainCircuit className="h-8 w-auto text-primary" />
                        <span className="text-white">LearnWise</span>
                    </Link>
                    <p className="text-sm leading-6 text-gray-300">
                    The AI-powered learning platform to help you study smarter, not harder.
                    </p>
                </div>
                 <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                    <div className="md:grid md:grid-cols-2 md:gap-8">
                        <div>
                            <h3 className="text-sm font-semibold leading-6 text-white">Solutions</h3>
                            <ul role="list" className="mt-6 space-y-4">
                                <li><a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Roadmaps</a></li>
                                <li><a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Quizzes</a></li>
                                <li><a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">AI Chat</a></li>
                                <li><a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Analytics</a></li>
                            </ul>
                        </div>
                        <div className="mt-10 md:mt-0">
                            <h3 className="text-sm font-semibold leading-6 text-white">Support</h3>
                             <ul role="list" className="mt-6 space-y-4">
                                <li><a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Pricing</a></li>
                                <li><a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Documentation</a></li>
                                <li><a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Contact Us</a></li>
                            </ul>
                        </div>
                    </div>
                     <div className="md:grid md:grid-cols-2 md:gap-8">
                        <div>
                             <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                             <ul role="list" className="mt-6 space-y-4">
                                <li><a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">About</a></li>
                                <li><a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Blog</a></li>
                                <li><a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Careers</a></li>
                            </ul>
                        </div>
                         <div className="mt-10 md:mt-0">
                            <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
                             <ul role="list" className="mt-6 space-y-4">
                                <li><a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Privacy</a></li>
                                <li><a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
                 <p className="text-xs leading-5 text-gray-400">&copy; {new Date().getFullYear()} LearnWise. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}
