"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import React from "react";

const logos = [
    { name: "Quantum", image: "/assets/images/quantum.svg" },
    { name: "Acme Corp", image: "/assets/images/acme-corp.svg" },
    { name: "Echo Valley", image: "/assets/images/echo-valley.svg" },
    { name: "Pulse", image: "/assets/images/pulse.svg" },
    { name: "Outside", image: "/assets/images/outside.svg" },
    { name: "Apex", image: "/assets/images/apex.svg" },
    { name: "Celestial", image: "/assets/images/celestial.svg" },
    { name: "Twice", image: "/assets/images/twice.svg" },
];

export default function LogoTicker() {
    return (
        <section className="py-24 overflow-x-clip">
            <div className="container">
                <h3 className="text-center text-white/50 text-xl">
                    Already chosen by these market leaders
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
                        className="flex gap-24 pr-24 "
                    >
                        {Array.from({ length: 2 }).map((_, i) => (
                            <React.Fragment key={i}>
                                {logos.map((each) => (
                                    <Image
                                        src={each.image}
                                        alt={each.name}
                                        key={each.name}
                                        width={150}
                                        height={40}
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