
"use client";

import Tag from "@/sections/Tag";
import IntegrationColumn from "@/sections/IntegrationColumn";
import Image from "next/image";

const integrations = [
    {
        name: "Google Calendar",
        icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
        description: "Sync deadlines and study sessions automatically.",
    },
    {
        name: "Notion",
        icon: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
        description: "Connect your notes and knowledge bases.",
    },
    {
        name: "Slack",
        icon: "https://cdn.freebiesupply.com/logos/large/2x/slack-logo-icon.png",
        description: "Get study reminders and form study groups.",
    },
    {
        name: "Spotify",
        icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/1982px-Spotify_icon.svg.png",
        description: "Play your favorite focus playlists while you study.",
    },
    {
        name: "Google Drive",
        icon: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
        description: "Import documents and notes for analysis.",
    },
    {
        name: "GitHub",
        icon: "https://cdn.iconscout.com/icon/free/png-256/free-github-icon-svg-png-download-1597554.png?f=webp",
        description: "Track coding projects alongside your coursework.",
    },
];

export type IntegrationsType = typeof integrations;

export default function Integrations() {
    return (
        <section id="integrations" className="py-24 overflow-hidden ">
            <div className="container">
                <div className="grid lg:grid-cols-2 items-center lg:gap-16">
                    <div>
                        <Tag>Integration</Tag>
                        <h2 className="text-6xl font-medium mt-6 text-white">
                            Connects with your{" "}
                            <span className="text-blue-500 ">entire world</span>
                        </h2>

                        <p className="text-white/50 mt-4 text-lg ">
                            LearnWise seamlessly connects with the tools you already use for work and school, making it easy to stay organized and focused.
                        </p>
                    </div>
                    <div>
                        <div className="grid md:grid-cols-2 gap-4 lg:h-[800px] h-[400px] lg:mt-0 mt-8 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
                            <IntegrationColumn integrations={integrations} />
                            <IntegrationColumn
                                integrations={integrations.slice().reverse()}
                                className="hidden md:flex"
                                reverse
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
