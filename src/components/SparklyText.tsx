
'use client';

import React from 'react';

const SparklyText = ({ text }: { text: string }) => {
    return (
        <span className="text-green-500 font-bold [text-shadow:0_0_10px_rgba(34,197,94,0.5)]">
            {text}
        </span>
    );
};

export default SparklyText;
