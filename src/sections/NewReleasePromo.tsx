
"use client"

import { Globe, ArrowRight } from "lucide-react";

export default function NewReleasePromo() {
  return (
    <section className="mt-12 w-full">
      <div className="mx-auto max-w-4xl rounded-[40px] border border-black/5 dark:border-white/20 p-2 shadow-sm">
        <div className="relative mx-auto h-[400px] max-w-4xl overflow-hidden rounded-[38px] border border-black/5 dark:border-white/20 bg-primary p-2 shadow-sm">
          {/* Subtle radial glow from center */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255, 64, 23, 0.1), transparent 70%)",
            }}
          />

          {/* Film grain overlay */}
          <div
            className="absolute inset-0 z-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10">
            <div className="mt-8 text-center">
              <h2 className="text-4xl font-bold text-white mb-4" dangerouslySetInnerHTML={{ __html: "Reach your full study potential<br> with LearnWise" }}></h2>
              <p className="text-lg text-white/80">Start for free</p>
              
              {/* Arrow SVG */}
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto text-white/80 mt-2">
                <path d="M12 5V19M12 19L18 13M12 19L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>

              {/* Stylized button with border effect */}
              <div className="flex items-center justify-center">
                <a href="/signup">
                  <div className="group border-border bg-secondary/70 flex h-[64px] cursor-pointer items-center gap-2 rounded-full border p-[11px] mt-4">
                    <div className="border-border bg-primary flex h-[43px] items-center justify-center rounded-full border">
                      <p className="mr-3 ml-2 flex items-center justify-center gap-2 font-medium tracking-tight text-white">
                        Get started for free
                      </p>
                    </div>
                    <div className="border-border flex size-[26px] items-center justify-center rounded-full border-2 transition-all ease-in-out group-hover:ml-2">
                      <ArrowRight className="lucide lucide-arrow-right transition-all ease-in-out group-hover:rotate-45" />
                    </div>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
