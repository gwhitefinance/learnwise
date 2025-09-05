'use client';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="border-t border-border">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">LearnWise</span>
            </Link>
            <p className="text-muted-foreground">
              The future of personalized learning.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <div className="flex flex-col gap-2">
              <Link href="#features">
                <Button variant="link" className="p-0 h-auto">Features</Button>
              </Link>
              <Link href="#integrations">
                <Button variant="link" className="p-0 h-auto">Integrations</Button>
              </Link>
              <Link href="#faqs">
                <Button variant="link" className="p-0 h-auto">FAQs</Button>
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <div className="flex flex-col gap-2">
              <Link href="#">
                <Button variant="link" className="p-0 h-auto">About</Button>
              </Link>
              <Link href="#">
                <Button variant="link" className="p-0 h-auto">Careers</Button>
              </Link>
              <Link href="#">
                <Button variant="link" className="p-0 h-auto">Contact</Button>
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link href="#">
                <Button variant="link" className="p-0 h-auto">Privacy Policy</Button>
              </Link>
              <Link href="#">
                <Button variant="link" className="p-0 h-auto">Terms of Service</Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} LearnWise. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
