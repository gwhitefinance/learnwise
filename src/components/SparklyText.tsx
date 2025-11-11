
'use client';

import React from 'react';

const SparklyText = ({ text }: { text: string }) => {
    return (
        <span className="text-blue-400">
            {text}
        </span>
    );
};

export default SparklyText;
