
'use client';

import React, { useEffect, useRef } from 'react';

const SparklyText = ({ text }: { text: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    return (
        <div ref={containerRef} className="relative inline-block">
            <span ref={textRef} className="sparkly-text">
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
