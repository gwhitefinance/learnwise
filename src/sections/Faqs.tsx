'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is LearnWise?',
    answer:
      'LearnWise is an AI-powered learning platform that helps you study more effectively. It creates personalized study plans, generates quizzes, and answers your questions to help you master any subject.',
  },
  {
    question: 'How does the AI personalization work?',
    answer:
      'Our AI analyzes your learning style, course materials, and upcoming tests to create a study plan tailored to you. It suggests the best resources and activities to help you learn and retain information.',
  },
  {
    question: 'What kind of documents can I upload?',
    answer:
      'You can upload PDFs, Word documents, and other text-based files. Our AI will analyze the content and extract key concepts to help you study.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes, we offer a free plan with limited features so you can try out LearnWise. You can upgrade to a paid plan at any time to unlock more features and unlimited access.',
  },
];

const Faqs = () => {
  return (
    <section id="faqs" className="py-20 md:py-32">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
            Frequently Asked Questions
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-lg font-medium text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default Faqs;
