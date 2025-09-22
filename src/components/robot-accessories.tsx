
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
    "Beanie": () => (
        <g transform='translate(55, 10)'>
            <path d='M0 20 C0 -10, 90 -10, 90 20 Z' fill='teal' />
            <circle cx="45" cy="-5" r="8" fill="white" />
        </g>
    ),
    "Cowboy Hat": () => (
        <g transform='translate(50, 10)'>
            <path d='M-10 20 Q50 -30 110 20 L90 20 Q50 10 10 20 Z' fill='#A0522D' />
        </g>
    ),
    "Party Hat": () => (
        <g transform='translate(75, -15)'>
            <path d='M25 0 L-25 45 L50 45 Z' fill='pink' />
            <circle cx="0" cy="15" r="5" fill="yellow" />
            <circle cx="25" cy="25" r="5" fill="cyan" />
            <circle cx="10" cy="35" r="5" fill="lime" />
        </g>
    ),
    "Pumpkin Hat": () => (
        <g transform='translate(65, 5)'>
            <path d='M0,25 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0' fill='#f57d00' />
            <rect x="30" y="-5" width="10" height="10" fill="green" />
        </g>
    ),
    "Witch Hat": () => (
        <g transform='translate(50, -15)'>
            <path d='M0 45 L100 45 L100 35 L0 35 Z' fill='#222' />
            <path d='M50 -30 L10 40 L90 40 Z' fill='#222' />
        </g>
    ),
    "Viking Helmet": () => (
        <g transform="translate(60, 20)">
            <path d="M0 10 C0 -10, 80 -10, 80 10" fill="#C0C0C0" stroke="#A9A9A9" strokeWidth="2" />
            <path d="M-10 0 L-30 -20 L-20 0 Z" fill="#F0E68C" stroke="#B8860B" strokeWidth="1" />
            <path d="M90 0 L110 -20 L100 0 Z" fill="#F0E68C" stroke="#B8860B" strokeWidth="1" />
        </g>
    ),
    "Fedora": () => (
        <g transform="translate(50, 15)">
            <path d="M0 15 L100 15 L100 5 L0 5 Z" fill="#3D2B1F"/>
            <path d="M10 5 Q50 -15 90 5 L 80 5 Q50 -5 20 5 Z" fill="#3D2B1F"/>
        </g>
    ),
    "Chef's Hat": () => (
        <g transform="translate(70, -5)">
            <rect x="0" y="25" width="60" height="10" fill="white" />
            <path d="M0 25 Q15 0, 30 0 T60 25" fill="white" />
            <path d="M-5 10 Q15 -15, 30 -15 T65 10" fill="white" />
            <path d="M-5 20 Q15 5, 30 5 T65 20" fill="white" />
        </g>
    ),
    "Detective Hat": () => (
        <g transform="translate(55, 10)">
            <path d="M0 20 C0 -10, 90 -10, 90 20 Z" fill="#8B4513" />
            <path d="M-10 20 L5 20 L5 10 Z" fill="#8B4513" stroke="black" strokeWidth="1"/>
            <path d="M100 20 L85 20 L85 10 Z" fill="#8B4513" stroke="black" strokeWidth="1"/>
        </g>
    ),
    "Headphones": () => (
        <g transform="translate(45, 35)">
            <path d="M0 0 C0 -40, 110 -40, 110 0" stroke="black" strokeWidth="8" fill="none" />
            <rect x="-15" y="-5" width="30" height="30" rx="5" fill="gray" />
            <rect x="95" y="-5" width="30" height="30" rx="5" fill="gray" />
        </g>
    ),
    "Flower Crown": () => (
        <g transform="translate(55, 20)">
            <path d="M0 0 C15 -15, 75 -15, 90 0" stroke="green" strokeWidth="4" fill="none"/>
            <circle cx="10" cy="-10" r="8" fill="pink" />
            <circle cx="30" cy="-15" r="8" fill="yellow" />
            <circle cx="50" cy="-15" r="8" fill="lightblue" />
            <circle cx="70" cy="-10" r="8" fill="violet" />
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
        <g>
            <path d='M85 105 L100 95 L100 115 Z' fill='red' stroke='black' strokeWidth='2' />
            <path d='M115 105 L100 95 L100 115 Z' fill='red' stroke='black' strokeWidth='2' />
        </g>
    ),
    "Hoodie": () => (
         <g>
            <path d='M70 110 L130 110 L130 150 L70 150 Z' fill='rgba(60,60,60,0.8)' />
            <path d='M85 110 L115 110 L115 120 L85 120 Z' fill='rgba(40,40,40,0.8)' />
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
