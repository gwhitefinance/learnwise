
'use client';

import React from 'react';

const hatComponents: Record<string, React.FC> = {
    "Top Hat": () => (
        <g transform='translate(60, 40) scale(0.9)'>
            <path d="M 0,30 C 0,25 5,25 10,20 H 70 C 75,25 80,25 80,30 V 28 H 0 Z" fill="#333"/>
            <rect x="15" y="0" width="50" height="25" fill="#333" />
            <rect x="12" y="18" width="56" height="4" fill="#555" />
        </g>
    ),
    "Santa Hat": () => (
        <g transform="translate(65, 20) scale(1.1)">
            <path d="M0 40 L35 0 L70 40 Q 35 55 0 40" fill="red" stroke="white" strokeWidth="2" />
            <circle cx="20" cy="-5" r="10" fill="white" />
            <rect x="-5" y="38" width="80" height="10" fill="white" rx="5" />
        </g>
    ),
    "Reindeer Antlers": () => (
        <g transform="translate(100, 50) scale(0.8)">
            <path d="M-30 0 C-50 -30, -40 -50, -20 -40" stroke="#8B4513" strokeWidth="6" fill="none" />
            <path d="M-25 -20 L-35 -25" stroke="#8B4513" strokeWidth="5" fill="none" />
            <path d="M30 0 C50 -30, 40 -50, 20 -40" stroke="#8B4513" strokeWidth="6" fill="none" />
            <path d="M25 -20 L35 -25" stroke="#8B4513" strokeWidth="5" fill="none" />
        </g>
    ),
    "Propeller Hat": () => (
        <g transform='translate(100, 58)'>
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
        <g transform='translate(62, 45) scale(1)'>
            <path d='M0 20 L75 20 L70 -5 L55 10 L37.5 -15 L20 10 L5 -5 Z' fill='gold' stroke='#f59e0b' strokeWidth='1.5' />
            <circle cx="10" cy="15" r="3" fill="red" />
            <circle cx="37.5" cy="5" r="3" fill="blue" />
            <circle cx="65" cy="15" r="3" fill="green" />
        </g>
    ),
    "Wizard Hat": () => (
        <g transform='translate(50, 5) scale(0.95)'>
            <path d='M-10 50 L110 50 Q50 40 -10 50' fill='#2c3e50' />
            <path d='M50 -20 L20 50 Q50 40 80 50 L50 -20' fill='#2c3e50' />
            <path d='M45 20 L55 30 L65 20' stroke='yellow' strokeWidth='2' fill='none' />
            <path d='M40 35 L50 45 L60 35' stroke='yellow' strokeWidth='2' fill='none' />
        </g>
    ),
    "Beanie": () => (
        <g transform='translate(52, 40)'>
            <path d='M0 15 C0 -15, 95 -15, 95 15 Z' fill='teal' />
            <rect x="0" y="10" width="95" height="10" fill="darkcyan" />
            <circle cx="47.5" cy="-10" r="8" fill="white" />
        </g>
    ),
    "Cowboy Hat": () => (
        <g transform='translate(45, 35)'>
            <path d="M -15,25 C 20,5 90,5 125,25 L 120,25 C 85,15 25,15 -10,25 Z" fill="#A0522D" stroke="#654321" strokeWidth="2" />
            <path d="M 15,22 C 25,0 85,0 95,22 L 85,22 C 75,10 35,10 25,22 Z" fill="#8B4513" />
        </g>
    ),
    "Party Hat": () => (
        <g transform='translate(75, 15)'>
            <path d='M25 0 L0 50 L50 50 Z' fill='pink' />
            <circle cx="25" cy="20" r="4" fill="yellow" />
            <circle cx="15" cy="35" r="4" fill="cyan" />
            <circle cx="35" cy="35" r="4" fill="lime" />
            <circle cx="25" cy="3" r="5" fill="orange" />
        </g>
    ),
    "Pilgrim Hat": () => (
        <g transform="translate(60, 30) scale(0.9)">
            <path d="M0,30 C0,25 5,25 10,20 H 70 C 75,25 80,25 80,30 V 28 H 0 Z" fill="#333"/>
            <rect x="15" y="0" width="50" height="25" fill="#333" />
            <rect x="25" y="15" width="30" height="10" fill="#777" />
            <rect x="30" y="17" width="20" height="6" fill="#f0e68c" />
        </g>
    ),
    "Viking Helmet": () => (
        <g transform="translate(58, 45)">
            <path d="M0 10 C0 -10, 85 -10, 85 10" fill="#C0C0C0" stroke="#A9A9A9" strokeWidth="2" />
            <path d="M-10 5 C-20 -15, 0 -10, -10 5" fill="#F0E68C" stroke="#B8860B" strokeWidth="1.5" />
            <path d="M95 5 C 105 -15, 85 -10, 95 5" fill="#F0E68C" stroke="#B8860B" strokeWidth="1.5" />
        </g>
    ),
    "Fedora": () => (
        <g transform="translate(50, 38)">
            <path d="M-5 15 L105 15 L100 5 L0 5 Z" fill="#3D2B1F"/>
            <path d="M10 5 Q50 -10 90 5 L 80 5 Q50 -2 20 5 Z" fill="#332211"/>
            <rect x="0" y="3" width="100" height="4" fill="#111" />
        </g>
    ),
    "Chef's Hat": () => (
        <g transform="translate(65, 15)">
            <rect x="0" y="35" width="70" height="10" fill="white" stroke="#ccc" strokeWidth="1" />
            <path d="M-5 20 C-15 -10, 30 -20, 35 0 C 40 -20, 85 -10, 75 20 Z" fill="white" stroke="#ccc" strokeWidth="1" />
            <path d="M0 35 C 0 15, 70 15, 70 35" fill="white" stroke="#ccc" strokeWidth="1" />
        </g>
    ),
    "Detective Hat": () => (
        <g transform="translate(52, 35)">
            <path d="M0 20 C0 -10, 95 -10, 95 20 Z" fill="#a05a2c" />
            <path d="M-10 20 L10 20 L5 15 Z" fill="#804515" stroke="black" strokeWidth="1"/>
            <path d="M105 20 L85 20 L90 15 Z" fill="#804515" stroke="black" strokeWidth="1"/>
            <rect x="0" y="18" width="95" height="4" fill="#c77d3f"/>
        </g>
    ),
    "Headphones": () => (
        <g transform="translate(45, 62)">
            <path d="M0 0 C0 -45, 110 -45, 110 0" stroke="black" strokeWidth="8" fill="none" />
            <rect x="-15" y="-10" width="30" height="35" rx="8" fill="gray" />
            <rect x="95" y="-10" width="30" height="35" rx="8" fill="gray" />
            <circle cx="0" cy="5" r="10" fill="#333" />
            <circle cx="110" cy="5" r="10" fill="#333" />
        </g>
    ),
    "Flower Crown": () => (
        <g transform="translate(52, 45)">
            <path d="M0 0 C15 -15, 80 -15, 95 0" stroke="#22c55e" strokeWidth="4" fill="none"/>
            <circle cx="10" cy="-10" r="8" fill="#f472b6" />
            <circle cx="30" cy="-15" r="8" fill="#facc15" />
            <circle cx="50" cy="-17" r="8" fill="#60a5fa" />
            <circle cx="70" cy="-15" r="8" fill="#c084fc" />
            <circle cx="90" cy="-10" r="8" fill="#f87171" />
        </g>
    ),
    "Knight Helmet": () => (
        <g transform="translate(55, 35)">
          <path d="M0 20 C0 -10, 90 -10, 90 20 V 50 H 0 Z" fill="#C0C0C0" stroke="#A9A9A9" strokeWidth="2" />
          <path d="M45 -5 L 45 20" stroke="#A9A9A9" strokeWidth="2" />
          <rect x="15" y="30" width="60" height="5" fill="#A9A9A9" />
          <path d="M-5 15 L 95 15" stroke="#A9A9A9" strokeWidth="3" />
        </g>
    ),
    "Astronaut Helmet": () => (
        <g transform="translate(50, 30)">
            <circle cx="50" cy="40" r="50" fill="white" stroke="#ccc" strokeWidth="2"/>
            <circle cx="50" cy="40" r="35" fill="#222" />
            <circle cx="50" cy="40" r="35" fill="url(#glassReflection)" />
        </g>
    ),
    "Plague Doctor Mask": () => (
        <g transform="translate(50, 50)">
            <path d="M0 0 C0 -20, 80 -20, 80 0 V 30 H 0 Z" fill="#333"/>
            <path d="M40 0 L 100 20 L 40 30 Z" fill="#222" />
            <circle cx="20" cy="5" r="8" fill="#111" />
            <circle cx="60" cy="5" r="8" fill="#111" />
            <circle cx="20" cy="5" r="5" fill="red" opacity="0.7" />
            <circle cx="60" cy="5" r="5" fill="red" opacity="0.7" />
        </g>
    ),
};

