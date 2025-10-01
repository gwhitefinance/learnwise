
"use client";

import { BrainCircuit } from "lucide-react";
import Link from "next/link";

const footerLinks = [
    { href: "#", label: "Contact" },
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Terms & Conditions" },
];

export default function Footer() {
    return (
        <section className="py-16 border-t border-white/10">
            <div className="container">
                <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-6">
                    <div>
                        <Link href="/" className="flex items-center gap-2">
                          <BrainCircuit className="h-8 w-8 text-blue-400" />
                          <span className="font-bold text-xl text-white">LearnWise</span>
                        </Link>
                    </div>
                    <div>
                        <nav className="flex gap-6">
                            {footerLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-white/70 hover:text-white text-sm "
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        </section>
    );
}
