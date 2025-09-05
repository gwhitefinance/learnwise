
"use client";

import Button from "@/sections/Button";
import Image from "next/image";
import Pointer from "@/sections/Pointer";
import { motion, useAnimate } from "framer-motion";
import { useEffect } from "react";


export default function Hero() {
    const [leftDesignScope, leftDesignAnimate] = useAnimate();
    const [leftPointerScope, leftPointerAnimate] = useAnimate();

    const [rightDesignScope, rightDesignAnimate] = useAnimate();
    const [rightPointerScope, rightPointerAnimate] = useAnimate();

    useEffect(() => {
        leftDesignAnimate([
            [leftDesignScope.current, { opacity: 1 }, { duration: 0.5 }],
            [leftDesignScope.current, { y: 0, x: 0 }, { duration: 0.5 }],
        ]);

        leftPointerAnimate([
            [leftPointerScope.current, { opacity: 1 }, { duration: 0.5 }],
            [leftPointerScope.current, { y: 0, x: -100 }, { duration: 0.5 }],
            [
                leftPointerScope.current,
                { y: [0, 16, 0], x: 0 },
                { duration: 0.5, ease: "easeInOut" },
            ],
        ]);

        rightDesignAnimate([
            [
                rightDesignScope.current,
                { opacity: 1 },
                { duration: 0.5, delay: 1.5 },
            ],
            [rightDesignScope.current, { y: 0, x: 0 }, { duration: 0.5 }],
        ]);

        rightPointerAnimate([
            [
                rightPointerScope.current,
                { opacity: 1 },
                { duration: 0.5, delay: 1.5 },
            ],
            [rightPointerScope.current, { y: 0, x: 175 }, { duration: 0.5 }],
            [
                rightPointerScope.current,
                { y: [0, 20, 0], x: 0 },
                { duration: 0.5, ease: "easeInOut" },
            ],
        ]);
    }, []);

    return (
        <section
            className="py-24 overflow-x-clip"
        >
            <div className="container relative ">
                <motion.div
                    ref={leftDesignScope}
                    initial={{ opacity: 0, y: 100, x: -100 }}
                    className="absolute -left-32 top-16 hidden lg:block"
                    drag
                >
                    <Image
                        draggable={false}
                        src="https://nextjs-saas-landing-page-five.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fdesign-example-1.cc8b90ac.png&w=640&q=75"
                        alt="design example 1"
                        data-ai-hint="abstract design"
                        width={350}
                        height={350}
                    />
                </motion.div>
                <motion.div
                    ref={leftPointerScope}
                    initial={{ opacity: 0, y: 100, x: -200 }}
                    className="absolute top-96 left-56 hidden lg:block"
                >
                    <Pointer name="Andrea" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 100, x: 100 }}
                    ref={rightDesignScope}
                    className="absolute -right-64 -top-16 hidden lg:block"
                    drag
                >
                    <Image
                        draggable={false}
                        src="https://nextjs-saas-landing-page-five.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fdesign-example-2.d0f5f16d.png&w=1080&q=75"
                        alt="design example 2"
                        data-ai-hint="modern design"
                        width={400}
                        height={400}
                    />
                </motion.div>
                <motion.div
                    ref={rightPointerScope}
                    initial={{ opacity: 0, x: 275, y: 100 }}
                    className="absolute -top-4 right-80 hidden lg:block"
                >
                    <Pointer color="red" name="Brew" />
                </motion.div>

                <div className="flex justify-center">
                    <div className="inline-flex py-1 px-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full text-neutral-950 font-semibold">
                        ✨ $7.5M eed round raised
                    </div>
                </div>
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-medium text-center mt-6 ">
                    Impactful design, created effortlessly
                </h1>
                <p className="text-center text-xl text-white/50 mt-8 max-w-2xl mx-auto">
                    Design tool shouldn't slow you down. Create, prototype, and
                    test with ease.
                </p>
                <form className="mx-auto flex border border-white/50 rounded-full p-2 mt-8 max-w-lg">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="bg-transparent px-4 flex-1 w-full"
                    />
                    <Button
                        size="sm"
                        className="whitespace-nowrap"
                        type="submit"
                        variant="primary"
                    >
                        Sign Up
                    </Button>
                </form>
            </div>
        </section>
    );
}
