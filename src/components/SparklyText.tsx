
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
        </div>
    );
};

export default SparklyText;
