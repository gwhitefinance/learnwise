
"use client";

import { motion } from "framer-motion";
import React from "react";
import Image from "next/image";

const logos = [
    {
        name: "Google",
        src: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
        hint: "company logo"
    },
    {
        name: "Microsoft",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1200px-Microsoft_logo.svg.png",
        hint: "tech company"
    },
    {
        name: "Coursera",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Coursera-Logo_600x600.svg/1200px-Coursera-Logo_600x600.svg.png",
        hint: "online learning"
    },
    {
        name: "MIT",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/1200px-MIT_logo.svg.png",
        hint: "modern logo"
    },
    {
        name: "Slack",
        src: "https://cdn.freebiesupply.com/logos/large/2x/slack-logo-icon.png",
        hint: "communication tool"
    },
];

export default function LogoTicker() {
    return (
        <section className="py-24 overflow-x-clip">
            <div className="container">
                <h3 className="text-center text-white/50 text-xl">
                    For students, professionals, and lifelong learners
                </h3>
                <div className="flex overflow-hidden mt-12 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                    <motion.div
                        animate={{
                            x: "-50%",
                        }}
                        transition={{
                            duration: 40,
                            ease: "linear",
                            repeat: Infinity,
                        }}
                        className="flex gap-16 pr-16 items-center flex-none"
                    >
                        {Array.from({ length: 2 }).map((_, i) => (
                            <React.Fragment key={i}>
                                {logos.map((logo) => (
                                    <div
                                        key={logo.name}
                                        className="flex-shrink-0"
                                    >
                                        <Image
                                          src={logo.src}
                                          alt={`${logo.name} logo`}
                                          width={150}
                                          height={50}
                                          className="object-contain h-12 w-auto"
                                          data-ai-hint={logo.hint}
                                        />
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