const shirtComponents: Record<string, React.FC> = {
    "T-Shirt": () => (
        <path
            d="M 75 125 A 50 50 0 0 1 125 125 V 145 H 75 Z M 75 145 H 125 V 165 H 75 Z"
            transform="translate(0, 10)"
            fill="#3b82f6"
            opacity="0.9"
        />
    ),
    "Ugly Christmas Sweater": () => (
        <g opacity="0.9">
            <path d="M 70 120 C 70 120, 60 190, 60 190 H 140 C 140 190, 130 120, 130 120 C 120 110, 80 110, 70 120 Z" fill="#b91c1c" />
            <text x="85" y="160" fontSize="24" fill="white">🎄</text>
            <rect x="65" y="130" width="70" height="4" fill="#166534"/>
            <rect x="65" y="170" width="70" height="4" fill="#166534"/>
        </g>
    ),
    "Football Jersey": () => (
        <g opacity="0.9">
            <path d="M 70 120 C 70 120, 60 190, 60 190 H 140 C 140 190, 130 120, 130 120 C 120 110, 80 110, 70 120 Z" fill="darkblue" />
            <text x="82" y="170" fontSize="40" fill="white" fontWeight="bold">88</text>
        </g>
    ),
    "Tuxedo": () => (
        <g opacity="0.9">
            <path d="M 70 120 C 70 120, 60 190, 60 190 H 140 C 140 190, 130 120, 130 120 C 120 110, 80 110, 70 120 Z" fill="black" />
            <path d="M 90 120 L 110 120 L 100 170 Z" fill="white" />
            <path d="M 95 125 L 105 125 L 100 140 Z" fill="red" />
        </g>
    ),
    "Lab Coat": () => (
        <g opacity="0.9">
            <path d="M 70 120 C 70 120, 60 190, 60 190 H 140 C 140 190, 130 120, 130 120 C 120 110, 80 110, 70 120 Z" fill="white" stroke="#ccc" strokeWidth="1"/>
            <rect x="80" y="135" width="8" height="15" fill="lightblue" rx="2" />
        </g>
    ),
    "Superhero Cape": () => <path d="M 75 110 C 100 80, 100 80, 125 110 L 140 190 H 60 Z" fill="#dc2626" />,
    "Overalls": () => (
        <g opacity="0.9">
            <path d="M 70 150 C 70 150, 65 190, 65 190 H 135 C 135 190, 130 150, 130 150 Z" fill="#3b82f6" />
            <path d="M 80 150 L 75 120" stroke="#3b82f6" strokeWidth="8" />
            <path d="M 120 150 L 125 120" stroke="#3b82f6" strokeWidth="8" />
        </g>
    ),
    "Hoodie": () => <path d="M 70 120 C 70 120, 60 190, 60 190 H 140 C 140 190, 130 120, 130 120 C 120 110, 80 110, 70 120 Z" fill="#6b7280" opacity="0.9" />,
    "Striped Shirt": () => (
        <g opacity="0.9">
            <path d="M 70 120 C 70 120, 60 190, 60 190 H 140 C 140 190, 130 120, 130 120 C 120 110, 80 110, 70 120 Z" fill="white" />
            <rect x="65" y="130" width="70" height="8" fill="#3b82f6"/>
            <rect x="65" y="150" width="70" height="8" fill="#3b82f6"/>
            <rect x="65" y="170" width="70" height="8" fill="#3b82f6"/>
        </g>
    ),
    "Polka Dot Shirt": () => (
        <g opacity="0.9">
            <path d="M 70 120 C 70 120, 60 190, 60 190 H 140 C 140 190, 130 120, 130 120 C 120 110, 80 110, 70 120 Z" fill="#ef4444" />
            <circle cx="85" cy="140" r="5" fill="white" />
            <circle cx="115" cy="140" r="5" fill="white" />
            <circle cx="100" cy="160" r="5" fill="white" />
        </g>
    ),
    "Sweater": () => <path d="M 70 120 C 70 120, 60 190, 60 190 H 140 C 140 190, 130 120, 130 120 C 120 110, 80 110, 70 120 Z" fill="#fbbf24" opacity="0.9" />,
};


