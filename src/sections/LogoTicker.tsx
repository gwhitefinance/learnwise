
"use client";

import { motion } from "framer-motion";
import React from "react";
import Image from "next/image";

const universities = [
    {
        name: "Harvard University",
        src: "https://picsum.photos/150/50?random=1",
        hint: "university building"
    },
    {
        name: "Stanford University",
        src: "https://picsum.photos/150/50?random=2",
        hint: "campus view"
    },
    {
        name: "MIT",
        src: "https://picsum.photos/150/50?random=3",
        hint: "modern architecture"
    },
    {
        name: "University of Oxford",
        src: "https://picsum.photos/150/50?random=4",
        hint: "historic university"
    },
    {
        name: "University of Cambridge",
        src: "https://picsum.photos/150/50?random=5",
        hint: "college crest"
    },
    {
        name: "Caltech",
        src: "https://picsum.photos/150/50?random=6",
        hint: "science lab"
    },
    {
        name: "ETH Zurich",
        src: "https://picsum.photos/150/50?random=7",
        hint: "swiss university"
    },
    {
        name: "UCL",
        src: "https://picsum.photos/150/50?random=8",
        hint: "london university"
    },
];

export default function LogoTicker() {
    return (
        <section className="py-24 overflow-x-clip">
            <div className="container">
                <h3 className="text-center text-white/50 text-xl">
                    Trusted by top universities
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
                                {universities.map((uni) => (
                                    <div
                                        key={uni.name}
                                        className="flex-shrink-0"
                                    >
                                        <Image
                                          src={uni.src}
                                          alt={`${uni.name} logo`}
                                          width={150}
                                          height={50}
                                          className="object-contain"
                                          data-ai-hint={uni.hint}
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
