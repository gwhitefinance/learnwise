
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Button from "@/sections/Button";

const navLinks = [
    { label: "Home", href: "/" },
    { label: "Features", href: "#features" },
    { label: "Integrations", href: "#integrations" },
    { label: "FAQs", href: "#faqs" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <section className="py-4 lg:py-8 fixed w-full top-0 z-50 ">
                <div className="container max-w-5xl">
                    <div className="border border-white/15 rounded-[27px] lg:rounded-full bg-neutral-950/70 backdrop-blur">
                        <figure className="grid grid-cols-2 lg:grid-cols-3  py-2 lg:px-2 px-4  items-center ">
                            <div>
                                <Link href="/" className="flex items-center gap-2">
                                   <Image
                                        src="https://tailwindui.com/img/logos/mark.svg?color=lime&shade=400"
                                        alt="layer logo"
                                        className="h-9 w-auto md:h-auto"
                                        width={100}
                                        height={36}
                                    />
                                </Link>
                            </div>
                            <div className="hidden lg:flex justify-center items-center ">
                                <nav className="flex gap-6 font-medium ">
                                    {navLinks.map((each) => (
                                        <a href={each.href} key={each.href}>
                                            {each.label}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="lg:hidden"
                                >
                                    {!isOpen ? (
                                        <motion.div
                                            initial={{ opacity: 1 }}
                                            animate={{
                                                opacity: isOpen ? 0 : 1,
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Menu
                                                className="text-white"
                                                size={30}
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{
                                                opacity: isOpen ? 1 : 0,
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <X
                                                className="text-white"
                                                size={30}
                                            />
                                        </motion.div>
                                    )}
                                </button>
                                <Link href="/dashboard" className="hidden lg:inline-flex items-center">
                                    <Button
                                        variant="secondary"
                                    >
                                        Login
                                    </Button>
                                </Link>
                                 <Link href="/dashboard" className="hidden lg:inline-flex items-center">
                                    <Button
                                        variant="primary"
                                    >
                                        Signup
                                    </Button>
                                </Link>
                            </div>
                        </figure>

                        <AnimatePresence>
                            {isOpen && (
                                <motion.figure
                                    initial={{ height: 0 }}
                                    animate={{ height: "auto" }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden lg:hidden"
                                >
                                    <div className="flex flex-col items-center gap-4 py-4">
                                        {navLinks.map((link) => (
                                            <a key={link.href} href={link.href}>
                                                {link.label}
                                            </a>
                                        ))}
                                        <Link href="/dashboard" className="w-3/4">
                                            <Button
                                                className="w-full"
                                                variant="secondary"
                                            >
                                                Log In
                                            </Button>
                                        </Link>
                                         <Link href="/dashboard" className="w-3/4">
                                            <Button
                                                className="w-full"
                                                variant="primary"
                                            >
                                                Sign Up
                                            </Button>
                                        </Link>
                                    </div>
                                </motion.figure>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>
            <div className="pb-[86px] md:pb-[98px]"></div>
        </>
    );
}
