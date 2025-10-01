
"use client";

import Tag from "@/sections/Tag";
import Image from "next/image";
import { motion } from "framer-motion";

const integrations = [
    {
        name: "Google Calendar",
        icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
    },
    {
        name: "Notion",
        icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    },
    {
        name: "Slack",
        icon: "https://cdn.freebiesupply.com/logos/large/2x/slack-logo-icon.png",
    },
    {
        name: "Spotify",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/1982px-Spotify_icon.svg.png",
    },
    {
        name: "Google Drive",
        icon: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
    },
    {
        name: "GitHub",
        icon: "https://cdn.iconscout.com/icon/free/png-256/free-github-icon-svg-png-download-1597554.png?f=webp",
    },
];

export default function Integrations() {
    return (
        <section id="integrations" className="py-24">
            <div className="container text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-center mt-6 text-white">
                    Connects With Your Workflow
                </h2>
                <p className="text-white/70 text-center mt-4 text-lg max-w-2xl mx-auto">
                   LearnWise seamlessly integrates with the tools you already use, making it easy to stay organized and focused.
                </p>

                <div className="flex justify-center mt-12">
                     <div className="relative flex h-full w-full max-w-4xl items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/50 p-12">
                        <div className="grid grid-cols-3 gap-x-8 gap-y-12 md:grid-cols-6">
                            {integrations.map((item, index) => (
                                <motion.div
                                    key={item.name}
                                    className="flex items-center justify-center"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    viewport={{ once: true }}
                                >
                                     <Image
                                        src={item.icon}
                                        alt={`${item.name} logo`}
                                        width={64}
                                        height={64}
                                        className="h-16 w-16 object-contain"
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
