
'use client';

import React from 'react';

const SparklyText = ({ text }: { text: string }) => {
    return (
        <span className="text-green-500" style={{ fontFamily: "'Comic Sans MS', 'Arial Black', sans-serif" }}>
            {text}
        </span>
    );
};

export default SparklyText;
