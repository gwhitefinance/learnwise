
'use client';

import React from 'react';

const hatComponents: Record<string, React.FC> = {
    "Top Hat": () => (
        <g transform='translate(60, 0) scale(0.9)'>
            <path d="M 0,30 C 0,25 5,25 10,20 H 70 C 75,25 80,25 80,30 V 28 H 0 Z" fill="#333"/>
            <rect x="15" y="0" width="50" height="25" fill="#333" />
            <rect x="12" y="18" width="56" height="4" fill="#555" />
        </g>
    ),
    "Propeller Hat": () => (
        <g transform='translate(100, 28)'>
            <path d='M-35 0 C-35 -15, 35 -15, 35 0' fill='#f44336' />
            <path d='M-25,0 L-25,-5 L25,-5 L25,0' fill="#3b82f6" />
            <path d='M 0 -25 L 0 -5' stroke='#333' strokeWidth='3' />
            <g style={{ transformOrigin: 'center', animation: 'spin 0.5s linear infinite' }}>
                <path d='M -20 -25 L 20 -25' stroke='yellow' strokeWidth='5' strokeLinecap='round' />
            </g>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </g>
    ),
    "Crown": () => (
        <g transform='translate(62, 15)'>
            <path d='M0 20 L75 20 L70 -5 L55 10 L37.5 -15 L20 10 L5 -5 Z' fill='gold' stroke='#f59e0b' strokeWidth='1.5' />
            <circle cx="10" cy="15" r="3" fill="red" />
            <circle cx="37.5" cy="5" r="3" fill="blue" />
            <circle cx="65" cy="15" r="3" fill="green" />
        </g>
    ),
    "Wizard Hat": () => (
        <g transform='translate(50, 0) scale(0.95)'>
            <path d='M-10 50 L110 50 Q50 40 -10 50' fill='#2c3e50' />
            <path d='M50 -20 L20 50 Q50 40 80 50 L50 -20' fill='#2c3e50' />
            <path d='M45 20 L55 30 L65 20' stroke='yellow' strokeWidth='2' fill='none' />
            <path d='M40 35 L50 45 L60 35' stroke='yellow' strokeWidth='2' fill='none' />
        </g>
    ),
    "Beanie": () => (
        <g transform='translate(52, 20)'>
            <path d='M0 15 C0 -15, 95 -15, 95 15 Z' fill='teal' />
            <rect x="0" y="10" width="95" height="10" fill="darkcyan" />
            <circle cx="47.5" cy="-10" r="8" fill="white" />
        </g>
    ),
    "Cowboy Hat": () => (
        <g transform='translate(45, 15)'>
            <path d="M -15,25 C 20,5 90,5 125,25 L 120,25 C 85,15 25,15 -10,25 Z" fill="#A0522D" stroke="#654321" strokeWidth="2" />
            <path d="M 15,22 C 25,0 85,0 95,22 L 85,22 C 75,10 35,10 25,22 Z" fill="#8B4513" />
        </g>
    ),
    "Party Hat": () => (
        <g transform='translate(75, 5)'>
            <path d='M25 0 L0 50 L50 50 Z' fill='pink' />
            <circle cx="25" cy="20" r="4" fill="yellow" />
            <circle cx="15" cy="35" r="4" fill="cyan" />
            <circle cx="35" cy="35" r="4" fill="lime" />
            <circle cx="25" cy="3" r="5" fill="orange" />
        </g>
    ),
    "Pumpkin Hat": () => (
        <g transform='translate(65, 10)'>
            <path d='M0,25 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0' fill='#f57d00' />
            <rect x="30" y="-8" width="10" height="15" rx="3" fill="green" />
        </g>
    ),
    "Witch Hat": () => (
        <g transform='translate(45, 10) scale(0.9)'>
            <path d='M-10 40 L115 40 L115 30 L-10 30 Z' fill='#222' />
            <path d='M55 -15 L20 35 L90 35 Z' fill='#222' />
            <rect x="15" y="28" width="70" height="7" fill="#4A00B4" />
        </g>
    ),
    "Viking Helmet": () => (
        <g transform="translate(58, 25)">
            <path d="M0 10 C0 -10, 85 -10, 85 10" fill="#C0C0C0" stroke="#A9A9A9" strokeWidth="2" />
            <path d="M-10 5 C-20 -15, -30 -5, -10 5" fill="#F0E68C" stroke="#B8860B" strokeWidth="1.5" />
            <path d="M95 5 C 105 -15, 115 -5, 95 5" fill="#F0E68C" stroke="#B8860B" strokeWidth="1.5" />
        </g>
    ),
    "Fedora": () => (
        <g transform="translate(50, 18)">
            <path d="M-5 15 L105 15 L100 5 L0 5 Z" fill="#3D2B1F"/>
            <path d="M10 5 Q50 -10 90 5 L 80 5 Q50 -2 20 5 Z" fill="#332211"/>
            <rect x="0" y="3" width="100" height="4" fill="#111" />
        </g>
    ),
    "Chef's Hat": () => (
        <g transform="translate(65, -5)">
            <rect x="0" y="35" width="70" height="10" fill="white" stroke="#ccc" strokeWidth="1" />
            <path d="M-5 20 C-15 -10, 30 -20, 35 0 C 40 -20, 85 -10, 75 20 Z" fill="white" stroke="#ccc" strokeWidth="1" />
            <path d="M0 35 C 0 15, 70 15, 70 35" fill="white" stroke="#ccc" strokeWidth="1" />
        </g>
    ),
    "Detective Hat": () => (
        <g transform="translate(52, 15)">
            <path d="M0 20 C0 -10, 95 -10, 95 20 Z" fill="#a05a2c" />
            <path d="M-10 20 L10 20 L5 15 Z" fill="#804515" stroke="black" strokeWidth="1"/>
            <path d="M105 20 L85 20 L90 15 Z" fill="#804515" stroke="black" strokeWidth="1"/>
            <rect x="0" y="18" width="95" height="4" fill="#c77d3f"/>
        </g>
    ),
    "Headphones": () => (
        <g transform="translate(45, 42)">
            <path d="M0 0 C0 -45, 110 -45, 110 0" stroke="black" strokeWidth="8" fill="none" />
            <rect x="-15" y="-10" width="30" height="35" rx="8" fill="gray" />
            <rect x="95" y="-10" width="30" height="35" rx="8" fill="gray" />
            <circle cx="0" cy="5" r="10" fill="#333" />
            <circle cx="110" cy="5" r="10" fill="#333" />
        </g>
    ),
    "Flower Crown": () => (
        <g transform="translate(52, 25)">
            <path d="M0 0 C15 -15, 80 -15, 95 0" stroke="#22c55e" strokeWidth="4" fill="none"/>
            <circle cx="10" cy="-10" r="8" fill="#f472b6" />
            <circle cx="30" cy="-15" r="8" fill="#facc15" />
            <circle cx="50" cy="-17" r="8" fill="#60a5fa" />
            <circle cx="70" cy="-15" r="8" fill="#c084fc" />
            <circle cx="90" cy="-10" r="8" fill="#f87171" />
        </g>
    ),
};

