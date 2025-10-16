'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { cn } from '@/lib/utils';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { 'agent-id': string };
        }
    }
}

const ElevenLabsConvaiWidget = ({ agentId, chapterContext }: { agentId: string, chapterContext: string }) => {

    useEffect(() => {
        const widget = document.querySelector('elevenlabs-convai');
        if (widget) {
            const context = `
                This is the context for the chapter you are about to discuss. Use this information to answer the user's questions. Do not mention that you have been given this context unless asked.

                Chapter Context:
                ---
                ${chapterContext}
                ---
            `;
            widget.setAttribute('context', context);
        }
    }, [chapterContext]);

    return (
        <>
            <Script src="https://unpkg.com/@elevenlabs/convai-widget-embed" strategy="lazyOnload" />
            <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
        </>
    );
};

export default ElevenLabsConvaiWidget;
