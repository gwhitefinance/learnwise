
'use client';

import React from 'react';

const SparklyText = ({ text }: { text: string }) => {
    return (
        <span style={{
            fontFamily: "'Comic Sans MS', 'Arial Black', sans-serif",
            color: '#fff',
            textShadow: '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00, 0 0 40px #00ff00'
        }}>
            {text}
        </span>
    );
};

export default SparklyText;
