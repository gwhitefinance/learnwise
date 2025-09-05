
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import React from "react";

const logos = [
    { name: "Harvard University", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Harvard_University_logo.svg/200px-Harvard_University_logo.svg.png" },
    { name: "Stanford University", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Stanford_University_logo_2013.svg/200px-Stanford_University_logo_2013.svg.png" },
    { name: "MIT", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/200px-MIT_logo.svg.png" },
    { name: "University of Oxford", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/200px-Oxford-University-Circlet.svg.png" },
    { name: "University of Cambridge", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Cambridge_University_crest.svg/200px-Cambridge_University_crest.svg.png" },
    { name: "Caltech", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Caltech_logo.svg/200px-Caltech_logo.svg.png" },
    { name: "ETH Zurich", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/ETH_Zurich_logo_2015.svg/200px-ETH_Zurich_logo_2015.svg.png" },
    { name: "UCL", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/University_College_London_logo.svg/200px-University_College_London_logo.svg.png" },
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
                            duration: 30,
                            ease: "linear",
                            repeat: Infinity,
                        }}
                        className="flex gap-24 pr-24 items-center"
                    >
                        {Array.from({ length: 2 }).map((_, i) => (
                            <React.Fragment key={i}>
                                {logos.map((each) => (
                                    <Image
                                        src={each.image}
                                        alt={each.name}
                                        key={each.name}
                                        width={120}
                                        height={40}
                                        className="object-contain"
                                    />
                                ))}
                            </React.Fragment>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
