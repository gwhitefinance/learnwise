
'use client';

import React from 'react';

const SparklyText = ({ text }: { text: string }) => {
    return (
        <span className="text-green-500 font-bubble">
            {text}
        </span>
    );
};

export default SparklyText;
