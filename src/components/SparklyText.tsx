'use client';

import React, { useEffect, useRef } from 'react';

const SparklyText = ({ text }: { text: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const textEl = textRef.current;
        if (!container || !textEl) return;

        const emojis = ['🎅', '❄️', '⛄', '🎄'];
        const intervalId = setInterval(() => {
            const rect = textEl.getBoundingClientRect();
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            
            // Get position relative to the container for correct placement
            const containerRect = container.getBoundingClientRect();
            const left = (rect.left - containerRect.left + Math.random() * rect.width);
            const top = (rect.top - containerRect.top + Math.random() * rect.height);
            
            sparkle.style.left = `${left}px`;
            sparkle.style.top = `${top}px`;
            sparkle.style.animationDelay = Math.random() * 0.5 + 's';
            
            container.appendChild(sparkle);

            setTimeout(() => sparkle.remove(), 2000);
        }, 150);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div ref={containerRef} className="relative inline-block">
            <span ref={textRef} className="sparkly-text-effect">
                {text}
            </span>
             <div className="star" style={{ top: '-40px', left: '-30px', animationDelay: '0s' }}>✨</div>
            <div className="star" style={{ top: '-50px', right: '-40px', animationDelay: '0.5s' }}>⭐</div>
            <div className="star" style={{ bottom: '-40px', left: '20px', animationDelay: '1s' }}>✨</div>
            <div className="star" style={{ bottom: '-30px', right: '30px', animationDelay: '0.3s' }}>⭐</div>
        </div>
    );
};

export default SparklyText;
