
"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function CallToAction() {
    return (
        <section className="py-24">
            <div className="container text-center">
                 <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white max-w-2xl mx-auto">
                    Ready to Revolutionize Your Learning?
                </h2>
                <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
                    Stop drowning in notes and start understanding. Get your personal AI tutor today.
                </p>
                <div className="mt-8">
                     <Link href="/signup">
                        <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-full text-base">
                            Get Started - It's Free
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
