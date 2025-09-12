
"use client"

import dynamic from 'next/dynamic';

const CallToAction = dynamic(() => import('@/sections/CallToAction'), { ssr: false });
const Faqs = dynamic(() => import('@/sections/Faqs'), { ssr: false });
const Features = dynamic(() => import('@/sections/Features'), { ssr: false });
const Footer = dynamic(() => import('@/sections/Footer'), { ssr: false });
const Hero = dynamic(() => import('@/sections/Hero'), { ssr: false });
const Integrations = dynamic(() => import('@/sections/Integrations'), { ssr: false });
const Introduction = dynamic(() => import('@/sections/Introduction'), { ssr: false });
const LogoTicker = dynamic(() => import('@/sections/LogoTicker'), { ssr: false });
const Navbar = dynamic(() => import('@/sections/Navbar'), { ssr: false });


export default function Home() {
    return (
        <main className="bg-black">
            <Navbar />
            <Hero />
            <LogoTicker />
            <Introduction />
            <Features />
            <Integrations />
            <Faqs />
            <CallToAction />
            <Footer />
        </main>
    );
}
