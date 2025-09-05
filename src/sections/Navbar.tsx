'use client';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Menu } from 'lucide-react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <div className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
      <div className="container flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">LearnWise</span>
        </Link>
        <nav className="hidden md:flex gap-4">
          <Link href="#features">
            <Button variant="ghost">Features</Button>
          </Link>
          <Link href="#integrations">
            <Button variant="ghost">Integrations</Button>
          </Link>
          <Link href="#faqs">
            <Button variant="ghost">FAQs</Button>
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline">Sign in</Button>
          </Link>
          <Link href="/dashboard">
            <Button>Get Started</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
