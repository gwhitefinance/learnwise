
'use client';

import React from 'react';

const hatComponents: Record<string, React.FC> = {
    "Top Hat": () => (
        <g transform='translate(50, -5)'>
            <path d='M20,30 L80,30 L80,20 L90,20 L90,-10 L10,-10 L10,20 L20,20 Z' fill='black' />
            <rect x='20' y='-12' width='60' height='2' fill='#555' />
        </g>
    ),
    "Propeller Hat": () => (
        <g transform='translate(100, 20)'>
            <path d='M-30 0 C -30 -20, 30 -20, 30 0' fill='gold' />
            <path d='M 0 -30 L 0 -20' stroke='black' strokeWidth='2' />
            <path d='M -20 -25 L 20 -25' stroke='red' strokeWidth='4' style={{ transformOrigin: 'center', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </g>
    ),
    "Crown": () => (
        <g transform='translate(50, 0)'>
            <path d='M10 30 L90 30 L90 20 L80 -10 L60 10 L50 -20 L40 10 L20 -10 L10 20 Z' fill='gold' stroke='black' strokeWidth='2' />
        </g>
    ),
    "Wizard Hat": () => (
        <g transform='translate(50, -10)'>
            <path d='M10 30 L90 30 Q50 20 10 30' fill='#2c3e50' />
            <path d='M50 -40 L20 30 Q50 20 80 30 L50 -40' fill='#2c3e50' />
            <path d='M45 -10 L55 0 L65 -10' stroke='yellow' strokeWidth='3' fill='none' />
            <path d='M40 5 L50 15 L60 5' stroke='yellow' strokeWidth='3' fill='none' />
        </g>
    ),
};

const shirtComponents: Record<string, React.FC> = {
    "T-Shirt": () => (
        <g>
            <path d='M65 110 L135 110 L135 150 L65 150 Z' fill='rgba(255,0,0,0.5)' />
            <path d='M45 120 L65 110 L65 130 L45 130 Z' fill='rgba(255,0,0,0.5)'/>
            <path d='M155 120 L135 110 L135 130 L155 130 Z' fill='rgba(255,0,0,0.5)'/>
        </g>
    ),
    "Bow Tie": () => (
        <g>
            <path d='M85 105 L100 95 L100 115 Z' fill='red' stroke='black' strokeWidth='2' />
            <path d='M115 105 L100 95 L100 115 Z' fill='red' stroke='black' strokeWidth='2' />
        </g>
    )
};

const shoeComponents: Record<string, React.FC> = {
    "Boots": () => (
        <g>
            <rect x='70' y='170' width='25' height='15' rx='5' fill='#8B4513' />
            <rect x='105' y='170' width='25' height='15' rx='5' fill='#8B4513' />
        </g>
    ),
    "Sneakers": () => (
        <g>
            <path d='M70,175 L95,175 L95,185 L70,185 Z' fill='white' />
            <path d='M70,180 L75,175' stroke='red' strokeWidth='2' />
            <path d='M105,175 L130,175 L130,185 L105,185 Z' fill='white' />
            <path d='M105,180 L110,175' stroke='red' strokeWidth='2' />
        </g>
    ),
    "Rocket Boots": () => (
        <g>
            <rect x='65' y='170' width='30' height='20' rx='8' fill='#D3D3D3'/>
            <rect x='105' y='170' width='30' height='20' rx='8' fill='#D3D3D3'/>
            <ellipse cx='80' cy='195' rx='10' ry='5' fill='orange'><animate attributeName='ry' values='5;8;5' dur='0.5s' repeatCount='indefinite' /></ellipse>
            <ellipse cx='120' cy='195' rx='10' ry='5' fill='orange'><animate attributeName='ry' values='5;8;5' dur='0.5s' repeatCount='indefinite' /></ellipse>
        </g>
    ),
};


const DefaultShoes = () => (
    <>
        <rect x="70" y="175" width="20" height="10" rx="5" fill="#333" />
        <rect x="110" y="175" width="20" height="10" rx="5" fill="#333" />
    </>
);


export const Hat: React.FC<{ name?: string }> = ({ name }) => {
    if (!name || name === 'None') return null;
    const Component = hatComponents[name];
    return Component ? <Component /> : null;
};

export const Shirt: React.FC<{ name?: string }> = ({ name }) => {
    if (!name || name === 'None') return null;
    const Component = shirtComponents[name];
    return Component ? <Component /> : null;
};

export const Shoes: React.FC<{ name?: string }> = ({ name }) => {
    if (!name || name === 'None') {
        return <DefaultShoes />;
    }
    const Component = shoeComponents[name];
    return Component ? <Component /> : <DefaultShoes />;
};