const shirtComponents: Record<string, React.FC> = {
    "T-Shirt": () => (
        <g>
            <path d='M70 110 L130 110 L130 150 L70 150 Z' fill='rgba(255,0,0,0.7)' />
        </g>
    ),
    "Bow Tie": () => (
        <g transform="translate(0, 2)">
            <path d='M85 105 L100 95 L100 115 Z' fill='red' stroke='black' strokeWidth='1' />
            <path d='M115 105 L100 95 L100 115 Z' fill='red' stroke='black' strokeWidth='1' />
            <circle cx="100" cy="105" r="4" fill="darkred" />
        </g>
    ),
    "Hoodie": () => (
         <g>
            <path d='M70 105 L130 105 L130 155 L70 155 Z' fill='rgba(60,60,60,0.8)' />
            <path d='M85 110 L115 110 L115 125 L100 135 L85 125 Z' fill='rgba(40,40,40,0.8)' />
        </g>
    ),
    "Vest": () => (
         <g>
            <path d='M75 105 L125 105 L120 155 L80 155 Z' fill='#8B4513' />
            <path d='M80 105 L120 105 L115 150 L85 150 Z' fill='white' />
        </g>
    ),
    "Ghost Costume": () => (
        <g>
            <path d='M60 100 L140 100 L150 180 L120 170 L100 180 L80 170 L50 180 Z' fill='rgba(255,255,255,0.9)' />
            <circle cx="85" cy="120" r="4" fill="black" />
            <circle cx="115" cy="120" r="4" fill="black" />
        </g>
    ),
    "Striped Shirt": () => (
        <g>
            <path d='M65 105 L135 105 L135 155 L65 155 Z' fill='#fff' />
            <path d='M65 115 L135 115' stroke='#3498db' strokeWidth='8' />
            <path d='M65 135 L135 135' stroke='#3498db' strokeWidth='8' />
        </g>
    ),
    "Polka Dot Shirt": () => (
        <g>
            <path d='M65 105 L135 105 L135 155 L65 155 Z' fill='#e74c3c' />
            <circle cx="80" cy="120" r="5" fill="white" />
            <circle cx="100" cy="115" r="5" fill="white" />
            <circle cx="120" cy="125" r="5" fill="white" />
            <circle cx="85" cy="140" r="5" fill="white" />
            <circle cx="115" cy="145" r="5" fill="white" />
        </g>
    ),
    "Sweater": () => (
        <g>
            <path d='M65 105 L135 105 L135 155 L65 155 Z' fill='#2ecc71' />
            <path d='M80 115 L120 115' stroke='white' strokeWidth='3' />
            <path d='M80 125 L120 125' stroke='white' strokeWidth='3' />
            <path d='M80 135 L120 135' stroke='white' strokeWidth='3' />
            <path d='M80 145 L120 145' stroke='white' strokeWidth='3' />
        </g>
    ),
    "Tuxedo": () => (
        <g>
            <path d='M70 105 L130 105 L130 155 L70 155 Z' fill='black' />
            <path d='M85 105 L115 105 L100 135 Z' fill='white' />
            <circle cx="100" cy="118" r="3" fill="black" />
            <circle cx="100" cy="128" r="3" fill="black" />
             <g transform="translate(0, 2)">
                <path d='M90 105 L100 95 L100 115 Z' fill='black' stroke='black' strokeWidth='1' />
                <path d='M110 105 L100 95 L100 115 Z' fill='black' stroke='black' strokeWidth='1' />
                <circle cx="100" cy="105" r="4" fill="black" />
            </g>
        </g>
    ),
    "Lab Coat": () => (
        <g>
            <path d='M65 105 L135 105 L135 170 L65 170 Z' fill='white' stroke="gray" strokeWidth="1" />
            <path d='M100 105 L100 170' stroke='gray' strokeWidth='0.5' />
            <rect x="75" y="115" width="20" height="5" fill="lightgray" />
        </g>
    ),
    "Superhero Cape": () => (
        <g>
            <path d="M70 110 C 50 150, 150 150, 130 110 C 130 180, 70 180, 70 110" fill="red"/>
        </g>
    ),
    "Overalls": () => (
        <g>
            <path d="M70 130 L130 130 L130 160 L70 160 Z" fill="#3498db" />
            <path d="M70 110 L75 130" stroke="#3498db" strokeWidth="5"/>
            <path d="M130 110 L125 130" stroke="#3498db" strokeWidth="5"/>
            <path d="M85 130 L115 130 L115 140 L85 140 Z" fill="#2980b9" />
        </g>
    ),
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
    "Sandals": () => (
        <g>
            <path d='M70 180 L95 180 L95 185 L70 185 Z' fill='#8B4513' />
            <path d='M75 175 L80 185' stroke='#A0522D' strokeWidth='3' />
             <path d='M105 180 L130 180 L130 185 L105 185 Z' fill='#8B4513' />
            <path d='M110 175 L115 185' stroke='#A0522D' strokeWidth='3' />
        </g>
    ),
    "Formal Shoes": () => (
        <g>
            <path d='M65 175 L100 175 L95 185 L65 185 Z' fill='black' />
            <path d='M100 175 L135 175 L135 185 L105 185 Z' fill='black' />
        </g>
    ),
    "Pumpkin Shoes": () => (
        <g>
            <path d='M65,175 a15,15 0 1,1 30,0 a15,15 0 1,1 -30,0' fill='#f57d00' />
            <path d='M105,175 a15,15 0 1,1 30,0 a15,15 0 1,1 -30,0' fill='#f57d00' />
        </g>
    ),
    "Flip Flops": () => (
        <g>
            <path d='M70 182 L95 182 L95 187 L70 187 Z' fill='cyan' />
            <path d='M82 175 C 75 175, 75 182, 82 182' stroke='blue' strokeWidth='2' fill='none'/>
            <path d='M110 182 L135 182 L135 187 L110 187 Z' fill='cyan' />
            <path d='M122 175 C 115 175, 115 182, 122 182' stroke='blue' strokeWidth='2' fill='none'/>
        </g>
    ),
    "Clogs": () => (
        <g>
            <path d='M65 175 L100 175 L95 190 L65 190 Z' fill='brown' />
            <path d='M105 175 L140 175 L135 190 L105 190 Z' fill='brown' />
        </g>
    ),
    "Ice Skates": () => (
        <g>
            <path d='M65 175 L100 175 L95 185 L65 185 Z' fill='white' />
            <rect x='70' y='185' width='20' height='5' fill='silver' />
            <path d='M105 175 L140 175 L135 185 L105 185 Z' fill='white' />
            <rect x='110' y='185' width='20' height='5' fill='silver' />
        </g>
    ),
    "Roller Skates": () => (
        <g>
            <path d='M65 175 L100 175 L95 185 L65 185 Z' fill='pink' />
            <circle cx='75' cy='190' r='5' fill='yellow' />
            <circle cx='90' cy='190' r='5' fill='yellow' />
            <path d='M105 175 L140 175 L135 185 L105 185 Z' fill='pink' />
            <circle cx='115' cy='190' r='5' fill='yellow' />
            <circle cx='130' cy='190' r='5' fill='yellow' />
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

    

    