const shoeComponents: Record<string, React.FC> = {
    "Boots": () => (
        <g>
            <rect x='70' y='170' width='25' height='15' rx='5' fill='#8B4513' />
            <rect x='105' y='170' width='25' height='15' rx='5' fill='#8B4513' />
        </g>
    ),
     "Hiking Boots": () => (
        <g>
            <rect x='70' y='170' width='25' height='18' rx='5' fill='#a0522d' />
            <rect x='70' y='180' width='25' height='8' fill='#654321' />
            <rect x='105' y='170' width='25' height='18' rx='5' fill='#a0522d' />
            <rect x='105' y='180' width='25' height='8' fill='#654321' />
        </g>
    ),
     "Moccasins": () => (
        <g>
            <path d='M70 175 L95 175 L90 185 L75 185 Z' fill='#deb887' />
            <path d='M105 175 L130 175 L125 185 L110 185 Z' fill='#deb887' />
            <line x1="75" y1="175" x2="90" y2="175" stroke="#8B4513" strokeWidth="1" strokeDasharray="2,2"/>
            <line x1="110" y1="175" x2="125" y2="175" stroke="#8B4513" strokeWidth="1" strokeDasharray="2,2"/>
        </g>
    ),
     "Pilgrim Shoes": () => (
        <g>
            <path d='M65 175 L100 175 L95 188 L70 188 Z' fill='#222' />
            <path d='M105 175 L140 175 L135 188 L110 188 Z' fill='#222' />
            <rect x='78' y='173' width='10' height='6' fill='#f0e68c' />
            <rect x='118' y='173' width='10' height='6' fill='#f0e68c' />
        </g>
    ),
     "Football Cleats": () => (
        <g>
            <path d='M65 175 L100 175 L95 185 L65 185 Z' fill='black' />
            <rect x='75' y='185' width='5' height='3' fill='white' />
            <rect x='85' y='185' width='5' height='3' fill='white' />
            <path d='M105 175 L140 175 L135 185 L105 185 Z' fill='black' />
            <rect x='115' y='185' width='5' height='3' fill='white' />
            <rect x='125' y='185' width='5' height='3' fill='white' />
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
            <ellipse cx='120' cy='195' rx='10' ry='5' fill='orange'><animate attributeName='ry' values='5;8.5;5' dur='0.5s' repeatCount='indefinite' /></ellipse>
        </g>
    ),
    "Sandals": () => (
        <g>
            <path d='M70 182 L95 182 L95 187 L70 187 Z' fill='#8B4513' />
            <path d='M82 175 C 75 175, 75 182, 82 182' stroke='#A0522D' strokeWidth='3' fill='none'/>
            <path d='M110 182 L135 182 L135 187 L110 187 Z' fill='#8B4513' />
            <path d='M122 175 C 115 175, 115 182, 122 182' stroke='#A0522D' strokeWidth='3' fill='none'/>
        </g>
    ),
    "Formal Shoes": () => (
        <g>
            <path d='M65 175 L100 175 L95 185 L65 185 Z' fill='black' />
            <path d='M100 175 L135 175 L135 185 L105 185 Z' fill='black' />
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
     "Knight Boots": () => (
        <g>
            <path d="M70 170 L95 170 L100 185 L65 185 Z" fill="#A9A9A9" />
            <path d="M105 170 L130 170 L135 185 L100 185 Z" fill="#A9A9A9" />
        </g>
    ),
    "Astronaut Boots": () => (
        <g>
            <rect x="65" y="170" width="30" height="20" rx="8" fill="white" stroke="#ccc" strokeWidth="1" />
            <rect x="105" y="170" width="30" height="20" rx="8" fill="white" stroke="#ccc" strokeWidth="1" />
        </g>
    ),
    "Hover Boots": () => (
        <g>
            <rect x="70" y="175" width="20" height="10" rx="5" fill="#333" />
            <rect x="110" y="175" width="20" height="10" rx="5" fill="#333" />
            <ellipse cx="80" cy="190" rx="15" ry="4" fill="cyan" opacity="0.7" />
            <ellipse cx="120" cy="190" rx="15" ry="4" fill="cyan" opacity="0.7" />
        </g>
    ),
};


const DefaultShoes = () => (
    <>
        <ellipse cx="85" cy="175" rx="15" ry="8" fill="#333" />
        <ellipse cx="115" cy="175" rx="15" ry="8" fill="#333" />
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
