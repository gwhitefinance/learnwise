
"use client";

import Tag from "@/sections/Tag";
import IntegrationColumn from "@/sections/IntegrationColumn";
import { type IntegrationsType } from "@/sections/Integrations";
import Image from "next/image";

const integrations = [
    {
        name: "Figma",
        icon: "/assets/images/images/figma-logo.svg",
        description: "Figma is a collaborative interface design tool.",
    },
    {
        name: "Notion",
        icon: "/assets/images/images/notion-logo.svg",
        description: "Notion is an all-in-one workspace for notes and docs.",
    },
    {
        name: "Slack",
        icon: "/assets/images/images/slack-logo.svg",
        description: "Slack is a powerful team communication platform.",
    },
    {
        name: "Relume",
        icon: "/assets/images/images/relume-logo.svg",
        description: "Relume is a no-code website builder and design system.",
    },
    {
        name: "Framer",
        icon: "/assets/images/images/framer-logo.svg",
        description: "Framer is a professional website prototyping tool.",
    },
    {
        name: "GitHub",
        icon: "/assets/images/images/github-logo.svg",
        description: "GitHub is the leading platform for code collaboration.",
    },
];

export type IntegrationsType = typeof integrations;

export default function Integrations() {
    return (
        <section className="py-24 overflow-hidden ">
            <div className="container">
                <div className="grid lg:grid-cols-2 items-center lg:gap-16">
                    <div>
                        <Tag>Integration</Tag>
                        <h2 className="text-6xl font-medium mt-6">
                            Plays well with{" "}
                            <span className="text-lime-400 ">others</span>
                        </h2>

                        <p className="text-white/50 mt-4 text-lg ">
                            Layers seamessly connects with your favourite tools
                            and platforms. It's easy to plug into any workflow
                            and collaborate platforms.
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
