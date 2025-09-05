
"use client";

import { motion } from "framer-motion";
import React from "react";
import Image from "next/image";

const universities = [
    {
        name: "Harvard University",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Harvard_shield.svg/1200px-Harvard_shield.svg.png",
        hint: "university shield"
    },
    {
        name: "Stanford University",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Stanford_Cardinal_logo.svg/1200px-Stanford_Cardinal_logo.svg.png",
        hint: "tree logo"
    },
    {
        name: "MIT",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/1200px-MIT_logo.svg.png",
        hint: "modern logo"
    },
    {
        name: "University of Oxford",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/1200px-Oxford-University-Circlet.svg.png",
        hint: "historic university"
    },
    {
        name: "University of Cambridge",
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Cambridge_University_shield.svg/1200px-Cambridge_University_shield.svg.png",
        hint: "college crest"
    },
    {
        name: "Caltech",
        src: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/California_Institute_of_Technology_seal.svg/1200px-California_Institute_of_Technology_seal.svg.png",
        hint: "science seal"
    },
    {
        name: "ETH Zurich",
        src: "https://upload.wikimedia.org/wikipedia/en/thumb/4/49/ETH_Zurich_logo.svg/1200px-ETH_Zurich_logo.svg.png",
        hint: "swiss university"
    },
    {
        name: "UCL",
        src: "https://upload.wikimedia.org/wikipedia/en/thumb/0/01/University_College_London_logo.svg/1200px-University_College_London_logo.svg.png",
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
                                          className="object-contain h-12 w-auto"
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
