
'use client';

import { ArrowRight, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { Button } from "@/components/ui/button";
import SplineScene from "@/components/ui/spline-scene";

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-98px)] flex items-center justify-center overflow-hidden bg-black">
      <div className="container mx-auto px-4">
        <Card className="w-full h-auto md:h-[500px] bg-black/[0.96] relative overflow-hidden border-none flex flex-col md:flex-row">
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

          {/* Left content */}
          <div className="flex-1 p-8 relative z-10 flex flex-col justify-center text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text">
              Results and Costs Reduced by AI
            </h1>
            <p className="mt-4 text-neutral-300 max-w-lg mx-auto md:mx-0">
              We help businesses automate workflows, build intelligent chatbots, and integrate AI agents that work
              24/7 to boost productivity and drive growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center md:justify-start">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                Book Free Consultation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-neutral-600 text-neutral-300 hover:bg-neutral-800 bg-transparent"
              >
                View Case Studies
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 sm:gap-8 text-sm text-neutral-400 mt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>30-Day ROI Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1 relative h-64 md:h-full w-full">
            <SplineScene
              scene="https://prod.spline.design/UbM7F-HZcyTbZ4y3/scene.splinecode"
              className="w-full h-full"
            />
          </div>
        </Card>
      </div>
    </section>
  );
}
