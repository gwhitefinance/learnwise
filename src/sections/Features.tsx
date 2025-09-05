'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, GitMerge, Lightbulb, FileText, Bot } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: GitMerge,
    title: 'AI Study Plan Generation',
    description: 'Personalized study plans based on your learning style and upcoming tests.',
  },
  {
    icon: Lightbulb,
    title: 'Custom Quiz Generation',
    description: 'Create quizzes tailored to your learning style and specific topics.',
  },
  {
    icon: FileText,
    title: 'Document Analysis',
    description: 'Upload your documents and get key concepts extracted by AI.',
  },
  {
    icon: Bot,
    title: 'Personalized AI Chat',
    description: 'Get instant answers and explanations from your AI study partner.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <div className="text-primary font-semibold text-lg mb-2">
            Features
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
            Everything You Need to Succeed
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-card/50">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
